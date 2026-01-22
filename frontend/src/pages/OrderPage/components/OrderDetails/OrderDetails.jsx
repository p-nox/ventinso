import React from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL, Paths } from "@config/Config.js";
import styles from './OrderDetails.module.css'
import { Tag } from "@components/ui";
import { formatStatus, formatDateTime } from '@utils/Utils';

export default function OrderDetails({ order }) {
    return (
        <div className={styles.wrapper}>

            <div className={styles.topInfo}>
                <Link
                    to={Paths.PROFILE(order.sellerId)}
                    className={styles.userLink}
                >
                    <strong>{order.sellerUsername}</strong>
                </Link>
                <Tag
                    value={order.status}
                    fontSize="0.9rem"
                    type="tag"
                    formatFn={formatStatus}
                />
            </div>

            <div className={styles.middleInfo}>
                <OrderTimeline
                    paidAt={order.paidAt}
                    sentAt={order.sentAt}
                    arrivedAt={order.arrivedAt}
                />
                <ItemDetails order={order} />
            </div>

            {order.trackingNumber &&
                <div className={styles.trackingContainer}>
                    <p>
                        <strong>Tracking number: </strong>
                        <span className={styles.trackingNumberValue}>{order.trackingNumber}</span>
                    </p>
                </div>
            }

            <div className={styles.bottomInfo}>
                <ShippingAddress shippingAddress={order.shippingAddress} />
                <Summary order={order} />
            </div>

        </div>
    );
}


function OrderTimeline({ paidAt, sentAt, arrivedAt }) {
    const timelineItems = [
        { label: "Paid", value: paidAt },
        { label: "Sent", value: sentAt },
        { label: "Arrived", value: arrivedAt }
    ];

    return (
        <div className={styles.timelineContainer}>
            {timelineItems.map((item, idx) => (
                <div key={idx} className={styles.timelineItem}>
                    {item.label}:{" "}
                    {item.value ? formatDateTime(item.value) : "Pending"}
                </div>
            ))}
        </div>
    );
}

function ItemDetails({ order }) {
    return (
        <div className={styles.itemContainer}>
            <img
                src={`${API_BASE_URL}${order.thumbnailUrl}`}
                alt={`Image of ${order.itemTitle}`}
            />
            <div className={styles.itemDetails}>
                <div className={styles.titleRow}>
                    <Link
                        to={Paths.ITEM(order.itemId)}
                        className={`${styles.userLink} ${styles.itemName}`}
                    >
                        {order.itemTitle}
                    </Link>
                    <span className={styles.itemPrice}>{order.price}€</span>
                </div>
                <p className={styles.itemCondition}>
                    Condition:
                    <Tag
                        value={order.itemCondition} 
                        fontSize="0.8rem"
                        type="tag"
                        margin = "auto 0px auto 0px"                
                    />
                </p>
            </div>
        </div>
    );
}

function ShippingAddress({ shippingAddress }) {
    return (
        <div className={styles.shippingContainer}>
            <h3>Shipping Address</h3>
            <p>{shippingAddress.name}</p>
            <p>{shippingAddress.address}</p>
            <p>{shippingAddress.postCodeCity}</p>
            <p>{shippingAddress.country}</p>
        </div>
    );
}

function Summary({ order }) {
    return (
        <div className={styles.summaryContainer}>
            <h3>Summary</h3>
            <div><span>Subtotal</span><span>€{order.price}</span></div>
            <div><span>Shipping</span><span>€0</span></div>
            <div className={styles.summaryAmount}><span>Total</span><span>€{order.price}</span></div>
        </div>
    );
}

