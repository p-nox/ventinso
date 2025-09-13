import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { registerAPICall } from '@services/AuthService';
import { useNavigate } from 'react-router-dom';
import styles from './Register.module.css';
import CloseButton from '@assets/Icons/CloseIcon';

export default function Register({ onClose }) {
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [formErrors, setFormErrors] = useState({});
    const navigate = useNavigate();

    function handleChange(e) {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }

    function validateForm() {
        const errors = {};
        const { name, username, email, password, confirmPassword } = formData;

        if (!name.trim()) errors.name = 'Name is required';
        if (!username.trim()) errors.username = 'Username is required';
        if (!email.trim()) errors.email = 'Email is required';
        if (!password.trim()) errors.password = 'Password is required';
        if (!confirmPassword.trim()) errors.confirmPassword = 'Please verify your password';
        else if (confirmPassword !== password) errors.confirmPassword = 'Passwords do not match';

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    }

    function handleSubmit(e) {
        e.preventDefault();
        if (validateForm()) {
            const { name, username, email, password } = formData;
            registerAPICall({ name, username, email, password })
                .then(() => {
                    onClose();
                    navigate("/");
                })
                .catch(error => console.log(error));
        }
    }


    const modalContent = (
        <div
            className={styles.overlay}
            onClick={onClose}
        >
            <div
                className={styles.cardWrapper}
                onClick={e => e.stopPropagation()}
            >
                <div className={styles.cardHeader}>
                    <h2 className={styles.title}>Sign up</h2>
                    <button onClick={onClose} className={styles.closeBtn}>
                        <CloseButton
                            size={24}
                            color={'#fff'}
                        />
                    </button>
                </div>
                <div className={styles.cardBody}>
                    <form onSubmit={handleSubmit} className={styles.form}>
                        {['name', 'username', 'email', 'password', 'confirmPassword'].map(field => (
                            <div key={field} className={styles.formGroup}>
                                <label className={styles.label}>
                                    {field === 'confirmPassword' ? 'Verify Password' : field.charAt(0).toUpperCase() + field.slice(1)}
                                </label>
                                <input
                                    type={field.includes('password') ? 'password' : field === 'email' ? 'email' : 'text'}
                                    name={field}
                                    className={styles.input}
                                    placeholder={`Enter ${field === 'confirmPassword' ? 'password again' : field}`}
                                    value={formData[field]}
                                    onChange={handleChange}
                                />
                                {formErrors[field] && <span className={styles.error}>{formErrors[field]}</span>}
                            </div>
                        ))}
                        <div className={styles.submitWrapper}>
                            <button type='submit' className={styles.submitBtn}>Submit</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
    return ReactDOM.createPortal(modalContent, document.body);
}
