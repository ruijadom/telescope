import React, { useState } from 'react';
import Navigation from './components/Navigation';
import SearchBar from './components/SearchBar';
import ProductList from './components/ProductList';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('Home');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    console.log('Searching for:', query);
  };

  return (
    <div className="app">
      <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />
      
      <main className="main-content">
        <section className="hero">
          <h1>Welcome to React Hubble Store</h1>
          <p>Discover amazing developer tools</p>
        </section>

        <section className="search-section">
          <SearchBar onSearch={handleSearch} />
        </section>

        <section className="products-section">
          <h2>Featured Products</h2>
          <ProductList />
        </section>

        <section className="instructions-section">
          <h2>Try React Hubble</h2>
          <div className="instructions">
            <p>This Webpack-based example demonstrates React Hubble's capabilities:</p>
            <ul>
              <li><strong>Component Detection:</strong> Ctrl+Click on any component to inspect it</li>
              <li><strong>Source Navigation:</strong> Open components directly in Cursor editor</li>
              <li><strong>Test ID Analysis:</strong> The Navigation component has test IDs, others don't</li>
              <li><strong>AI Generation:</strong> Generate test IDs for components that need them</li>
            </ul>
            <p className="note">
              <strong>Note:</strong> Make sure the Hubble server is running with <code>npx hubble start</code>
            </p>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>&copy; 2024 React Hubble. Built with Webpack.</p>
      </footer>
    </div>
  );
}

export default App;
