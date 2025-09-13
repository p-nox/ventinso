import { useState, useEffect } from "react";
import { fillTheGrid, fetchItems } from "@services/PreviewService";

const LIMIT = 20;
let cachedItems = null;

export default function useItems(filters) {
  const [items, setItems] = useState([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInitial = async () => {
      setLoading(true);

      const hasQueryOrFilter = Object.values(filters).some(
        (v) => v !== null && v !== ""
      );

      if (hasQueryOrFilter) {
        const data = await fetchItems(filters);
        setItems(data);
        setOffset(data.length);
        setHasMore(data.length === LIMIT);
      } else {
        if (!cachedItems) {
          const data = await fillTheGrid(0, LIMIT);
          cachedItems = data; 
        }
        setItems(cachedItems);
        setOffset(cachedItems.length);
        setHasMore(cachedItems.length === LIMIT);
      }
      setLoading(false);
    };
    loadInitial();
  }, [filters]);

  const loadItems = async (currentOffset = offset) => {
    setLoading(true);
    const newItems = await fillTheGrid(currentOffset, LIMIT);
    setItems((prev) => [...prev, ...newItems]);
    setOffset(currentOffset + newItems.length);
    setHasMore(newItems.length === LIMIT);
    setLoading(false);
  };

  return { items, loading, hasMore, loadItems };
}
