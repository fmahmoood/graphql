import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_USER_PROFILE, GET_AUDIT_ACTIVITY } from './queries';

export default function SchoolProfile({ userId }) {
  const { data: userData, loading: userLoading, error: userError } = useQuery(GET_USER_PROFILE, {
    variables: { userId },
    skip: !userId,
  });

  const { data: auditData, loading: auditLoading, error: auditError } = useQuery(GET_AUDIT_ACTIVITY, {
    variables: { userId },
    skip: !userId,
  });

  const audits = auditData?.transaction || [];
  console.log('SchoolProfile - Processed audits:', audits);

  // Show loading state if either query is loading
  if (userLoading || auditLoading) {
    return <div className="loading">Loading profile data...</div>;
  }

  // Show error state if either query has an error
  if (userError || auditError) {
    console.error('User Error:', userError);
    console.error('Audit Error:', auditError);
    return <div className="error">Error: {(userError || auditError)?.message}</div>;
  }

  return (
    <div className="profile-container">
      {/* Basic User Info Section */}
      <section className="user-info">
        <h2>User Profile</h2>
        <div className="info-card">
          <p><strong>Login:</strong> {userData?.user?.[0]?.login}</p>
          <p><strong>User ID:</strong> {userId}</p>
        </div>
      </section>

      {/* Audit Activity Section */}
      <section className="audit-activity">
        <h2>Your audits</h2>
        <p className="audit-description">
          Here you can find back all your audits : the ones you have to make and the ones you've already made for other students projects.
          For the audits you have to do, hover the block to get the verification code you'll need to complete the audit on your classmate computer.
        </p>
        <div className="activity-list">
          {!userId ? (
            <p>No user ID available</p>
          ) : audits.length === 0 ? (
            <p>No recent audits found</p>
          ) : (
            audits.map(audit => (
              <div key={audit.id} className="audit-item">
                <div className="audit-info">
                  <span className="project-name">{audit.object?.name || 'Unknown Project'}</span>
                  <span className="separator">—</span>
                  <span className="student-name">{audit.user?.login || 'Unknown Student'}</span>
                </div>
                <div className={`audit-status ${audit.amount > 0 ? 'succeeded' : 'failed'}`}>
                  {audit.amount > 0 ? 'SUCCEEDED' : 'FAILED'}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Recent Progress Section */}
      <section className="recent-progress">
        <h2>Recent Progress</h2>
        <div className="progress-list">
          {userData?.user?.[0]?.progress?.map((item, index) => (
            <div key={index} className="progress-item">
              <p><strong>Project:</strong> {item.project}</p>
              {item.grade && <p><strong>Grade:</strong> {item.grade}</p>}
              {item.date && <p><strong>Date:</strong> {item.date}</p>}
            </div>
          ))}
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
        .audit-status {
          font-size: 14px;
          font-weight: 500;
        }
        .audit-status.succeeded {
          color: #4CAF50;
        }
        .audit-status.failed {
          color: #f44336;
        }
        .progress-item {
          padding: 15px;
          margin: 10px 0;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}