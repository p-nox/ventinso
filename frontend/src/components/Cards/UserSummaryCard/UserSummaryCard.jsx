import React from "react";
import styles from "./UserSummaryCard.module.css";
import { Paths, API_BASE_URL } from "@config/Config";
import { getRatingPercentageAndLabel, formatMemberSince } from '@utils/utils';
import { Star, Users, UserCheck, UserPlus, Calendar, Box, Package, Archive } from "lucide-react";
import { Link } from "react-router-dom";

export default function UserSummaryCard({
    avatarUrl,
    username,
    totalItems,
    userId,
    registeredAt,
    avgOverallRating,
    totalRatings
}) {

    const { percentage, label } = getRatingPercentageAndLabel(avgOverallRating);
    return (
        <div className={styles.card}>
            <Link to={Paths.PROFILE(userId)}>
                <img
                    src={`${API_BASE_URL}${avatarUrl}`}
                    alt="User Avatar"
                    className={styles.avatar}
                />
            </Link>
            <div className={styles.info}>

                <Link to={Paths.PROFILE(userId)} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <h3 className={styles.name}>{username}</h3>
                </Link>
                <div className={styles.rating}>
                    {totalRatings > 0 ? (
                        <>
                            <span>{percentage}% {label}</span>
                            <Link to="/" className={styles.link}>
                                {totalRatings} {totalRatings === 1 ? 'review' : 'reviews'}
                            </Link>
                        </>
                    ) : (
                        <span>No reviews yet</span>
                    )}
                </div>

               {/*<div className={styles.followers}>
                    <Users className={styles.icon} />
                    <span>46 followers</span>
                </div>
                 */} 
                <div className={styles.items}>
                    <Archive className={styles.icon} />
                    <span>{totalItems} {totalItems === 1 ? "item" : "items"}</span>
                </div>


                <div className={styles.location}>
                    <Calendar className={styles.icon} />
                    <span>Member Since {formatMemberSince(registeredAt)} </span>
                </div>
            </div>
            
            {/*<button className={styles.addUser}>
                <UserPlus />
                <UserCheck />
            </button>  */} 
        </div>
    );
}

