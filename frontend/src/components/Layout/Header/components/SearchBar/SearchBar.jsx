import styles from "./SearchBar.module.css";
import { Search } from "lucide-react";
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

    // Κρατάμε όλα τα υπάρχοντα params και αλλάζουμε μόνο το "q"
    const params = new URLSearchParams(searchParams);
    if (localQuery) {
      params.set("q", localQuery);
    } else {
      params.delete("q"); // αν το πεδίο είναι κενό, διαγράφουμε το q
    }

    navigate({ pathname: "/", search: params.toString() }, { replace: false });
    setQuery(localQuery); // ενημερώνουμε και το context
  };


  return (
    <div className={styles.searchContainer}>

      <form className={styles.searchForm} onSubmit={handleSearch}>

        <Button
          type="submit"
          icon={() => <Search />}
          variant="search"
        />

        <input
          className={styles.searchInput}
          type="search"
          placeholder=" Search for items"
          aria-label="Search"
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
        />

      </form>

    </div>
  );
}
