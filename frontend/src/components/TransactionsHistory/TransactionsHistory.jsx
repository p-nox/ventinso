import React, { useState, useEffect } from 'react';
import styles from './TransactionsHistory.module.css';
import TabGroup from '@components/Buttons/TabGroup/TabGroup';
import { getUserPayments } from '@services/PaymentService';
import { useAuth } from '@context/AuthContext';
import Button from '@components/Buttons/Button/Button';
import { Clock, XCircle, CheckCircle } from 'lucide-react';

export default function TransactionsHistory() {
    const { userId } = useAuth();
    const [activeTab, setActiveTab] = useState('deposits');
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        if (!userId) return;

        getUserPayments(userId)
            .then(data => {
                setTransactions(data);
            })
            .catch(err => console.error('Failed to fetch payments:', err));
    }, [userId]);

    const filteredTransactions = transactions.filter(tx =>
        activeTab === 'deposits' ? tx.type === 'deposit' : tx.type === 'withdrawal'
    );

    function renderStatus(status) {
        switch (status) {
            case 'pending':
                return (
                    <span className={styles.pending}>
                        <Clock className={styles.icon} /> Pending
                    </span>
                );
            case 'failed':
                return (
                    <span className={styles.failed}>
                        <XCircle className={styles.icon} /> Failed
                    </span>
                );
            case 'completed':
                return (
                    <span className={styles.completed}>
                        <CheckCircle className={styles.icon} /> Completed
                    </span>
                );
            default:
                return <span>{status}</span>;
        }
    }

    return (
        <div className={styles.wrapper}>
            <h2 className={styles.header}>Transactions History</h2>

            <TabGroup
                tabs={[
                    { key: 'deposits', label: 'Deposits' },
                    { key: 'withdrawals', label: 'Withdrawals' }
                ]}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />

            <div className={styles.transactionList}>
                {filteredTransactions.map(tx => (
                    <div key={tx.id} className={styles.transactionItem}>
                        <div className={styles.left}>
                            <div className={styles.title}>
                                {tx.type === 'deposit' ? 'Deposit' : 'Withdrawal'} -{' '}
                                <span className={styles.txId}>{tx.id}</span>
                            </div>
                            <div className={styles.status}>{renderStatus(tx.status)}</div>
                        </div>
                        <div className={styles.right}>
                            <div className={styles.amount}>{tx.amount} €</div>
                            <div className={styles.date}>{tx.date}</div>

                            {tx.status === 'pending' && tx.paymentUrl && (
                                <Button
                                    variant="pay"
                                    label="Pay Now"
                                    onClick={() => (window.location.href = tx.paymentUrl)}
                                />
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
