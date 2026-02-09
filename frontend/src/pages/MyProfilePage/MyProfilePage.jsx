import styles from './MyProfilePage.module.css';
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ReviewsSection, UserProfileCard } from './components';
import { getUser } from '@services/UserService';
import ItemGrid from '@components/ui/ItemGrid/ItemGrid';
import { useAuth } from "@context/AuthContext";

export default function UserProfile() {
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const { userId } = useAuth();

    const [totalItems, setTotalItems] = useState(0);
    const [totalActiveItems, setTotalActiveItems] = useState(0);
    const [totalHiddenItems, setTotalHiddenItems] = useState(0);

    useEffect(() => {
        const includeHiddenItems = Number(userId) === Number(id);

        getUser(id, includeHiddenItems)
            .then(response => {
            
                const normalizedUser = {
                    ...response.user,
                    items: response.userItems
                };

                setUser(normalizedUser);
                setTotalItems(response.totalItems ?? 0);
                setTotalActiveItems(response.totalActiveItems ?? 0);
                setTotalHiddenItems(response.totalHiddenItems ?? 0);
            })
            .catch(error => console.error(error));
    }, [id, userId]);


    if (!user) return <p>Loading user profile...</p>;

    return (
        <div className={styles.wrapper}>
            <div className={styles.flexContainer}>
                <UserProfileCard user={user} totalItems={totalItems} />
                <div className={styles.contentWrapper}>
                    <ItemGrid
                        items={user.items}
                        width="100%"
                        showTitle={true}
                        showUserInfo={false}
                        pagable={true}
                        showTabs={Number(userId) === user.userId}
                        totalActiveItems={totalActiveItems}
                        totalHiddenItems={totalHiddenItems}
                        text={Number(userId) === user.userId ? "My items" : `All ${user.username} listings`}
                    />
                    <ReviewsSection
                        username={user.username}
                        reviews={user.ratings}
                        hasItemGrid={user.items && user.items.length > 0}
                    />
                </div>
            </div>
        </div>
    );
}
