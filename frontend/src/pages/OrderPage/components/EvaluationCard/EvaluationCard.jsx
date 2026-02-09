import React, { useState } from 'react';
import styles from './EvaluationCard.module.css';
import Button from '@components/Buttons/Button/Button';

export default function EvaluationCard({ ratings, setRatings, comment, setComment, disabled, onSubmit, loaded }) {
    const [submitted, setSubmitted] = useState(false);
    const readOnly = loaded || submitted || disabled;

    const handleRatingChange = (field) => (e) => {
        const val = e.target.value ? parseInt(e.target.value) : null;
        setRatings(prev => ({ ...prev, [field]: val }));
    };

    const handleSubmit = () => {
        onSubmit();
        setSubmitted(true);
    };

    const displayRating = (value) => {
        const labels = ['-', 'Poor', 'Good', 'Very Good', 'Excellent'];
        return labels[value] || '-';
    };

    return (
        <div className={styles.card}>
            <h3 className={styles.title}>Evaluation</h3>

            {['description', 'packaging', 'condition'].map(field => (
                <div key={field} className={styles.row}>
                    <label className={styles.label}>
                        {field === 'description' ? 'Listing description:' :
                            field === 'packaging' ? 'Packaging:' : 'Listing condition:'}
                    </label>
                    {readOnly ? (
                        <span className={styles.value}>{displayRating(ratings[field])}</span>
                    ) : (
                        <select
                            value={ratings[field] ?? ''}
                            onChange={handleRatingChange(field)}
                            className={styles.select}
                        >
                            <option value="" disabled hidden>Select</option>
                            <option value={1}>Poor</option>
                            <option value={2}>Good</option>
                            <option value={3}>Very Good</option>
                            <option value={4}>Excellent</option>
                        </select>
                    )}
                </div>
            ))}

            <div className={styles.commentRow}>
                {(readOnly || submitted) && <label className={styles.label}>Comment</label>}
                {readOnly ? (
                    <span className={styles.commentValue}>{comment || '-'}</span>
                ) : (
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={3}
                        placeholder="Leave your comment here..."
                        className={styles.textarea}
                    />
                )}

            </div>

            {!readOnly && (
                <Button
                    label="Submit"
                    onClick={handleSubmit}
                    variant="submit"
                    width="40%"
                />
            )}
        </div>
    );
}
