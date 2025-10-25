import React from 'react';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const pages = ['Home', 'Products', 'About', 'Contact'];

  return (
    <nav className="navigation" data-testid="main-navigation">
      <div className="nav-brand" data-testid="nav-brand">
        React Hubble Store
      </div>
      <ul className="nav-links" data-testid="nav-links">
        {pages.map(page => (
          <li key={page}>
            <button
              className={`nav-link ${currentPage === page ? 'active' : ''}`}
              onClick={() => onNavigate(page)}
              data-testid={`nav-link-${page.toLowerCase()}`}
            >
              {page}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default Navigation;
