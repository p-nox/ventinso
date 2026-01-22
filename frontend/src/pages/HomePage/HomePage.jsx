import styles from "./HomePage.module.css";
import React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { FiltersPanel, ActiveFilters } from './components';
import { ItemGrid } from "@components/ui";
import Button from "@components/Buttons/Button/Button";
import useUrlFilters from "@hooks/useUrlFilters";
import useItems from "@hooks/useItems";

export default function HomePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const {
    filters,
    confirmedFilters,
    handleFilterChange,
    handleRemoveFilter,
    handleClearFilters,
  } = useUrlFilters(searchParams, navigate);

  const { items, loading, hasMore, loadItems } = useItems(confirmedFilters);

  return (
    <div className={styles.wrapper}>
      <FiltersPanel filters={filters} onFilterChange={handleFilterChange} />
      <div className={styles.rightColumn}>
        <ActiveFilters
          filters={confirmedFilters}
          onRemove={handleRemoveFilter}
          onClear={handleClearFilters}
        />
        <ItemGrid items={items} width="100%" />
        {!loading && hasMore && (
          <Button variant="addMore" label="Load More" onClick={() => loadItems()} />
        )}
      </div>
    </div>
  );
}
