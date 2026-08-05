import React, { useState, useEffect } from 'react';
import { Search, Filter, ArrowUpDown } from 'lucide-react';
import { Input } from './Input';

export interface FilterOption {
  label: string;
  value: string;
}

export interface SearchFilterBarProps {
  searchPlaceholder?: string;
  onSearchChange: (search: string) => void;
  filters?: {
    name: string;
    key: string;
    value: string;
    options: FilterOption[];
    onChange: (val: string) => void;
  }[];
  sortOption?: {
    value: string;
    order: 'asc' | 'desc';
    options: FilterOption[];
    onSortChange: (sort: string) => void;
    onOrderToggle: () => void;
  };
}

export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  searchPlaceholder = 'Search...',
  onSearchChange,
  filters,
  sortOption,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      onSearchChange(searchTerm);
    }, 400);

    return () => clearTimeout(handler);
  }, [searchTerm, onSearchChange]);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          type="text"
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filters and Sorting */}
      <div className="flex flex-wrap items-center gap-3">
        {filters &&
          filters.map((f) => (
            <div key={f.key} className="flex items-center space-x-1.5">
              <Filter className="h-4 w-4 text-slate-400 hidden sm:inline" />
              <select
                aria-label={f.name}
                value={f.value}
                onChange={(e) => f.onChange(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {f.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          ))}

        {sortOption && (
          <div className="flex items-center space-x-2">
            <select
              aria-label="Sort options"
              value={sortOption.value}
              onChange={(e) => sortOption.onSortChange(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {sortOption.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={sortOption.onOrderToggle}
              className="p-2 border border-slate-300 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500"
              title={`Sort ${sortOption.order === 'asc' ? 'Ascending' : 'Descending'}`}
            >
              <ArrowUpDown className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
