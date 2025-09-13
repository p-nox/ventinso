import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import styles from './OrderPage.module.css';
import { getOrder, confirmOrderProgress } from '@services/OrderService.js';
import { createRating, getRating } from '@services/UserService.js';
import { useAuth } from '@context/AuthContext.jsx';
import EvaluationCard from '@components/Cards/EvaluationCard/EvaluationCard';
import OrderPageButtons from '@components/Buttons/OrderPageButtons/OrderPageButtons';
import OrderDetails from '@components/OrderDetails/OrderDetails';

export default function OrderPage() {
    const { id } = useParams();
    const { userId } = useAuth();

    const [order, setOrder] = useState(null);
    const [ratings, setRatings] = useState({
        description: null,
        packaging: null,
        condition: null
    });
    const [comment, setComment] = useState("");


    const mockShippingAddress = {
        name: 'John Doe',
        address: '123 Main Street',
        postCodeCity: '10001 New York',
        country: 'USA'
    };

    useEffect(() => {
        getOrder(id)
            .then(async response => {
                setOrder({ ...response, shippingAddress: mockShippingAddress });
               
                if (response.ratingSubmitted) {
                    try {
                        const rating = await getRating(response.id);
                        setRatings({
                            description: rating.listingDescription ?? '',
                            packaging: rating.listingPackaging ?? '',
                            condition: rating.listingCondition ?? ''
                        });
                        setComment(rating.comment ?? '');
                    } catch (error) {
                        console.error("Error fetching rating:", error);
                    }
                }

            })
            .catch(console.error);
    }, [id]);

    async function handleConfirmClick() {
        try {
            const response = await confirmOrderProgress(id, userId);
            setOrder(prev => ({
                ...prev,
                sentAt: response.sentAt ?? prev.sentAt,
                arrivedAt: response.arrivedAt ?? prev.arrivedAt,
                status: response.status ?? prev.status
            }));
        } catch (error) {
            console.error('Error confirming order:', error);
        }
    }

    if (!order) return <div>Loading...</div>;

    const role = Number(userId) === order.sellerId ? 'seller' :
        Number(userId) === order.buyerId ? 'buyer' :
            'guest';

    const showEvaluationSection = order.status.toUpperCase() === 'COMPLETED';
    const hasEvaluation = order.evaluation && Object.values(order.evaluation || {}).some(val => val && val !== '');

    return (
        <div className={styles.wrapper}>
            <div className={styles.header}>
                <h2>Order #{order.id}</h2>
            </div>

            <div className={styles.content}>
                <OrderDetails order={order} />
                <div className={styles.sideWrapper}>
                    <OrderPageButtons
                        role={role}
                        paidAt={order.paidAt}
                        sentAt={order.sentAt}
                        arrivedAt={order.arrivedAt}
                        onConfirm={handleConfirmClick}
                        sellerUsername={order.sellerUsername}
                        buyerUsername={order.buyerUsername}
                        status={order.status}
                    />
                    {showEvaluationSection && (
                        <EvaluationCard
                            ratings={ratings}
                            setRatings={setRatings}
                            comment={comment}
                            setComment={setComment}
                            disabled={hasEvaluation}
                            loaded={order.ratingSubmitted}
                            onSubmit={async () => {
                                try {
                                    const payload = {
                                        reviewerId: Number(userId),
                                        revieweeId: order.sellerId,
                                        orderId: order.id,
                                        listingDescription: ratings.description,
                                        listingPackaging: ratings.packaging,
                                        listingCondition: ratings.condition,
                                        comment: comment
                                    };
                                    console.log('Payload:', payload);
                                    const data = await createRating(payload);
                                    console.log('Evaluation submitted successfully:', data);
                                } catch (error) {
                                    console.error('Error submitting evaluation:', error);
                                }
                            }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}


