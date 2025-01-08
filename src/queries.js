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

// Get audit activity
export const GET_AUDIT_ACTIVITY = gql`
  query GetAuditActivity($userId: Int!) {
    progress(
      where: {
        userId: {_eq: $userId},
        path: {_ilike: "%/audit/%"}
      },
      order_by: {createdAt: desc}
    ) {
      id
      grade
      createdAt
      path
      object {
        id
        name
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