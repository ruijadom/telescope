import React from 'react';

interface HeaderProps {
  title: string;
}

function Header({ title }: HeaderProps) {
  return (
    <header className="header" data-testid="app-header">
      <h1 data-testid="header-title">{title}</h1>
      <nav data-testid="header-nav">
        <button data-testid="nav-home">Home</button>
        <button data-testid="nav-about">About</button>
        <button data-testid="nav-contact">Contact</button>
      </nav>
    </header>
  );
}

export default Header;
