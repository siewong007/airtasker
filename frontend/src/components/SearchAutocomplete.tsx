import { useState, useEffect, useRef } from 'react';
import { Search, Clock, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';

interface SearchAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
}

const SAVED_SEARCHES_KEY = 'airtasker_saved_searches';
const MAX_SAVED = 5;

function getSavedSearches(): string[] {
  try {
    return JSON.parse(localStorage.getItem(SAVED_SEARCHES_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveSearch(query: string) {
  const saved = getSavedSearches().filter((s) => s !== query);
  saved.unshift(query);
  localStorage.setItem(SAVED_SEARCHES_KEY, JSON.stringify(saved.slice(0, MAX_SAVED)));
}

export default function SearchAutocomplete({ value, onChange, onSubmit, placeholder }: SearchAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [savedSearches, setSavedSearches] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: suggestions } = useQuery({
    queryKey: ['taskSuggestions', value],
    queryFn: async () => {
      const response = await api.get<string[]>(`/tasks/suggestions?q=${encodeURIComponent(value)}`);
      return response.data;
    },
    enabled: value.length >= 2,
    staleTime: 1000 * 30,
  });

  useEffect(() => {
    setSavedSearches(getSavedSearches());
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (query: string) => {
    onChange(query);
    saveSearch(query);
    setSavedSearches(getSavedSearches());
    setIsOpen(false);
    onSubmit();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      saveSearch(value.trim());
      setSavedSearches(getSavedSearches());
    }
    setIsOpen(false);
    onSubmit();
  };

  const clearSavedSearch = (search: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedSearches.filter((s) => s !== search);
    localStorage.setItem(SAVED_SEARCHES_KEY, JSON.stringify(updated));
    setSavedSearches(updated);
  };

  const showDropdown = isOpen && (
    (value.length >= 2 && suggestions && suggestions.length > 0) ||
    (value.length < 2 && savedSearches.length > 0)
  );

  return (
    <div ref={containerRef} className="relative">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder || 'Search tasks...'}
            className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-primary-500 focus:border-primary-500"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Search
          </button>
        </div>
      </form>

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
          {value.length >= 2 && suggestions && suggestions.length > 0 && (
            <div>
              {suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelect(suggestion)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 text-sm"
                >
                  <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{suggestion}</span>
                </button>
              ))}
            </div>
          )}

          {value.length < 2 && savedSearches.length > 0 && (
            <div>
              <p className="px-4 py-2 text-xs font-medium text-gray-400 uppercase">Recent Searches</p>
              {savedSearches.map((search, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelect(search)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 text-sm group"
                >
                  <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="flex-1 truncate">{search}</span>
                  <X
                    className="h-4 w-4 text-gray-300 opacity-0 group-hover:opacity-100"
                    onClick={(e) => clearSavedSearch(search, e)}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
