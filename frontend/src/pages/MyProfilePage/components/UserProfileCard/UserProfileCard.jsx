import React from "react";
import styles from "./UserProfileCard.module.css";
import UserCard from "@components/Cards/UserCard/UserCard";
import { UserPen, Calendar, Truck, ShoppingCart, Star, MessageCircle, Package } from "lucide-react";

export default function UserProfileCard({ user, totalItems }) {
    return (
        <div className={styles.wrapper}>
            <Header user={user} />
            <Divider />
            <Bio user={user} iconSize={14} />
            <Divider />
            <Stats user={user} iconSize={14} totalItems={totalItems}/>
            {user.totalRatings > 0 && (
                <>
                    <Divider />
                    <Ratings user={user} />
                </>
            )}
        </div>
    );
}

function Divider() {
    return <div className={styles.divider}></div>;
}

function Header({ user }) {
    return (
        <div className={styles.header}>
            <UserCard
                avatarUrl={user.avatarUrl}
                username={user.username}
                showExtraInfo={false}
                showBorder={false}
                disableLink={true}
            />
        </div>
    );
}

function Bio({ user, iconSize }) {
    const averageDeliveryDays = Math.ceil(user.averageDeliveryTime / 86400);
    const registeredYear = new Date(user.registeredAt).getFullYear();
    const sellerType = user.isProfessional ? "Professional Seller" : "Private Seller";

    function getSellerTag(overall) {
        if (overall >= 3.5) return "Outstanding";
        if (overall >= 2.5) return "Very Good";
        if (overall > 0) return "Good";
        return "";
    }

    return (
        <div className={styles.stats}>
            <BioItem
                icon={<UserPen size={iconSize} />}
                value={`${sellerType} ${getSellerTag(user.avgOverall)}`}
                fullWidth
            />
            <BioItem
                icon={<Calendar size={iconSize} />}
                label="Member Since"
                value={registeredYear}
            />
            <BioItem
                icon={<Truck size={iconSize} />}
                iconStyle={{ marginBottom: '2px' }}
                label="Average Delivery"
                value={`${averageDeliveryDays} ${averageDeliveryDays === 1 ? "day" : "days"}`}
            />
        </div>
    );
}

function BioItem({ icon, iconStyle, label, value, fullWidth = false }) {
    return (
        <div style={fullWidth ? { gridColumn: "1 / -1" } : {}} >
            {label && (
                <p className={styles.label}>
                    {icon && <span className={styles.icon} style={iconStyle}>{icon}</span>} {label}
                </p>
            )}
            <p className={styles.value}>{value}</p>
        </div>
    );
}

function Stats({ user, iconSize, totalItems }) {
    const overallPercentage =
        user.avgOverallRating != null && user.totalRatings
            ? `${Math.round((user.avgOverallRating / 4) * 100)}%`
            : "0";

    return (
        <div className={styles.stats}>
            <StatItem
                icon={<Package size={iconSize} />}
                label="Listings"
                value={totalItems || 0}
            />
            <StatItem
                icon={<ShoppingCart size={iconSize} />}
                label="Sales"
                value={user.totalSales}
            />
            <StatItem
                icon={<Star size={iconSize} />}
                label="Overall Rating"
                value={overallPercentage}
            />
            <StatItem
                icon={<MessageCircle size={iconSize} />} label="Reviews"
                value={user.totalRatings}
            />
        </div>
    );
}

function StatItem({ icon, iconStyle, label, value }) {
    return (
        <div className={styles.statItem}>
            <p className={styles.label}>
                {icon && <span className={styles.icon} style={iconStyle}>{icon}</span>} {label}
            </p>
            <p className={styles.value}>{value}</p>
        </div>
    );
}
function Ratings({ user }) {
    return (
        <div className={styles.ratings}>
            <h3>Detailed Ratings</h3>
            <RatingRow label="Listing Description" value={user.avgDescriptionRating} />
            <RatingRow label="Listing Packaging" value={user.avgPackagingRating} />
            <RatingRow label="Listing Condition" value={user.avgConditionRating} />
        </div>
    );
}

function RatingRow({ label, value }) {
    return (
        <div className={styles.ratingRow}>
            <p>{label}</p>
            <span className={styles.value}>{getRatingLabel(value)}</span>
        </div>
    );
}

function getRatingLabel(value) {
    if (value > 0 && value <= 1) return "Poor";
    if (value > 1 && value <= 2) return "Good";
    if (value > 2 && value <= 3) return "Very Good";
    if (value > 3 && value <= 4) return "Excellent";
}
