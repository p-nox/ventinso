import styles from "./SearchBar.module.css";
import SearchIcon from "@assets/Icons/SearchIcon";
import Button from "@components/Buttons/Button/Button";
import { useState, useEffect } from "react";
import { useSearch } from '@context/SearchContext';
import { useNavigate, useSearchParams } from "react-router-dom";

export default function SearchBar() {
  const { setQuery } = useSearch();
  const [localQuery, setLocalQuery] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();


  useEffect(() => {
    const q = searchParams.get("q") || "";
    setLocalQuery(q);
    setQuery(q);
  }, [searchParams, setQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (localQuery) {
      params.set("q", localQuery);
    }
    navigate({ pathname: "/", search: params.toString() }, { replace: false });
  };

  return (
    <div className={styles.searchContainer}>
      <form className={styles.searchForm} onSubmit={handleSearch}>
        <Button
          type="submit"
          icon={() => <SearchIcon width={20} height={24} />}
          variant="search"
        />
        <input
          className={styles.searchInput}
          type="search"
          placeholder=" What are you looking for?"
          aria-label="Search"
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
        />
      </form>
    </div>
  );
}
