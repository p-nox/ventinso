import React, { useState } from 'react';
import styles from './WalletCard.module.css';
import EuroIcon from '@assets/Icons/EuroIcon';
import Button from '@components/Buttons/Button/Button';
import { deposit } from '@services/PaymentService';

export default function Wallet({ balance, userId }) {
    const [loading, setLoading] = useState(false);

   const handleDeposit = async () => {
    try {
        setLoading(true);
        const amount = 50; // needs implementation
        const returnUrl = window.location.href; 
        const response = await deposit(userId, amount, returnUrl);
        console.log()
        const { checkoutUrl } = response;

        // redirect to Stripe
        console.log(checkoutUrl);
        window.location.href = checkoutUrl;
    } catch (err) {
        console.error("Deposit failed:", err);
    } finally {
        setLoading(false);
    }
};


    return (
        <div className={styles.wallet}>
            <div className={styles.balance}>
                <span className={styles.balanceText}>
                    Available Credits
                </span>
                <span className={styles.amount}>
                    {balance}
                    <EuroIcon width={24} height={24} fill="var(--accent-color)" />
                </span>
            </div>

            <div className={styles.btnGroup}>
                <Button
                    label="CREDIT ACCOUNT"
                    onClick={handleDeposit}
                    variant="deposit"
                    disabled={loading}
                />
                <Button
                    label="WITHDRAW CREDIT"
                    variant="withdraw"
                />
            </div>
        </div>
    );
}
