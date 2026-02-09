import React, { useState, useEffect } from "react";
import styles from "./AccountInfo.module.css";
import { useAuth } from "@context/AuthContext";
import UserCard from "@components/Cards/UserCard/UserCard";
import { useAccountInfo } from "@hooks/useAccountInfo";
import Button from "@components/Buttons/Button/Button";
import axios from "axios";
import { API_BASE_URL, API_URLS } from "@config/Config";
import { CheckCircle, X, Pencil } from "lucide-react";

export default function AccountInfo() {
    const { userId } = useAuth();
    const {
        user,
        editField,
        tempValue,
        inputRef,
        setTempValue,
        handleEdit,
        handleCancel,
        handleSubmit,
        updateAvatar
    } = useAccountInfo(userId);

    const [avatarUrl, setAvatarUrl] = useState(null);
    const { setUserAvatar } = useAuth();


    useEffect(() => {
        if (user?.avatarUrl) {
            setAvatarUrl(user.avatarUrl);
        }
    }, [user]);


    const fields = [
        { label: "Name", key: "name", editable: true },
        { label: "Username", key: "username", editable: false },
        { label: "Email", key: "email", editable: true },
        { label: "Password", key: "password", editable: true },
        { label: "Phone Number", key: "phoneNumber", editable: false },
        { label: "Account Type", key: "accountType", editable: false },
        { label: "Location", key: "location", editable: false },
        { label: "Registration Date", key: "registrationDate", editable: false }
    ];

    const handleAvatarUpload = async (file) => {
        const formData = new FormData();
        formData.append("image", file);

        try {
            const response = await axios.post(
                `${API_BASE_URL}/api/users/${userId}`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            let avatarFileName = response.data.avatarUrl;
                    
            if (avatarFileName) {
              
                const newAvatarUrl = `${API_URLS.AVATAR_FILE(avatarFileName)}?t=${Date.now()}`;

                setAvatarUrl(newAvatarUrl);   // preview
                updateAvatar(avatarFileName); // user state
                console.log("new avatar", avatarFileName);
                setUserAvatar(newAvatarUrl); // navbar icon
                localStorage.setItem("userAvatar", newAvatarUrl);
            }
        } catch (err) {
            console.error("Failed to upload avatar:", err);
        }
    };

    

    

    return (
        <div className={styles.wrapper}>
            <UserCard
                avatarUrl={avatarUrl}
                username={user.username}
                totalSales={user.totalSales}
                sales={user.sales}
                registeredAt={user.registrationDate}
                userId={userId}
                showExtraInfo={false}
                editable={true}
                onAvatarChange={handleAvatarUpload}
            />

            {fields.map(({ label, key, editable }) => {
                const isEditing = editField === key;
                return (
                    <div
                        className={`${styles.field} ${editable && !isEditing ? styles.editable : ""}`}
                        key={key}
                        onClick={() => editable && !isEditing && handleEdit(key)}
                    >
                        <span className={styles.label}>{label}:</span>
                        {isEditing ? (
                            <>
                                <input
                                    ref={inputRef}
                                    className={styles.input}
                                    type={key === "password" ? "password" : "text"}
                                    value={tempValue}
                                    onChange={(e) => setTempValue(e.target.value)}
                                />
                                <Button
                                    icon={CheckCircle}
                                    label="Submit"
                                    onClick={handleSubmit}
                                    iconOnly={true}
                                    variant="submit"
                                    iconProps={{ size: 18 }}
                                    width="15%"
                                />
                                <Button
                                    icon={X}
                                    label={<span>Cancel</span>}
                                    onClick={handleCancel}
                                    iconOnly={true}
                                    variant="cancelForm"
                                    className={styles.iconOnly}
                                    iconProps={{ size: 18 }}
                                />
                            </>
                        ) : (
                            <>
                                <span className={styles.value}>{user[key]}</span>
                                {editable && <Pencil size={18} className={styles.editIcon} />}

                            </>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
