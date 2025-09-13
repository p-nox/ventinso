import { useState } from "react";

export default function useUrlFilters(searchParams, navigate) {
  const initialFilters = {
    q: searchParams.get("q") || "",
    category: searchParams.get("category") || null,
    type: searchParams.get("type") || null,
    condition: searchParams.get("condition") || null,
    minPrice: searchParams.get("minPrice")
      ? Number(searchParams.get("minPrice"))
      : null,
    maxPrice: searchParams.get("maxPrice")
      ? Number(searchParams.get("maxPrice"))
      : null,
  };

  const [filters, setFilters] = useState(initialFilters);
  const [confirmedFilters, setConfirmedFilters] = useState(initialFilters);

  const updateUrl = (updated) => {
    const params = new URLSearchParams();

    if (updated.q && updated.q.trim() !== "") {
      params.set("q", updated.q.trim());
    }
    if (updated.category) params.set("category", updated.category);
    if (updated.type) params.set("type", updated.type);
    if (updated.condition) params.set("condition", updated.condition);
    if (updated.minPrice != null && updated.minPrice !== "") {
      params.set("minPrice", updated.minPrice);
    }
    if (updated.maxPrice != null && updated.maxPrice !== "") {
      params.set("maxPrice", updated.maxPrice);
    }

    navigate({ pathname: "/", search: params.toString() }, { replace: true });
  };

  const handleFilterChange = (newFilters) => {
    const normalized = { ...filters, ...newFilters };
    setFilters(normalized);
    setConfirmedFilters(normalized);
    updateUrl(normalized);
  };

  const handleRemoveFilter = (keys) => {
    const updated = { ...filters };
    keys.forEach((key) => (updated[key] = key.includes("Price") ? "" : null));
    handleFilterChange(updated);
  };

  const handleClearFilters = () => {
    const cleared = {
      q: "",
      category: null,
      type: null,
      condition: null,
      minPrice: "",
      maxPrice: "",
    };
    handleFilterChange(cleared);
  };

  return {
    filters,
    confirmedFilters,
    handleFilterChange,
    handleRemoveFilter,
    handleClearFilters,
  };
}
