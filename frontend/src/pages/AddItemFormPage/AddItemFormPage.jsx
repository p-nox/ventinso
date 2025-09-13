import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './AddItemFormPage.module.css';
import DropdownArrow from '@assets/Icons/DropdownArrow';
import MultiImageUpload from '@components/MultiImageUpload/MultiImageUpload';
import PriceBtn from '@components/Buttons/PriceBtn/PriceBtn';
import CheckBox from '@components/CheckBox/CheckBox';
import { useAuth } from '@context/AuthContext';
import { useAddItemForm } from '@hooks/useAddItemForm';

export default function AddItemForm() {
    const location = useLocation();
    const navigate = useNavigate();
    const { userId } = useAuth();
    const initialItem = location.state?.initialItem || null;

    const {
        categories, formData, setFormData,
        files, setFiles,
        existingImages, setExistingImages,
        thumbnail, setThumbnail,
        maxTitleChars, maxDescriptionChars,
        handlePriceChange, handleAddItemSubmit
    } = useAddItemForm(initialItem, userId, navigate);

    const [errors, setErrors] = useState({});

    const handleFieldChange = (key) => (val) =>
        setFormData(prev => ({ ...prev, [key]: val }));

    const validateForm = () => {
        const newErrors = {};
        if (!formData.title) newErrors.title = "Title is required";
        if (!formData.categoryId) newErrors.category = "Category is required";
        if (!formData.type) newErrors.type = "Listing type is required";
        if (!formData.condition) newErrors.condition = "Condition is required";
        if (!formData.price) newErrors.price = "Price is required";
        if (!thumbnail) newErrors.thumbnail = "Thumbnail is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await handleAddItemSubmit(validateForm); 
    };

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.wrapper}>
                <InputField
                    label="Title"
                    value={formData.title}
                    onChange={handleFieldChange('title')}
                    maxChars={maxTitleChars}
                    error={errors.title}
                />
                <UploadPhotos
                    files={files}
                    setFiles={setFiles}
                    existingImages={existingImages}
                    setExistingImages={setExistingImages}
                    setThumbnail={setThumbnail}
                    error={errors.thumbnail}
                />
                <CategorySelect
                    label="Category"
                    value={formData.categoryName}
                    onChange={val => {
                        setFormData(prev => ({
                            ...prev,
                            categoryName: val,
                            categoryId: categories.find(c => c.name === val)?.id || ''
                        }));
                        setErrors(prev => ({ ...prev, category: undefined }));
                    }}
                    options={categories.map(c => ({ value: c.name, label: c.name }))}
                    error={errors.category}
                />
                <SelectButtonGroup
                    label="Listing Type"
                    value={formData.type}
                    onChange={val => {
                        handleFieldChange('type')(val);
                        setErrors(prev => ({ ...prev, type: undefined }));
                    }}
                    options={["SELL", "BUY", "AUCTION"]}
                    error={errors.type}
                />
                <SelectButtonGroup
                    label="Item Condition"
                    value={formData.condition}
                    onChange={val => {
                        handleFieldChange('condition')(val);
                        setErrors(prev => ({ ...prev, condition: undefined }));
                    }}
                    options={["NEW", "USED", { value: "LIKE_NEW", label: "LIKE NEW" }]}
                    error={errors.condition}
                />
                <PriceField
                    value={formData.price}
                    onChange={handlePriceChange}
                    error={errors.price}
                />
                <InputField
                    label="Location"
                    value={formData.location}
                    onChange={handleFieldChange('location')}
                />
                <div className={styles.checkBoxRow}>
                    <CheckBox
                        isChecked={formData.openToOffers}
                        setIsChecked={handleFieldChange('openToOffers')}
                        name='openToOffers'
                        displayText='Open to offers'
                    />
                    <CheckBox
                        isChecked={formData.pickUpByAppointment}
                        setIsChecked={handleFieldChange('pickUpByAppointment')}
                        name='pickUpByAppointment'
                        displayText='Pickup by appointment'
                    />
                </div>
                <InputField
                    label="Description"
                    value={formData.description}
                    onChange={handleFieldChange('description')}
                    multiline
                    maxChars={maxDescriptionChars}
                />
                <div className={styles.submitRow}>
                    <button type='submit' className={styles.submitBtn}>Submit</button>
                </div>
            </div>
        </form>
    );
}

