import React, { useState, useEffect } from 'react';
import styles from './MyWalletPage.module.css';
import { TransactionsHistory, WalletCard } from './components';
import { getBalance } from '@services/UserService';
import { useAuth } from '@context/AuthContext';

export default function MyWalletPage() {
    const { userId } = useAuth();
    const [balance, setBalance] = useState(null);
    const [activeTab, setActiveTab] = useState('deposits');

    useEffect(() => {
        if (!userId) return;
        getBalance(userId)
            .then((data) => setBalance(data.balance))
            .catch((err) => {
                console.error('Failed to fetch balance:', err);
                setBalance(0);
            });
    }, [userId]);

    return (
        <div className={styles.wrapper}>
            <WalletCard balance={balance !== null ? balance.toFixed(2) : '—'} userId={userId}/>
            <TransactionsHistory
                activeTab={activeTab}
                setActiveTab={setActiveTab}
            />
        </div>
    );
}
