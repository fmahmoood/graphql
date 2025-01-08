// Import required Apollo packages
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

// Create the HTTP link that connects to our GraphQL API
const httpLink = createHttpLink({
  // GraphQL endpoint URL
  uri: 'https://learn.reboot01.com/api/graphql-engine/v1/graphql',
});

// Error handling link
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message }) => {
      // If token is expired, clear localStorage and redirect to login
      if (message.includes('JWT') && message.includes('expired')) {
        console.log('Token expired, clearing session...');
        localStorage.removeItem('jwt_token');
        window.location.href = '/login';
      }
    });
  }
});

// Create middleware that will attach the JWT token to every request
const authLink = setContext((_, { headers }) => {
  // Get the raw token from localStorage
  const rawToken = localStorage.getItem('jwt_token');
  
  // Clean the token (remove quotes if present)
  const token = rawToken ? rawToken.replace(/^"|"$/g, '') : '';
  
  // Log token for debugging (first 20 chars)
  console.log('Token being used:', token.substring(0, 20));

  // Return the headers to the context
  return {
    headers: {
      ...headers, // Keep existing headers
      Authorization: token ? `Bearer ${token}` : "", // Note: Capital 'A' in Authorization
    }
  }
});

// Create Apollo Client instance
const client = new ApolloClient({
  link: authLink.concat(httpLink), // Combine auth middleware with httpLink
  cache: new InMemoryCache() // Setup caching
});

export default client;