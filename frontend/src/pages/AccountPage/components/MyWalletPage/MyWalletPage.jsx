import React, { useState } from 'react';
import styles from './MyWalletPage.module.css';
import { TransactionsHistory, WalletCard } from './components';


export default function MyWalletPage() {
  
    const [activeTab, setActiveTab] = useState('deposits');

    return (
        <div className={styles.wrapper}>
            <WalletCard />
            <TransactionsHistory
                activeTab={activeTab}
                setActiveTab={setActiveTab}
            />   
        </div>
    );
}
