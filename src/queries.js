import { gql } from '@apollo/client';

export const GET_USER = gql`
  query GetUser {
    user {
      id
      login
      firstName
      lastName
      email
    }
  }
`;

export const GET_USER_BY_ID = gql`
  query GetUserById($id: Int!) {
    user(where: {id: {_eq: $id}}) {
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
          userId: {_eq: $id},
          type: {_like: "skill_%"},
          amount: {_gt: 0}
        }
        order_by: [{amount: desc}]
      ) {
        type
        amount
      }
      audits: audits_aggregate(
        where: {
          auditorId: {_eq: $id},
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
        where: { userId: { _eq: $id }, object: { type: { _eq: "project" } } }
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