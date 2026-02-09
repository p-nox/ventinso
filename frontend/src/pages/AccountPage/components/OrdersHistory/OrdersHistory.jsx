import React, { useEffect, useState } from "react";
import { getAllOrdersAsBuyer, getAllOrdersAsSeller } from "@services/OrderService";
import { Link } from "react-router-dom";
import { API_URLS, Paths } from "@config/Config";
import { Tag } from "@components/ui";
import styles from "./OrdersHistory.module.css";
import TabGroup from "@components/Buttons/TabGroup/TabGroup";

const STATUS_MAP = {
    All: null,
    Arrived: "Completed",
    Cancelled: "Cancelled",
    Sent: "Pending_Arrival",
    Pending_Delivery: "Pending_Delivery"
};
const baseTabs = [
    { key: "All", label: "All" },
    { key: "Sent", label: "Sent" },
    { key: "Arrived", label: "Arrived" },
    { key: "Cancelled", label: "Cancelled" },
];


export default function OrdersHistory({ userId, defaultType, title }) {
    const [orders, setOrders] = useState([]);
    const [type, setType] = useState(defaultType);
    const [statusFilter, setStatusFilter] = useState("All");

    const fetchOrders = (orderType) => {
        const fetchFn =
            orderType === "buyer"
                ? () => getAllOrdersAsBuyer(userId)
                : () => getAllOrdersAsSeller(userId);

        fetchFn()
            .then((res) => {
                setOrders(res);
            })
            .catch((err) => console.error("Error fetching orders:", err));
        setType(orderType);
    };

    useEffect(() => {
        fetchOrders(defaultType);
    }, [userId, defaultType]);

    const filteredOrders =
        statusFilter === "All"
            ? orders
            : orders.filter(
                (o) =>
                    o.status.toLowerCase() ===
                    STATUS_MAP[statusFilter].toLowerCase()
            );

    const extraTabs = type === "seller" ? [{ key: "Pending_Delivery", label: "Pending Delivery" }] : [];
    const tabs = [...baseTabs.slice(0, 1), ...extraTabs, ...baseTabs.slice(1)];

    return (
        <div className={styles.wrapper}>
            <h2 className={styles.title}>My Orders</h2>
            <TabGroup
                tabs={tabs}
                activeTab={statusFilter}
                onTabChange={setStatusFilter}
            />

            <div className={styles.list}>

                {filteredOrders.map((o) => (
                    <OrderRow key={o.id} order={o} type={type} />
                ))}

            </div>

        </div>
    );
}

function OrderRow({ order, type }) {
    const username = type === "buyer" ? order.sellerUsername : order.buyerUsername;

    return (
        <Link to={Paths.ORDER(order.id)} className={styles.rowLink}>

            <div className={styles.row}>
                <div className={styles.itemSection}>
                    <img
                        src={API_URLS.IMAGE_FILE(order.thumbnailUrl)}
                        alt={order.itemTitle}
                        className={styles.thumbnail}
                    />
                    <div className={styles.itemInfo}>

                        <div className={styles.itemTitle}>{order.itemTitle}</div>

                        <Tag value={order.status} fontSize="0.7rem" />

                    </div>

                </div>

                <div className={styles.userSection}>

                    <span className={styles.username}>{username}</span>

                </div>

                <div className={styles.metaSection}>

                    <div className={styles.price}>{order.price} €</div>

                    <div className={styles.date}>

                        {new Date(order.createdAt).toLocaleDateString()}

                    </div>

                </div>

            </div>

        </Link>
    );
}
