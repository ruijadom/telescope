import React, { useState } from 'react';
import Header from './components/Header';
import TodoList from './components/TodoList';
import UserProfile from './components/UserProfile';
import './App.css';

function App() {
  const [user] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    avatar: 'https://via.placeholder.com/100'
  });

  return (
    <div className="app">
      <Header title="React Hubble Demo" />
      
      <main className="main-content">
        <section className="section">
          <h2>User Profile</h2>
          <UserProfile user={user} />
        </section>

        <section className="section">
          <h2>Todo List</h2>
          <TodoList />
        </section>

        <section className="section">
          <h2>Instructions</h2>
          <div className="instructions">
            <p>This is a demo application for React Hubble.</p>
            <ol>
              <li>Press <kbd>Ctrl</kbd> + Click on any component</li>
              <li>View component information in the overlay</li>
              <li>Click "Open in Cursor" to navigate to source code</li>
              <li>Try "Generate Test IDs" for components without test IDs</li>
            </ol>
            <p>
              <strong>Note:</strong> Some components have test IDs (like the Header),
              while others don't (like individual Todo items). This demonstrates
              React Hubble's ability to detect missing test IDs.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
