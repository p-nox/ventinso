import React, { useState, useEffect } from "react";
import styles from "./NotificationsSettings.module.css";
import { getSettings, togglePreference } from "@services/NotificationService";

export default function NotificationsSettings({ userId }) {

    const initialSettings = {
        General: [
            { label: "Price Drop Alerts", key: "PRICE_UPDATE", desktop: true, email: true },
        ],
        Security: [
            { label: "Password Change Alerts", key: "PASSWORD_UPDATE", desktop: true, email: true },
        ]
    };

    const [settings, setSettings] = useState(initialSettings);
    const [loading, setLoading] = useState(true);

    // Fetch backend preferences
    useEffect(() => {
        getSettings(userId)
            .then((res) => {
                const settingsFromApi = res.notificationSettings || {};
                const newSettings = {};
                Object.entries(initialSettings).forEach(([category, items]) => {
                    newSettings[category] = items.map((item) => {
                        const apiItem = settingsFromApi[item.key];
                        return {
                            ...item,
                            desktop: apiItem?.desktop ?? item.desktop,
                            email: apiItem?.email ?? item.email,
                        };
                    });
                });
                setSettings(newSettings);
            })
            .catch((err) => console.error("Failed to load notification preferences:", err))
            .finally(() => setLoading(false));
    }, [userId]);


    const toggleSetting = (category, key, type) => {
        setSettings((prev) => {
            const newSettings = {
                ...prev,
                [category]: prev[category].map((item) =>
                    item.key === key ? { ...item, [type]: !item[type] } : item
                ),
            };

         
            const toggledItem = newSettings[category].find((i) => i.key === key);
            togglePreference(userId, { action: key, type, enabled: toggledItem[type] })
                .catch((err) => console.error("Failed to toggle preference:", err));

            return newSettings;
        });
    };


    return (
        <div className={styles.wrapper}>
            <h2 className={styles.title}>Notifications</h2>
            <div className={styles.headerRow}>
                <span className={styles.label}></span>
                <span className={styles.columnHeader}>Desktop</span>
                <span className={styles.columnHeader}>Email</span>
            </div>

            {Object.entries(settings).map(([category, items]) => (
                <div key={category} className={styles.category}>
                    <h3 className={styles.categoryTitle}>{category}</h3>

                    {items.map(({ label, key, desktop, email }) => (
                        <div key={key} className={styles.field}>
                            <span className={styles.label}>{label}</span>

                            <label className={styles.switch}>
                                <input
                                    type="checkbox"
                                    checked={desktop}
                                    onChange={() => toggleSetting(category, key, "desktop")}
                                />
                                <span className={styles.slider}></span>
                            </label>

                            <label className={styles.switch}>
                                <input
                                    type="checkbox"
                                    checked={email}
                                    onChange={() => toggleSetting(category, key, "email")}
                                />
                                <span className={styles.slider}></span>
                            </label>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}
