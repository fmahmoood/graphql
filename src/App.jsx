import React, { useState, useEffect } from 'react';
import { useQuery, useApolloClient } from '@apollo/client';
import { GET_USER, GET_PROJECT_RESULTS } from './queries';
import SchoolProfile from './SchoolProfile';
import './App.css';

function App() {
  const client = useApolloClient();
  // State for auth and UI
  const [token, setToken] = useState(localStorage.getItem('jwt_token'));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });

  // Clear Apollo cache and token when logging out
  const clearAuthState = () => {
    localStorage.removeItem('jwt_token');
    setToken(null);
    // Clear Apollo cache to prevent stale data
    client.clearStore();
  };

  // Check token validity
  useEffect(() => {
    if (token) {
      // Check if token is expired
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expTime = payload.exp * 1000;
        if (Date.now() >= expTime) {
          console.log('Token expired on load, clearing auth state...');
          clearAuthState();
        }
      } catch (err) {
        console.error('Error checking token:', err);
        clearAuthState();
      }
    }
  }, [token]);

  // Execute GraphQL queries when logged in
  const { data: userData, loading: userLoading, error: userError } = useQuery(GET_USER, {
    skip: !token,
    onError: (error) => {
      console.error('User Query Error:', error);
      if (error.message.includes('JWT') && error.message.includes('expired')) {
        clearAuthState();
      }
    }
  });

  console.log('App - User Data:', userData); // Debug log
  console.log('App - Token present:', !!token); // Debug log

  const { data: progressData, loading: progressLoading } = useQuery(GET_PROJECT_RESULTS, {
    skip: !token || !userData?.user?.[0]?.id,
    variables: {
      userId: userData?.user?.[0]?.id ? parseInt(userData.user[0].id) : null
    },
    onError: (error) => {
      console.error('Progress Query Error:', error);
      if (error.message.includes('JWT') && error.message.includes('expired')) {
        clearAuthState();
      }
    }
  });

  console.log('App - Progress Data:', progressData); // Debug log

  // Show loading state while fetching initial user data
  if (token && userLoading) {
    return <div>Loading user information...</div>;
  }

  // Show error if user query fails
  if (userError) {
    console.error('User Query Error:', userError);
    return <div>Error loading user data: {userError.message}</div>;
  }

  // Handle login form submission
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
      
      // Reset Apollo cache on login
      await client.resetStore();

    } catch (err) {
      setError('Login failed: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    clearAuthState();
  };

  // If not logged in, show login form
  if (!token) {
    return (
      <div className="loginContainer">
        <form onSubmit={handleLogin}>
          <h2>School Login</h2>
          
          <div className="inputGroup">
            <input
              type="text"
              placeholder="Username"
              value={credentials.username}
              onChange={(e) => setCredentials({
                ...credentials,
                username: e.target.value
              })}
            />
          </div>

          <div className="inputGroup">
            <input
              type="password"
              placeholder="Password"
              value={credentials.password}
              onChange={(e) => setCredentials({
                ...credentials,
                password: e.target.value
              })}
            />
          </div>

          {error && <div className="error">{error}</div>}
          
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    );
  }

  // If logged in and have user data, show profile
  if (token && userData?.user?.[0]) {
    return (
      <div>
        <button className="logout-button" onClick={handleLogout}>Logout</button>
        <h1>Profile Data</h1>

        <div className="profile-sections">
          {/* School Profile Component with Audit Activity */}
          <SchoolProfile userId={parseInt(userData.user[0].id)} />
        </div>
      </div>
    );
  }

  return <div>Loading profile data...</div>;
}

export default App;