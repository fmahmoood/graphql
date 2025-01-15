import React, { useState, useEffect } from 'react';
import { useQuery, useApolloClient } from '@apollo/client';
import { GET_USER } from './queries';
import SchoolProfile from './SchoolProfile';
import './App.css';
import { getUserIdFromToken } from './utils';

function App() {
  const client = useApolloClient();
  const [token, setToken] = useState(localStorage.getItem('jwt_token'));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });

  const clearAuthState = () => {
    localStorage.removeItem('jwt_token');
    setToken(null);
    client.clearStore();
  };

  useEffect(() => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp * 1000 < Date.now()) {
          clearAuthState();
        }
      } catch (e) {
        clearAuthState();
      }
    }
  }, [token]);

  const { data: userData, loading: userLoading, error: userError } = useQuery(GET_USER, {
    skip: !token,
    onError: (error) => {
      console.error('User Query Error:', error);
      if (error.message.includes('JWT') && error.message.includes('expired')) {
        clearAuthState();
      }
    }
  });

  if (token && userLoading) {
    return <div>Loading...</div>;
  }

  if (userError) {
    return <div className="error">Error: {userError.message}</div>;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const combined = `${credentials.username}:${credentials.password}`;
      const encoded = btoa(combined);

      const response = await fetch('https://learn.reboot01.com/api/auth/signin', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${encoded}`
        }
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const token = await response.text();
      const cleanToken = token.replace(/^"|"$/g, '');
      localStorage.setItem('jwt_token', cleanToken);
      setToken(cleanToken);
      
      await client.resetStore();
    } catch (err) {
      setError('Login failed: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    clearAuthState();
  };

  if (!token) {
    return (
      <div className="app-container">
        <div className="login-container">
          <h1>Login</h1>
          <form onSubmit={handleLogin}>
            <div>
              <input
                type="text"
                name="username"
                value={credentials.username}
                onChange={handleInputChange}
                placeholder="Username"
                required
              />
            </div>
            <div>
              <input
                type="password"
                name="password"
                value={credentials.password}
                onChange={handleInputChange}
                placeholder="Password"
                required
              />
            </div>
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
            {error && <div className="error">{error}</div>}
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="profile-header">
        <h1>GraphQL</h1>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
      <div className="profile-sections">
        <SchoolProfile userId={parseInt(userData.user[0].id)} />
      </div>
    </div>
  );
}

export default App;