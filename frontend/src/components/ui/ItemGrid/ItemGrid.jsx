import styles from './ItemGrid.module.css';
import ItemCard from '@components/Cards/ItemCard/ItemCard';
import { SectionTitle } from '@components/ui';
import React, { useState } from "react";
import TabGroup from '@components/Buttons/TabGroup/TabGroup';
import { useAuth } from "@context/AuthContext";
import { useParams } from 'react-router-dom';
import Button from '@components/Buttons/Button/Button';
import { Paths } from "@config/Config";

export default function ItemGrid({
  items,
  width = "80%",
  text = "", // title of ItemGrid
  showTitle = false,
  showTabs = false,
  pagable = false,
  enableStatusFilter = true,

  itemsPerPage = 8,
  totalActiveItems,
  totalHiddenItems,
  cardSize = { minWidth: '', maxWidth: '' }
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('active');
  const { id } = useParams();
  const { userId } = useAuth();


  const filteredItems = enableStatusFilter
    ? items.filter(item => {
      if (activeTab === 'active') return item.status === 'ACTIVE';
      if (activeTab === 'hidden') return item.status === 'HIDDEN';
      return true;
    })
    : items;

  const totalPages = pagable ? Math.ceil(filteredItems.length / itemsPerPage) : 1;

  const startIndex = pagable ? (currentPage - 1) * itemsPerPage : 0;

  const currentItems = pagable
    ? filteredItems.slice(startIndex, startIndex + itemsPerPage)
    : filteredItems;

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const getEmptyMessage = () => {
    if (activeTab === 'hidden') {
      return <p>You don't have any hidden items</p>;
    }
    if (Number(userId) === Number(id)) {
      return (
        <>
          <p>You don't have any listing items yet</p>
          <div style={{ marginTop: "1rem", display: "flex", justifyContent: "center" }}>
            <div style={{ maxWidth: "150px", width: "100%" }}>
              <Button label="List now" variant="listItem" to={Paths.ADD_ITEM()} />
            </div>
          </div>
        </>
      );
    }
    return <p>This user doesn't have any listing items yet</p>;
  };


  return (
    <div className={styles.wrapper} style={{ width }}>
      {showTitle && <SectionTitle text={text} />}

      {showTabs && enableStatusFilter && (
        <TabGroup
          tabs={[
            {
              key: 'active',
              label: `Active${totalActiveItems > 0 ? ` (${totalActiveItems})` : ''}`
            },
            {
              key: 'hidden',
              label: `Hidden${totalHiddenItems > 0 ? ` (${totalHiddenItems})` : ''}`
            }
          ]}
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            setCurrentPage(1);
          }}
          orientation="horizontal"
        />

      )}


      <div style={{ marginTop: showTabs ? '0.5rem' : 0 }}>
        {currentItems.length > 0 ? (
          <>
            <div className={styles.gridRow}>
              {currentItems.map((item, index) => (
                <div className={styles.gridCol} key={index}>
                  <div className={styles.wrapperCard}>
                    <ItemCard item={item}   {...cardSize} />
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
          </>
        ) : (
          <div className={styles.emptyMessage}>
            {getEmptyMessage()}
          </div>

        )}
      </div>
    </div>

  );
}
