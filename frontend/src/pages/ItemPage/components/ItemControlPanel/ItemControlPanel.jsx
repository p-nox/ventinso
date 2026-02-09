import { useState, useEffect } from "react";
import { updateItemStatus, updateItemPreference, deleteItem } from "@services/InventoryService";
import styles from "./ItemControlPanel.module.css";
import { EditIcon, DeleteBinIcon } from "@assets/icons";
import { ToggleSwitch } from "@components/ui";
import Button from "@components/Buttons/Button/Button";

export default function ItemControlPanel({ item, navigate, onUpdate }) {


    const [status, setStatus] = useState(item.status);
    const [openToOffers, setOpenToOffers] = useState(item.openToOffers);

    function handleEdit() {
        navigate(`/item/${item.itemId}/add-item`, { state: { initialItem: item } });
    }


     useEffect(() => {
        setStatus(item.status);
        setOpenToOffers(item.openToOffers);
    }, [item]);

    async function handleDelete() {
        const confirmed = window.confirm("Are you sure you want to delete this item?");
        if (!confirmed) return;

        try {
            await deleteItem(item.itemId);
            navigate('/');
        } catch (err) {
            console.error("Error deleting item:", err);
            alert("Failed to delete item");
        }
    }

    function handleStatusToggle() {
        setStatus(prevStatus => {
            const newStatus = prevStatus === 'HIDDEN' ? 'ACTIVE' : 'HIDDEN';
            updateItemStatus(item.itemId, newStatus);
            return newStatus;
        });
    }

    function handleOpenToOffersToggle() {
        const newValue = !openToOffers;
        setOpenToOffers(newValue);

        updateItemPreference(item.itemId, "openToOffers", newValue)
            .then(() => {

                if (onUpdate) onUpdate({ openToOffers: newValue });
            })
            .catch(err => {
                console.error("Failed to update preference:", err);
                setOpenToOffers(prev => !prev);
            });
    }


    return (
        <div className={styles.wrapper}>

            <ToggleSwitch
                label="Visibility:"
                value={status === 'ACTIVE'}
                onChange={handleStatusToggle}
                onLabel="Online"
                offLabel="Hidden"
            />

            <ToggleSwitch
                label="Open to offers:"
                value={openToOffers}
                onChange={handleOpenToOffersToggle}
                onLabel="Accepting"
                offLabel="Not accepting"
            />
<div className={styles.buttonsWrapper}>

            <Button
                icon={EditIcon}
                label="Edit Your Listing"
                onClick={handleEdit}
                iconOnly={true}
                variant="edit"
                iconProps={{ size: 16, color: '#2196F3' }}
            />

            <Button
                icon={DeleteBinIcon}
                iconOnly={true}
                iconProps={{ size: 18, color: 'red' }}
                label="Delete Listing"
                onClick={handleDelete}
                variant="delete"
            />
</div>
        </div>
    );
}