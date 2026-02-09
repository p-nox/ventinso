import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Euro, ChevronDown } from 'lucide-react';
import styles from './AddItemFormPage.module.css';
import MultiImageUpload from './components/MultiImageUpload/MultiImageUpload';
import { CheckBox } from '@components/ui';
import { useAuth } from '@context/AuthContext';
import { useAddItemForm } from '@hooks/useAddItemForm';
import { toast } from "react-hot-toast";
import CustomToast from "@components/ToasterProvider/CustomToast";

export default function AddItemFormWithProgress() {
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
  const [submitted, setSubmitted] = useState(false);

  const titleRef = useRef(null);
  const uploadRef = useRef(null);
  const categoryRef = useRef(null);
  const priceRef = useRef(null);
  const descriptionRef = useRef(null);

  const [sectionHeights, setSectionHeights] = useState([]);

  useLayoutEffect(() => {
    const observer = new ResizeObserver(() => {
      setSectionHeights([
        titleRef.current?.getBoundingClientRect().height || 0,
        uploadRef.current?.getBoundingClientRect().height || 0,
        categoryRef.current?.getBoundingClientRect().height || 0,
        priceRef.current?.getBoundingClientRect().height || 0,
        descriptionRef.current?.getBoundingClientRect().height || 0,
      ]);
    });

    if (uploadRef.current) observer.observe(uploadRef.current);
    if (titleRef.current) observer.observe(titleRef.current);
    if (categoryRef.current) observer.observe(categoryRef.current);
    if (priceRef.current) observer.observe(priceRef.current);
    if (descriptionRef.current) observer.observe(descriptionRef.current);

    return () => observer.disconnect();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title) newErrors.title = "Title is required";
    if (!formData.categoryId) newErrors.category = "Category is required";
    if (!formData.condition) newErrors.condition = "Condition is required";
    if (!formData.price) newErrors.price = "Price is required";
    if (!thumbnail) newErrors.thumbnail = "Thumbnail is required";

    setErrors(newErrors);

    Object.values(newErrors).forEach((msg) => {
      toast.custom((t) => (
        <CustomToast
          id={t.id}
          message={msg}
          type="error"
        />
      ));
    });

    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitted(true);
    if (!validateForm()) return;
    await handleAddItemSubmit();
    toast.custom((t) => (
      <CustomToast
        id={t.id}
        message="Your item successfully listed."
        type="success"
      />
    ));
  };

  return (
    <div className={styles.addItemContainer}>
      <div className={styles.twoColumnContainer}>
        <ProgressSidebar
          formData={formData}
          thumbnail={thumbnail}
          sectionHeights={sectionHeights}
        />
        <form className={styles.formColumn} onSubmit={handleSubmit}>

          <div ref={titleRef}>
            <TitleSection
              formData={formData}
              setFormData={setFormData}
              maxTitleChars={maxTitleChars}
              error={submitted ? errors.title : null}
            />
          </div>

          <div ref={uploadRef}>
            <UploadSection
              files={files}
              setFiles={setFiles}
              existingImages={existingImages}
              setExistingImages={setExistingImages}
              thumbnail={thumbnail}
              setThumbnail={setThumbnail}
              error={submitted ? errors.thumbnail : null}
            />
          </div>

          <div ref={categoryRef}>
            <CategorySection
              categories={categories}
              formData={formData}
              setFormData={setFormData}
              errors={submitted ? errors : {}}
            />
          </div>

          <div ref={priceRef}>
            <PriceSection
              value={formData.price}
              onChange={handlePriceChange}
              error={submitted ? errors.price : null}
              formData={formData}
              setFormData={setFormData}
            />
          </div>

          <div ref={descriptionRef}>
            <DescriptionSection
              formData={formData}
              setFormData={setFormData}
              maxDescriptionChars={maxDescriptionChars}
            />
          </div>

          <SubmitSection />

        </form>
      </div>
    </div>
  );
}


