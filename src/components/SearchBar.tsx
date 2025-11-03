import { useState, useEffect, useCallback } from 'react';
import '../styles/SearchBar.css';

interface SearchBarProps {
  onSearch: (query: string) => void;
  searchHistory: string[];
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, searchHistory }) => {
  const [query, setQuery] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  // Debounce search to avoid frequent API calls
  const debouncedSearch = useCallback(
    (query: string) => {
      const timer = setTimeout(() => {
        onSearch(query);
      }, 300);

      return () => clearTimeout(timer);
    },
    [onSearch]
  );

  useEffect(() => {
    if (query.trim()) {
      debouncedSearch(query);
    }
  }, [query, debouncedSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
      setShowHistory(false);
    }
  };

  const handleHistoryItemClick = (item: string) => {
    setQuery(item);
    onSearch(item);
    setShowHistory(false);
  };

  const handleClearHistory = () => {
    localStorage.removeItem('searchHistory');
    window.location.reload();
  };

  return (
    <div className='search-bar-container'>
      <form onSubmit={handleSubmit} className='search-form'>
        <input
          type='text'
          className='search-input'
          placeholder='请输入菜名搜索...'
          value={query}
          onChange={handleInputChange}
          onFocus={() => setShowHistory(searchHistory.length > 0)}
          aria-label='搜索菜谱'
        />
        <button type='submit' className='search-button' aria-label='搜索'>
          搜索
        </button>
      </form>

      {showHistory && searchHistory.length > 0 && (
        <div className='search-history'>
          <div className='history-header'>
            <h3>搜索历史</h3>
            <button 
              className='clear-history-button'
              onClick={handleClearHistory}
              aria-label='清除搜索历史'
            >
              清除
            </button>
          </div>
          <ul className='history-list'>
            {searchHistory.map((item, index) => (
              <li 
                key={index}
                className='history-item'
                onClick={() => handleHistoryItemClick(item)}
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchBar;