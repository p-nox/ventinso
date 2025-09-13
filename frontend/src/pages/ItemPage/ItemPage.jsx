import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getItem } from '@services/InventoryService';
import { API_BASE_URL } from '@config/Config';
import { useAuth } from '@context/AuthContext';
import { getRelativeTime, formatText } from '@utils/utils';
import ItemCardBig from '@components/Cards/ItemCardBig/ItemCardBig';
import ItemPageButtons from '@components/Buttons/ItemPageButtons/ItemPageButtons';
import ItemControlPanel from '@components/ItemControlPanel/ItemControlPanel';
import styles from './ItemPage.module.css';
import ItemsCarousel from '@components/ItemCarousel/ItemCarousel';
import { Eye, Users } from "lucide-react";
import { Paths } from "@config/Config";
import UserSummaryCard from '@components/Cards/UserSummaryCard/UserSummaryCard';
import Tag from "@components/Tag/Tag";

export default function ItemPage() {
    const { id } = useParams();
    const location = useLocation();
    const { username, userId } = useAuth();
    const navigate = useNavigate();

    const [item, setItem] = useState(null);
    const [mainImage, setMainImage] = useState('');

    const fetchItem = () => {
        getItem(id)
            .then(data => {
                setItem(data);
                console.groupCollapsed(data);
                const defaultImage = data.thumbnailUrl ?? data.imageUrls[0];
                setMainImage(`${API_BASE_URL}${defaultImage}`);
            })
            .catch(console.error);
    };

    useEffect(() => {
        fetchItem();
    }, [id]);

    useEffect(() => {
        if (location.state?.refresh) {
            fetchItem();
        }
    }, [location.state?.refresh]);

    if (!item) return <p>Loading...</p>;

    const isOwner = item.username === username;
    const otherItems = item.userItems.filter(i => Number(i.itemId) !== Number(item.id));

    return (
        <div className={styles.wrapper}>
            <div className={styles.mainColumn}>
                <ItemCardBig key={item.id} item={item} mainImage={mainImage} setMainImage={setMainImage} />
                <ItemsCarousel
                    items={otherItems}
                    username={item.username}
                />

            </div>
            <div className={styles.sideContainer}>
                <UserSummaryCard
                    avatarUrl={item.avatarUrl}
                    username={item.username}
                    userId={item.userId}
                    registeredAt={item.registeredAt}
                    avgOverallRating={item.avgOverallRating ? item.avgOverallRating.toFixed(1) : "0.0"}
                    totalRatings={item.totalRatings}
                    totalItems={item.userItems?.length || 0}
                />
                {isOwner ? (
                    <>
                        <ItemControlPanel item={item} navigate={navigate} />
                        <ItemStats views={item.views} watchers={item.watchersCount} />
                    </>
                ) : (
                    <ItemPageButtons item={item} />
                )}
                <ItemDetails
                    shipping={item.shipping ?? "N/A"}
                    condition={formatText(item.condition) ?? "N/A"}
                    category={item.category ?? "N/A"}
                    published={item.createdAt ? getRelativeTime(item.createdAt) : "N/A"}
                    openToOffers={item.openToOffers}
                />
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
        <div className={styles.container}>
            <StatRow icon={Eye} text={`${views} views`} />
            <StatRow icon={Users} text={`${watchers} watching`} />
        </div>
    );
}


