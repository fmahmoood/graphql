import { gql } from '@apollo/client';

// Basic user query (normal query)
export const GET_USER = gql`
  query GetUser {
    user(limit: 1) {
      id
      login
    }
  }
`;

// Get user profile data
export const GET_USER_PROFILE = gql`
  query GetUserProfile($userId: Int!) {
    user(where: {id: {_eq: $userId}}) {
      id
      login
      attrs
    }
  }
`;

// Get audit activity
export const GET_AUDIT_ACTIVITY = gql`
  query GetAuditActivity($userId: Int!) {
    transaction(
      where: {
        userId: {_eq: $userId},
        type: {_eq: "up"},
        object: {type: {_eq: "audit"}}
      },
      order_by: {createdAt: desc}
    ) {
      id
      type
      amount
      createdAt
      object {
        id
        name
      }
      user {
        id
        login
      }
    }
  }
`;

// Get project results (query with arguments)
export const GET_PROJECT_RESULTS = gql`
  query GetProjectResults($userId: Int!) {
    progress(
      where: { userId: { _eq: $userId } },
      limit: 10,
      order_by: { createdAt: desc }
    ) {
      id
      grade
      createdAt
      updatedAt
      path
    }
  }
`;