// Import required Apollo packages
import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

// Create the HTTP link that connects to our GraphQL API
const httpLink = createHttpLink({
  uri: 'https://learn.reboot01.com/api/graphql-engine/v1/graphql',
});

// Error handling link
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
      );
      // If token is expired, clear localStorage and redirect to login
      if (message.includes('JWT') && message.includes('expired')) {
        console.log('Token expired, clearing session...');
        localStorage.removeItem('jwt_token');
        window.location.href = '/login';
      }
    });
  }
  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
  }
});

// Create middleware that will attach the JWT token to every request
const authLink = setContext((_, { headers }) => {
  // Get the raw token from localStorage
  const rawToken = localStorage.getItem('jwt_token');
  
  // Clean the token (remove quotes if present)
  const token = rawToken ? rawToken.replace(/^"|"$/g, '') : '';
  
  // Return the headers to the context
  return {
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : "",
    }
  }
});

// Create Apollo Client instance
const client = new ApolloClient({
  link: from([errorLink, authLink, httpLink]), // Chain the links in correct order
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'network-only', // Don't use cache for queries
      errorPolicy: 'all'
    },
    query: {
      fetchPolicy: 'network-only', // Don't use cache for queries
      errorPolicy: 'all'
    }
  }
});

export default client;