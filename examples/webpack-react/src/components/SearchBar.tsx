import React, { useState } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
}

function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products..."
        className="search-input"
      />
      <button type="submit" className="search-button">
        Search
      </button>
      <button 
        type="button" 
        className="clear-button"
        onClick={() => {
          setQuery('');
          onSearch('');
        }}
      >
        Clear
      </button>
    </form>
  );
}

export default SearchBar;
