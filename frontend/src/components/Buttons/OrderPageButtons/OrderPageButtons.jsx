import React from "react";
import Button from "@components/Buttons/Button/Button";
import styles from "./OrderPageButtons.module.css";

export default function OrderPageButtons({
    role,
    paidAt,
    sentAt,
    arrivedAt,
    status, 
    onConfirm,
    buyerUsername,
    sellerUsername
}) {
    const contactUsername =
        role === "seller"
            ? buyerUsername
            : role === "buyer"
                ? sellerUsername
                : null;

    return (
        <div className={styles.wrapper}>
            {contactUsername && (
                <Button
                    variant="contact"
                    label={`Contact ${contactUsername}`}
                    onClick={() => console.log("Contact", contactUsername)}
                />
            )}

            {role === "seller" && paidAt && !sentAt && (
                <Button
                    variant="sent"
                    label="Confirm Delivery"
                    onClick={onConfirm}
                />
            )}

            {role === "buyer" && sentAt && !arrivedAt && (
                <Button
                    variant="arrived"
                    label="Confirm Arrival"
                    onClick={onConfirm}
                />
            )}

          
            {role !== "guest" && status === "PENDING_DELIVERY" && (
                <Button
                    variant="cancel"
                    label="Cancel Order"
                    onClick={() => console.log("Cancel order")}
                />
            )}
        </div>
    );
}
