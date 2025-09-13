import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styles from '@pages/MyProfilePage/MyProfilePage.module.css';
import ReviewsSection from '@components/ReviewsSection/ReviewsSection';
import { getUser } from '@services/UserService';
import ProfileSidebar from '@components/ProfileSidebar/ProfileSidebar';
import ItemGrid from '../../components/ItemGrid/ItemGrid';
import { useAuth } from "@context/AuthContext";

export default function UserProfile() {
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const { userId } = useAuth(); 

    useEffect(() => {
        const includeHidden = userId === id;
        getUser(id, includeHidden)
            .then(response => {
                console.log("User response:", response);
                setUser(response);
            })
            .catch(error => console.error(error));
    }, [id]);

    if (!user) return <p>Loading user profile...</p>;

    return (
        <div className={styles.wrapper}>
            <div className={styles.flexContainer}>
                <ProfileSidebar user={user} />
                <div className={styles.contentWrapper}>
                    <ItemGrid
                        items={user.items}
                        width="100%"
                        showTitle={true}
                        showUserInfo={false}
                        pagable={true}
                        showTabs={Number(userId) === user.userId}
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
