import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  return (
    <div>
      <h1>Welcome to Onchain Surveys</h1>
      {isAuthenticated ? (
        <div>
          <h2>You are logged in!</h2>
          <ul>
            <li>
              <Link to="/surveys/new">Create Survey</Link>
            </li>
            <li>
              <Link to="/surveys">My Surveys</Link>
            </li>
          </ul>
        </div>
      ) : (
        <div>
          <h2>You are not logged in.</h2>
          <ul>
            <li>
              <Link to="/register">Register</Link>
            </li>
            <li>
              <Link to="/login">Login</Link>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default Home;
