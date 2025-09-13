import React, { useState, useEffect } from 'react';
import styles from './FiltersPanel.module.css';
import DropdownArrow from '@assets/Icons/DropdownArrow';
import PriceBtn from '@components/Buttons/PriceBtn/PriceBtn';
import Button from '@components/Buttons/Button/Button';
import PriceSlider from '@components/PriceSlider/PriceSlider';
import { getCategories } from '@services/InventoryService';
import { formatText } from '@utils/utils';
import { Paths } from '@config/Config';
import { useSearchParams, useNavigate } from 'react-router-dom';

const types = ["BUY", "SELL", "AUCTION"];
const conditions = ["NEW", "LIKE_NEW", "USED"];

const priceLimits = { min: 0, max: 10000 }; // need to request max price from backend

export default function FiltersPanel({ filters, onFilterChange }) {
  const [categories, setCategories] = useState([]);
  const [expanded, setExpanded] = useState({
    category: true,
    type: true,
    condition: true,
    price: true
  });
  const [localPrice, setLocalPrice] = useState({
    min: filters.minPrice != null ? Number(filters.minPrice) : priceLimits.min,
    max: filters.maxPrice != null ? Number(filters.maxPrice) : priceLimits.max
  });
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();


  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, []);

  // --- Sync filters from URL on mount ---
  useEffect(() => {
    const urlFilters = { ...filters };
    const category = searchParams.get('category');
    const type = searchParams.get('type');
    const condition = searchParams.get('condition');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');

    if (category) urlFilters.category = category;
    if (type) urlFilters.type = type;
    if (condition) urlFilters.condition = condition;
    if (minPrice) urlFilters.minPrice = Number(minPrice);
    if (maxPrice) urlFilters.maxPrice = Number(maxPrice);

    onFilterChange(urlFilters);
    setLocalPrice({
      min: urlFilters.minPrice != null ? urlFilters.minPrice : priceLimits.min,
      max: urlFilters.maxPrice != null ? urlFilters.maxPrice : priceLimits.max
    });
  }, []);

  // --- Expand/collapse sections ---
  const handleToggle = (section) => {
    setExpanded(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const updateFilters = (key, value) => {
    let newFilters;
    if (key === 'price') {
      newFilters = { ...filters, minPrice: value.min, maxPrice: value.max };
    } else {
      newFilters = { ...filters, [key]: value };
    }

    const normalized = {
      category: newFilters.category || null,
      type: newFilters.type || null,
      condition: newFilters.condition || null,
      minPrice: newFilters.minPrice != null && newFilters.minPrice !== '' ? Number(newFilters.minPrice) : null,
      maxPrice: newFilters.maxPrice != null && newFilters.maxPrice !== '' ? Number(newFilters.maxPrice) : null
    };

    onFilterChange(normalized);

    // --- Update URL ---
    const params = new URLSearchParams();
    if (normalized.category) params.set('category', normalized.category);
    if (normalized.type) params.set('type', normalized.type);
    if (normalized.condition) params.set('condition', normalized.condition);
    if (normalized.minPrice != null) params.set('minPrice', normalized.minPrice);
    if (normalized.maxPrice != null) params.set('maxPrice', normalized.maxPrice);

    navigate({ pathname: '/', search: params.toString() }, { replace: true });
  };

  const handlePriceChange = ({ min, max }) => {
    setLocalPrice({ min, max });
  };

  const handlePriceCommit = ({ min, max }) => {
    updateFilters('price', { min, max });
  };

  const handlePriceInputChange = (type, value) => {
    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
      const numericValue = value === '' ? '' : Number(value);
      const newPrice = { ...localPrice, [type]: numericValue };
      setLocalPrice(newPrice);
      updateFilters('price', newPrice);
    }
  };


  return (
    <div className={styles.wrapper}>
      <Button label="List an item" variant="listItem" to={Paths.ADD_ITEM} />
      <FilterSection
        title="Price"
        show={expanded.price}
        onToggle={() => handleToggle('price')}
      >
        <div className={styles.priceSliderWrapper}>
          <PriceSlider
            value={localPrice}
            onChange={handlePriceChange}
            onCommit={handlePriceCommit}
          />
          <div className={styles.priceInputs}>
            <PriceBtn
              value={localPrice.min !== priceLimits.min ? localPrice.min : ''}
              placeholder={priceLimits.min}
              onChange={e => handlePriceInputChange('min', e.target.value)}
              variant="withPadding"
            />
            <PriceBtn
              value={localPrice.max !== priceLimits.max ? localPrice.max : ''}
              placeholder={priceLimits.max}
              onChange={e => handlePriceInputChange('max', e.target.value)}
              variant="withPadding"
            />
          </div>
        </div>
      </FilterSection>
      <FilterSection
        title="Category"
        items={categories.map(c => c.name)}
        selectedItem={filters.category}
        show={expanded.category}
        onToggle={() => handleToggle('category')}
        onItemClick={val => updateFilters('category', val)}
      />
      <FilterSection
        title="Type"
        items={types}
        selectedItem={filters.type}
        show={expanded.type}
        onToggle={() => handleToggle('type')}
        onItemClick={val => updateFilters('type', val)}
      />
      <FilterSection
        title="Condition"
        items={conditions}
        selectedItem={filters.condition}
        show={expanded.condition}
        onToggle={() => handleToggle('condition')}
        onItemClick={val => updateFilters('condition', val)}
      />
    </div>
  );
}

function FilterSection({ title, items = [], selectedItem, show, onToggle, onItemClick, children }) {
  return (
    <div className={styles.filterSection}>
      <div className={styles.sectionHeader} onClick={onToggle}>
        {title}
        <DropdownArrow
          width={24}
          height={24}
          style={{
            transform: show ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.3s"
          }}
        />
      </div>
      {show && (
        <div className={styles.container}>
          {items.length > 0
            ? items.map(item => (
              <div
                key={item}
                className={`${styles.categoryItem} ${selectedItem === item ? styles.selected : ''}`}
                onClick={() => onItemClick(item)}
              >
                {formatText(item)}
              </div>
            ))
            : children
          }
        </div>
      )}
    </div>
  );
}
