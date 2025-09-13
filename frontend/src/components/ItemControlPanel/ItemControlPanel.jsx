import { useState } from "react";
import { updateItemStatus, updateItemPreference, deleteItem } from "@services/InventoryService";
import styles from "./ItemControlPanel.module.css";
import EditIcon from "@assets/Icons/EditIcon";
import ToggleSwitch from "@components/ToggleSwitch/ToggleSwitch";
import DeleteBinIcon from "@assets/Icons/DeleteBinIcon";
import Button from "@components/Buttons/Button/Button";


export default function ItemControlPanel({ item, navigate }) {
    const [status, setStatus] = useState(item.status);
    const [openToOffers, setOpenToOffers] = useState(item.openToOffers);

    function handleEdit() {
        navigate('/Add-item', { state: { initialItem: item } });
    }

    async function handleDelete() {
        const confirmed = window.confirm("Are you sure you want to delete this item?");
        if (!confirmed) return;

        try {
            await deleteItem(item.id);
            navigate('/');
        } catch (err) {
            console.error("Error deleting item:", err);
            alert("Failed to delete item");
        }
    }

    function handleStatusToggle() {
        setStatus(prevStatus => {
            const newStatus = prevStatus === 'HIDDEN' ? 'ACTIVE' : 'HIDDEN';
            updateItemStatus(item.id, newStatus);
            return newStatus;
        });
    }

   function handleOpenToOffersToggle() {
    setOpenToOffers(prev => {
        const newValue = !prev;
        updateItemPreference(item.id, "openToOffers", newValue)
            .catch(err => {
                console.error("Failed to update preference:", err);
                setOpenToOffers(prev);
            });
        return newValue;
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
    );
}