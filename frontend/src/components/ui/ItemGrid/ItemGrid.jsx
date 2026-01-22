import styles from './ItemGrid.module.css';
import ItemCard from '@components/Cards/ItemCard/ItemCard';
import { SectionTitle } from '@components/ui';
import React, { useState } from "react";
import TabGroup from '@components/Buttons/TabGroup/TabGroup';

export default function ItemGrid({
  items,
  width = "80%",
  text = "",
  showTitle = false,
  showUserInfo = true,
  showTabs = false,  
  pagable = false,
  itemsPerPage = 8,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('active');
  

  if (!items || items.length === 0) return null;

  const filteredItems = items.filter(item => {
    if (activeTab === 'active') return item.status === 'ACTIVE';
    if (activeTab === 'hidden') return item.status === 'HIDDEN';
    return true;
  });

  const totalPages = pagable ? Math.ceil(filteredItems.length / itemsPerPage) : 1;
  const startIndex = pagable ? (currentPage - 1) * itemsPerPage : 0;
  const currentItems = pagable
    ? filteredItems.slice(startIndex, startIndex + itemsPerPage)
    : filteredItems;

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return (
    <div className={styles.wrapper} style={{ width }}>
      {showTitle && <SectionTitle text={text} />}

      {showTabs && (  
        <TabGroup
          tabs={[
            { key: 'active', label: 'Active' },
            { key: 'hidden', label: 'Hidden' }
          ]}
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            setCurrentPage(1);
          }}
          orientation="horizontal"
        />
      )}

      <div className={styles.gridRow}>
        {currentItems.map((item, index) => (
          <div className={styles.gridCol} key={index}>
            <div className={styles.wrapperCard}>
              <ItemCard item={item} showUserInfo={showUserInfo} />
            </div>
          </div>
        ))}
      </div>

      {pagable && totalPages > 1 && (
        <div className={styles.pagination}>
          <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
            Prev
          </button>
          <span>{currentPage} / {totalPages}</span>
          <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}
