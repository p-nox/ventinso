import React from "react";
import styles from "./UserSummaryCard.module.css";
import { Paths, API_URLS } from "@config/Config";
import { getRatingPercentageAndLabel, formatMemberSince } from '@utils/utils';
import { Calendar, Archive } from "lucide-react";
import { Link } from "react-router-dom";

export default function UserSummaryCard({
    avatar,
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
                    src={`${API_URLS.AVATAR_FILE(avatar)}?t=${Date.now()}`}
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


                <div className={styles.items}>

                    <Archive className={styles.icon} />
                    <span>{totalItems} {totalItems === 1 ? "item" : "items"}</span>

                </div>


                <div className={styles.date}>

                    <Calendar className={styles.icon} />
                    <span>Member Since {formatMemberSince(registeredAt)} </span>

                </div>

            </div>

        </div>
    );
}