function ProgressSidebar({ formData, thumbnail, sectionHeights }) {

  const steps = [
    "Enter a Title",
    "Upload Photos",
    "Select Category",
    "Enter Price",
    "Describe your item"
  ];

  const helperTexts = [
    "Use a clear, descriptive title, including the main features of your item.",
    "You can upload up to 14 images.",
    "Choose the correct category and item's condition to make it easier for buyers to find your listing.",
    "*Open to Offers allows buyers to send price suggestions.", // ακτω απο offers
    "Provide detailed information about the item, including features and any wear."
  ];

  const isSectionComplete = (index) => {
    switch (index) {
      case 0: return !!formData.title;
      case 1: return !!thumbnail;
      case 2: return !!formData.categoryId && !!formData.condition;
      case 3: return !!formData.price;
      case 4: return !!formData.description;
      default: return false;
    }
  };

  return (
    <div className={styles.progressColumn}>
      {steps.map((label, idx) => {
        const complete = isSectionComplete(idx);
        const height = sectionHeights[idx] || 'auto';

        return (
          <div
            key={idx}
            className={`${styles.step} ${complete ? styles.completedStep : ''}`}
            style={{ height }}
          >
            <div className={styles.stepLabelWrapper}>
              <div className={styles.stepLabel}>{idx + 1}. {label}</div>
              <div className={styles.stepHelper}>{helperTexts[idx]}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}



const SectionCard = ({ title, children, showTitle = true }) => (
  <div className={styles.sectionCard}>
    {showTitle && <h3 className={styles.sectionTitle}>{title}</h3>}
    {children}
  </div>
);
const TitleSection = ({ formData, setFormData, maxTitleChars, error }) => (
  <SectionCard title="Title">
    <InputField
      value={formData.title}
      onChange={v => setFormData(prev => ({ ...prev, title: v }))}
      maxChars={maxTitleChars}
      error={error}
    />
  </SectionCard>
);

const UploadSection = ({ files, setFiles, existingImages, setExistingImages, thumbnail, setThumbnail, error }) => (
  <SectionCard showTitle={false}>
    <MultiImageUpload
      files={files}
      setFiles={setFiles}
      existingImages={existingImages}
      setExistingImages={setExistingImages}
      thumbnail={thumbnail}
      setThumbnail={setThumbnail}
    />
    {error && <p className={styles.errorMsg}>{error}</p>}
  </SectionCard>
);

const CategorySection = ({ categories, formData, setFormData, errors }) => (
  <>
    <div style={{ marginTop: '0.2rem' }} />
    <SectionCard title="">
      <div className={styles.categoryRow}>
        <CategorySelect
          label="Category"
          value={formData.categoryName}
          onChange={val => setFormData(prev => ({
            ...prev,
            categoryName: val,
            categoryId: categories.find(c => c.name === val)?.id || ''
          }))}
          options={categories.map(c => ({ value: c.name, label: c.name }))}
          error={errors.category}
        />
        <CategorySelect
          label="Item Condition"
          value={formData.condition}
          onChange={val => setFormData(prev => ({ ...prev, condition: val }))}
          options={[
            { value: "NEW", label: "NEW" },
            { value: "USED", label: "USED" },
            { value: "LIKE_NEW", label: "LIKE NEW" }
          ]}
          error={errors.condition}
        />
      </div>
    </SectionCard>
  </>
);

const PriceSection = ({ value, onChange, error, formData, setFormData }) => (
  <>
    <div style={{ marginTop: '1rem' }} />
    <SectionCard title="Price">
      <div className={styles.priceRow}>
        <PriceField value={value} onChange={onChange} error={error} />
        <CheckBox
          isChecked={formData.openToOffers}
          setIsChecked={v => setFormData(prev => ({ ...prev, openToOffers: v }))}
          displayText="Open to offers"
        />
      </div>
      {error && <p className={styles.errorMsg} style={{ marginTop: '-1rem' }}>{error}</p>}
    </SectionCard>
  </>
);

const DescriptionSection = ({ formData, setFormData, maxDescriptionChars }) => (
  <SectionCard title="Description">
    <InputField
      value={formData.description}
      onChange={v => setFormData(prev => ({ ...prev, description: v }))}
      multiline
      maxChars={maxDescriptionChars}
    />
  </SectionCard>
);

const SubmitSection = () => (
  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
    <button type="submit" className={styles.submitBtn}>Submit</button>
  </div>
);

const InputField = ({ value, onChange, maxChars, multiline, error }) => {
  const Tag = multiline ? 'textarea' : 'input';
  return (
    <div className={styles.inputWrapper}>
      <Tag
        rows={multiline ? 4 : undefined}
        maxLength={maxChars}
        value={value}
        onChange={e => onChange(e.target.value)}
        className={multiline ? styles.textarea : styles.input}
      />
      {maxChars && <p className={styles.charCount}>{(value || '').length} / {maxChars} characters</p>}
      {error && <p className={styles.errorMsg} style={{ marginTop: '-1.8rem' }}>{error}</p>}
    </div>
  );
}

const PriceField = ({ value, onChange, error }) => (
  <div className={styles.row} style={{ width: "30%" }}>
    <div className={styles.priceInputWrapper}>
      <input type="text" value={value} placeholder="Enter price" onChange={onChange} className={styles.input} />
      <Euro className={styles.euroIcon} />
    </div>
  </div>
);

const CategorySelect = ({ label, value, onChange, options, error }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const handleSelect = val => {
    onChange(val);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={styles.row} style={{ position: 'relative', width: '30%' }}>
      <label className={styles.labelWithLine}>{label}</label>


      <div style={{ position: 'relative' }} ref={containerRef}>
        <div
          className={`${styles.customSelect} ${isOpen ? styles.open : ''}`}
          onClick={() => setIsOpen(prev => !prev)}
        >
          <span>{value ? options.find(o => o.value === value)?.label : `Select ${label.toLowerCase()}`}</span>
          <ChevronDown className={styles.chevronIcon} size={20} />
        </div>

        {isOpen && (
          <ul className={styles.optionsList}>
            {options.map(opt => (
              <li key={opt.value} className={styles.optionItem} onClick={() => handleSelect(opt.value)}>
                {opt.label}
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && <p className={styles.errorMsg}>{error}</p>}
    </div>
  );
};
