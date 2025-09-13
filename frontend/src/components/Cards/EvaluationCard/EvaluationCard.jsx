import React, { useState } from 'react';
import styles from './EvaluationCard.module.css';
import Button from '@components/Buttons/Button/Button';

export default function EvaluationCard({ ratings, setRatings, comment, setComment, disabled, onSubmit, loaded }) {
    const [submitted, setSubmitted] = useState(false);
    const readOnly = loaded || submitted || disabled;

    function handleRatingChange(field) {
        return (e) => {
            const val = e.target.value ? parseInt(e.target.value) : null;
            setRatings((prev) => ({ ...prev, [field]: val }));
        };
    }

    function handleSubmit() {
        onSubmit();
        setSubmitted(true);
    }

    function displayRating(value) {
        switch (value) {
            case 1: return 'Poor';
            case 2: return 'Good';
            case 3: return 'Very Good';
            case 4: return 'Excellent';
            default: return '-';
        }
    }

    return (
        <div className={styles.wrapper}>
            <h3>Evaluation</h3>

            {['description', 'packaging', 'condition'].map(field => (
                <div key={field} className={styles.row}>
                    <label>
                        {field === 'description' ? 'Listing description:' :
                            field === 'packaging' ? 'Packaging:' : 'Listing condition:'}
                    </label>
                    {readOnly ? (
                        <span>{displayRating(ratings[field])}</span>
                    ) : (
                        <select value={ratings[field] ?? ''} onChange={handleRatingChange(field)}>
                            <option value="" disabled hidden>Select</option>
                            <option value={1}>Poor</option>
                            <option value={2}>Good</option>
                            <option value={3}>Very Good</option>
                            <option value={4}>Excellent</option>
                        </select>
                    )}
                </div>
            ))}

            <div className={styles.evaluationRow}>
                {(readOnly || submitted) && <label>Comment</label>}
                {readOnly ? (
                    <span>{comment || '-'}</span>
                ) : (
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={3}
                        placeholder="Leave your comment here..."
                        className={styles.commentBox}
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
