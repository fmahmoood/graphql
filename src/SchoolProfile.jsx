import React, { useState, useEffect } from 'react'
import { getUserIdFromToken } from './utils'

export default function SchoolProfile() {
  const [userData, setUserData] = useState(null)

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    const jwt = localStorage.getItem('jwt_token')
    if (!jwt) {
      console.error('No JWT token found')
      return
    }

    let userId;
    try {
      userId = getUserIdFromToken(jwt);
      console.log('Extracted userId:', userId);
    } catch (error) {
      console.error('Error getting user ID:', error);
      return;
    }

    const query = `
      query($userId: Int!) {
        user(where: {id: {_eq: $userId}}) {
          id
          login
          firstName
          lastName
          email
          auditRatio
          totalUp
          totalDown
          audits: audits_aggregate(
            where: {
              auditorId: {_eq: $userId},
              grade: {_is_null: false}
            },
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
          progresses(where: { userId: { _eq: $userId }, object: { type: { _eq: "project" } } }, order_by: {updatedAt: desc}) {
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
    `

    try {
      const response = await fetch('https://learn.reboot01.com/api/graphql-engine/v1/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          query,
          variables: { userId }
        }),
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const data = await response.json()
      console.log('Received data:', data)
      if (data.data?.user?.[0]) {
        setUserData(data.data.user[0])
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }

  if (!userData) {
    return <div>Loading...</div>
  }

  const getStatus = (grade) => {
    if (grade === null) return <span className="status-pending">Pending</span>
    return grade >= 1 ? <span className="status-pass">Pass</span> : <span className="status-fail">Fail</span>
  }

  return (
    <div className="profile-container">
      <section className="user-info">
        <h2>User Profile</h2>
        <div className="info-card">
          <p><strong>Login:</strong> {userData.login}</p>
          <p><strong>Name:</strong> {userData.firstName} {userData.lastName}</p>
          <p><strong>Email:</strong> {userData.email}</p>
          <p><strong>Audit Ratio:</strong> {Math.round(userData.auditRatio * 10) / 10}</p>
        </div>
      </section>

      <section className="audit-activity">
        <h2>Your audits</h2>
        <p className="audit-description">
          Here you can find back all your audits : the ones you have to make and the ones you've
          already made for other students projects. For the audits you have to do, hover the block to
          get the verification code you'll need to complete the audit on your classmate computer.
        </p>
        <div className="activity-list">
          {userData.audits?.nodes?.length === 0 ? (
            <p>No recent audits found</p>
          ) : (
            userData.audits?.nodes?.map(audit => (
              <div key={audit.id} className="audit-item">
                <div className="audit-info">
                  <span className="project-name">{audit.group?.object?.name}</span>
                  <span className="separator">—</span>
                  <span className="student-name">{audit.group?.captainLogin}</span>
                </div>
                {getStatus(audit.grade)}
              </div>
            ))
          )}
        </div>
      </section>

      <style jsx>{`
        .profile-container {
          padding: 20px;
        }
        .info-card {
          background: rgba(255, 255, 255, 0.05);
          padding: 15px;
          border-radius: 4px;
          margin: 10px 0;
        }
        .audit-description {
          color: #888;
          margin-bottom: 20px;
        }
        .audit-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          margin: 8px 0;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }
        .audit-info {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .project-name, .student-name {
          color: #e1e1e1;
        }
        .separator {
          color: #666;
        }
        .status-pass {
          color: #4CAF50;
          font-weight: 500;
        }
        .status-fail {
          color: #f44336;
          font-weight: 500;
        }
        .status-pending {
          color: #FFC107;
          font-weight: 500;
        }
      `}</style>
    </div>
  )
}