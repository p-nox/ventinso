import React, { useState, useEffect  } from 'react';
import styles from './WalletCard.module.css';
import { Euro } from 'lucide-react';
import Button from '@components/Buttons/Button/Button';
import { deposit } from '@services/PaymentService';
import { useAuth } from '@context/AuthContext';
import { getBalance } from '@services/UserService';

export default function Wallet() {

    const { userId } = useAuth();
    const [balance, setBalance] = useState(0.00);

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

     useEffect(() => {
            if (!userId) return;
        
            getBalance(userId)
                .then((data) => setBalance(data.balance))
                .catch((err) => {
                    console.error('Failed to fetch balance:', err);
                    setBalance(0);
                })
                
        }, [userId]);

    return (
        <div className={styles.wallet}>

            <div className={styles.balance}>

                <span className={styles.balanceText}>
                    Available Credits
                </span>

                <span className={styles.amount}>
                    {balance}
                    <Euro size={25} className={styles.icon} />

                </span>

            </div>

            <div className={styles.btnGroup}>

                <Button
                    label="CREDIT ACCOUNT"
                    onClick={handleDeposit}
                    variant="deposit"
                    
                />

                <Button
                    label="WITHDRAW CREDIT"
                    variant="withdraw"
                />

            </div>

        </div>
    );
}
