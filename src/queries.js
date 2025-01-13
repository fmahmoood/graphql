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
      firstName
      lastName
      email
      auditRatio
      totalUp
      totalDown
      skills: transactions(
        where: {
          userId: {_eq: $userId}, 
          type: {_ilike: "skill_%"}
        }
        order_by: [{amount: desc}]
        distinct_on: [type]
      ) {
        type
        amount
      }
      audits: audits_aggregate(
        where: {
          auditorId: {_eq: $userId},
          grade: {_is_null: false}
        }
        order_by: {createdAt: desc}
      ) {
        nodes {
          id
          grade
          createdAt
          group {
            captainLogin
            object {
              name
            }
          }
        }
      }
      progresses(
        where: { userId: { _eq: $userId }, object: { type: { _eq: "project" } } }
        order_by: {updatedAt: desc}
      ) {
        id
        object {
          id
          name
          type
        }
        grade
        createdAt
        updatedAt
      }
    }
  }
`;

// Get audit activity
export const GET_AUDIT_ACTIVITY = gql`
  query GetAuditActivity($userId: Int!) {
    __typename
    audits_aggregate(
      where: {
        auditorId: {_eq: $userId},
        grade: {_is_null: false}
      },
      order_by: {createdAt: desc}
    ) {
      __typename
      nodes {
        __typename
        id
        grade
        createdAt
        group {
          __typename
          captainLogin
          object {
            __typename
            id
            name
          }
        }
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