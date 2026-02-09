import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { registerAPICall } from '@services/AuthService';
import { useNavigate } from 'react-router-dom';
import styles from './Register.module.css';
import { X } from "lucide-react";

export default function Register({ closeRegister, openLogin }) {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [formErrors, setFormErrors] = useState({});

    const fields = [
        { label: 'Full Name', key: 'name', type: 'text', helper: 'Your full name will not be publicly visible.' },
        { label: 'Username', key: 'username', type: 'text' },
        { label: 'Email', key: 'email', type: 'email' },
        { label: 'Password', key: 'password', type: 'password', helper: 'Use at least 8 characters, including numbers and letters.' },
        { label: 'Confirm Password', key: 'confirmPassword', type: 'password' }
    ];

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
                    closeRegister();
                    navigate("/");
                })
                .catch(error => console.log(error));
        }
    }

    const modalContent = (
        <div className={styles.overlay} onClick={closeRegister}>
            <div className={styles.wrapper} onClick={e => e.stopPropagation()}>


                <button onClick={closeRegister} className={styles.closeButton} aria-label="Close">
                    <X className={styles.closeIcon} />
                </button>

                <div className={styles.header}>
                    <h2 className={styles.title}>Sign up</h2>
                </div>

                <div className={styles.cardBody}>
                    <form onSubmit={handleSubmit} className={styles.form}>
                        {fields.map(({ label, key, type, helper }) => (
                            <div key={key} className={styles.formGroup}>
                                <input
                                    type={type}
                                    name={key}
                                    className={styles.input}
                                    placeholder={label}
                                    value={formData[key]}
                                    onChange={handleChange}
                                />

                                {formErrors[key] ? (
                                    <span className={styles.error}>{formErrors[key]}</span>
                                ) : (
                                    <small className={styles.helperText}>{helper}</small>
                                )}
                            </div>
                        ))}

                        <div className={styles.signupText}>
                            Are you already a member?{" "}
                            <button
                                type="button"
                                className={styles.signupLink}
                                onClick={() => {
                                    closeRegister();
                                    openLogin();
                                }}
                            >
                                Log in
                            </button>
                        </div>

                        <div className={styles.submitWrapper}>
                            <button
                                type="submit"
                                className={styles.submitBtn}
                            >
                                Submit
                            </button>
                        </div>

                    </form>
                </div>

            </div>
        </div>
    );

    return ReactDOM.createPortal(modalContent, document.body);
}
