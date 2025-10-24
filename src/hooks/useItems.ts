'use client';

import { useEffect, useState } from 'react';

interface Item {
  id: string;
  name: string;
  value: string;
}

type SortField = 'id' | 'name' | 'value';
type SortDirection = 'asc' | 'desc';

export function useItems() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const sortItems = (items: Item[], field: SortField, direction: SortDirection) => {
    return [...items].sort((a, b) => {
      let aValue: string;
      let bValue: string;
      
      switch (field) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'value':
          aValue = a.value.toLowerCase();
          bValue = b.value.toLowerCase();
          break;
        case 'id':
        default:
          aValue = a.id;
          bValue = b.id;
          break;
      }
      
      if (direction === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });
  };

  const fetchItems = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      const response = await fetch('/api/items');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const sortedData = sortItems(data, sortField, sortDirection);
      setItems(sortedData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching items:', err);
    } finally {
      if (showLoading) {
        setLoading(false);
      } else {
        setRefreshing(false);
      }
    }
  };

  // Initial fetch only
  useEffect(() => {
    fetchItems();
  }, []);

  // Re-sort when sort field or direction changes
  useEffect(() => {
    if (items.length > 0) {
      const sortedData = sortItems(items, sortField, sortDirection);
      setItems(sortedData);
    }
  }, [sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field with ascending direction
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return { 
    items, 
    loading, 
    refreshing,
    error, 
    refetch: fetchItems,
    sortField,
    sortDirection,
    handleSort
  };
}
