import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getItem } from '@services/InventoryService';
import { API_BASE_URL, Paths } from '@config/Config';
import { useAuth } from '@context/AuthContext';
import { getRelativeTime, formatText } from '@utils/utils';
import { ItemPageButtons, ItemControlPanel, ItemCardBig, UserSummaryCard, Breadcrumbs } from './components';
import styles from './ItemPage.module.css';
import { Eye, Users } from "lucide-react";
import { Tag, SectionTitle } from "@components/ui";
import ItemGrid from '@components/ui/ItemGrid/ItemGrid';

export default function ItemPage({ openLogin }) {
    const { itemId } = useParams();
    const { username, userId } = useAuth();
    const navigate = useNavigate();
    const [item, setItem] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const [otherItems, setOtherItems] = useState([]);
    const [mainImage, setMainImage] = useState('');
    const moreItemsRef = useRef(null);

    const fetchItem = () => {
        getItem(itemId, userId)
            .then(response => {
                if (!response) return;
              console.log("[ItemPage] getItem response:", response);
                const mappedItem = {
                    itemId: response.item.itemId,
                    title: response.item.title,
                    description: response.item.description,
                    price: response.item.price,
                    status: response.item.status,
                    openToOffers: response.item.openToOffers,
                    pickUpByAppointment: response.item.pickUpByAppointment,
                    condition: response.item.condition,
                    category: response.item.category,
                    type: response.item.type,
                    views: response.item.views,
                    totalItems: response.item.totalItems,
                    watchers: response.item.watchers,
                    createdAt: response.item.createdAt,
                    thumbnailUrl: response.item.thumbnailUrl,
                    imageUrls: response.item.imageUrls
                };
                const mappedUser = {
                    userId: response.user.userId,
                    username: response.user.username,
                    avatarUrl: response.user.avatarUrl,
                    registeredAt: response.user.registeredAt,
                    avgOverallRating: response.user.avgOverallRating,
                    totalRatings: response.user.totalRatings
                };


                setItem(mappedItem);
                setUserInfo(mappedUser);

                const defaultImage = mappedItem.thumbnailUrl ?? mappedItem.imageUrls?.[0];
                setMainImage(`${API_BASE_URL}${defaultImage}`);

                const otherItems = response.item.listOfUserItems.filter(i => Number(i.itemId) !== Number(mappedItem.itemId));
                setOtherItems(otherItems);

            })
            .catch(console.error);
    };

    useEffect(() => {
        if (!itemId) return;
        fetchItem();
    }, [itemId]);

    const scrollToMoreItems = () => {
        if (moreItemsRef.current) {
            const top = moreItemsRef.current.getBoundingClientRect().top + window.scrollY;
            const headerOffset = 80;
            window.scrollTo({ top: top - headerOffset, behavior: 'smooth' });
        }
    };


    

    if (!item || !userInfo) return <p>Loading...</p>;

    const isOwner = userInfo.username === username;

    return (
        <div className={styles.wrapper}>

            <div className={styles.mainColumn}>
                <Breadcrumbs category={item.category} />
                <ItemCardBig key={item.itemId} item={item} itemOwnerId={userInfo.userId} mainImage={mainImage} setMainImage={setMainImage} />

                {otherItems.length > 0 &&
                    <div ref={moreItemsRef} className={styles.moreItemsSection}>
                        <SectionTitle text={`More items from ${userInfo.username}`} onClick={scrollToMoreItems} />
                        <ItemGrid
                            items={otherItems}
                            width="100%"
                            showTitle={false}
                            showUserInfo={false}
                            pagable={true}
                            showTabs={false}
                            enableStatusFilter={false}
                            cardSize={{ minWidth: '220px', maxWidth: '220px' }}
                        />
                    </div>
                }
            </div>

            <div className={styles.sideContainer}>
                <UserSummaryCard
                    avatar={userInfo.avatarUrl}
                    username={userInfo.username}
                    userId={userInfo.userId}
                    registeredAt={userInfo.registeredAt}
                    avgOverallRating={userInfo.avgOverallRating?.toFixed(1) ?? "0.0"}
                    totalRatings={userInfo.totalRatings}
                    totalItems={item.totalItems}
                />
                <Divider />

                <ItemDetails
                    shipping={item.shipping ?? "N/A"}
                    condition={formatText(item.condition) ?? "N/A"}
                    category={item.category ?? "N/A"}
                    published={item.createdAt ? getRelativeTime(item.createdAt) : "N/A"}
                    openToOffers={item.openToOffers}
                />

                <Divider />

                {isOwner ? (
                    <>
                        <ItemControlPanel
                            item={item}
                            navigate={navigate}
                            onUpdate={(updatedItem) => setItem(prev => ({ ...prev, ...updatedItem }))}
                        />

                        <ItemStats views={item.views} watchers={item.watchers} />
                    </>
                ) : (
                    <ItemPageButtons item={item} user={userInfo} openLogin={openLogin} />
                )}
            </div>

        </div>
    );
}




function InfoRow({ label, value }) {
    return (
        <div className={styles.infoRow}>

            <span className={styles.label}>{label}</span>
            <span className={styles.value}>{value}</span>

        </div>
    );
}

function ItemDetails({ shipping, condition, category, published, openToOffers }) {
    const navigate = useNavigate();

    const handleCategoryClick = () => {
        navigate({
            pathname: Paths.HOME,
            search: `?category=${encodeURIComponent(category)}`
        });
    };

    return (
        <div className={styles.container}>

            <InfoRow label="Shipping" value={shipping} />
            <InfoRow label="Condition" value={condition} />
            <InfoRow
                label="Category"
                value={
                    <span
                        className={styles.categoryLink}
                        onClick={handleCategoryClick}
                    >
                        {formatText(category)}
                    </span>
                }
            />
            <InfoRow label="Published" value={published} />

            {openToOffers &&
                <Tag value="Flexible Price" fontSize="0.75rem" />
            }
        </div>
    );
}


function StatRow({ icon: Icon, text }) {
    return (
        <div className={styles.statRow}>
            <Icon size={20} className={styles.icon} />
            <span className={styles.text}>{text}</span>

        </div>
    );
}

function ItemStats({ views, watchers }) {
    return (
        <div className={styles.statsContainer}>

            <StatRow
                icon={Eye}
                text={`${views} view${views === 1 ? '' : 's'}`}
            />
            <StatRow icon={Users} text={`${watchers} watching`} />

        </div>
    );
}


function Divider({ margin = "1rem 0" }) {
    return (
        <div
            className={styles.divider}
            style={{ margin }}
        />
    );
}