function InputField({ label, value, onChange, maxChars, multiline, error }) {
    const Tag = multiline ? 'textarea' : 'input';
    return (
        <div className={styles.row}>
            <label className={styles.labelWithLine}>{label}</label>
            <Tag
                rows={multiline ? 10 : undefined}
                maxLength={maxChars}
                value={value}
                onChange={e => onChange(e.target.value)}
                className={multiline ? styles.textarea : styles.input}
                placeholder={`Enter ${label.toLowerCase()}`}
            />
            {maxChars && <p className={styles.charCount}>{value.length} / {maxChars} characters</p>}
            {error && <p className={styles.errorMsg}>{error}</p>}
        </div>
    );
}

function SelectButtonGroup({ label, value, onChange, options, error }) {
    return (
        <div className={styles.row}>
            <label className={styles.labelWithLine}>{label}</label>
            <div className={styles.optionsContainer}>
                {options.map(opt => {
                    const val = typeof opt === "string" ? opt : opt.value;
                    const lbl = typeof opt === "string" ? opt : opt.label;
                    return (
                        <button
                            key={val}
                            type="button"
                            className={`${styles.optionBtn} ${value === val ? styles.selected : ""}`}
                            onClick={() => onChange(val)}
                        >
                            {lbl}
                        </button>
                    );
                })}
            </div>
            {error && <p className={styles.errorMsg}>{error}</p>}
        </div>
    );
}

function UploadPhotos({ files, setFiles, existingImages, setExistingImages, setThumbnail, error }) {
    return (
        <div>
            <label className={styles.labelWithLine}>Upload Photos</label>
            <MultiImageUpload
                files={files}
                setFiles={setFiles}
                existingImages={existingImages}
                setExistingImages={setExistingImages}
                setThumbnail={setThumbnail}
            />
            {error && <p className={styles.errorMsg}>{error}</p>}
        </div>
    );
}

function PriceField({ value, onChange, error }) {
    return (
        <div className={styles.row}>
            <label className={styles.labelWithLine}>Price</label>
           <PriceBtn value={value} onChange={onChange} variant="default" />
            {error && <p className={styles.errorMsg}>{error}</p>}
        </div>
    );
}

function CategorySelect({ label, value, onChange, options, error }) {
    const [isOpen, setIsOpen] = useState(false);
    const handleToggle = () => setIsOpen(!isOpen);
    const handleSelect = (val) => {
        onChange(val);
        setIsOpen(false);
    };
    return (
        <div className={styles.row}>
            <label className={styles.labelWithLine}>{label}</label>
            <div
                className={styles.customSelect}
                onClick={handleToggle}
                style={{
                    borderBottom: isOpen ? "none" : "1px solid rgb(114, 113, 113)",
                    borderRadius: isOpen ? "4px 4px 0 0" : "4px"
                }}
            >
                <span>{value ? options.find(o => o.value === value)?.label : `Select ${label.toLowerCase()}`}</span>
                <DropdownArrow
                    width={24}
                    height={24}
                    fill="#e7e2e2ff"
                    style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                />
            </div>
            {isOpen && (
                <ul className={styles.optionsList}>
                    {options.map((opt) => (
                        <li
                            key={opt.value}
                            className={styles.optionItem}
                            onClick={() => handleSelect(opt.value)}
                        >
                            {opt.label}
                        </li>
                    ))}
                </ul>
            )}
            {error && <p className={styles.errorMsg}>{error}</p>}
        </div>
    );
}
