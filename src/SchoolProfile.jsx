import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_USER, GET_AUDIT_ACTIVITY } from './queries';

function SchoolProfile({ userId }) {
  console.log('SchoolProfile - Received userId:', userId); // Debug log

  // Get user details
  const { 
    data: userData,
    loading: userLoading,
    error: userError 
  } = useQuery(GET_USER);

  // Get audit data
  const { 
    data: auditData,
    loading: auditLoading,
    error: auditError 
  } = useQuery(GET_AUDIT_ACTIVITY, {
    variables: { userId },
    skip: !userId,
    onError: (error) => {
      console.error('Audit Query Error:', error);
    }
  });

  console.log('SchoolProfile - Audit Data:', auditData); // Debug log
  console.log('SchoolProfile - Loading states:', { userLoading, auditLoading }); // Debug log

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

  // Initialize audits array
  const audits = auditData?.progress || [];
  console.log('SchoolProfile - Processed audits:', audits); // Debug log

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
        <h2>Recent Audits</h2>
        <div className="activity-list">
          {!userId ? (
            <p>No user ID available</p>
          ) : audits.length === 0 ? (
            <p>No recent audits found</p>
          ) : (
            audits.map(audit => {
              // Extract project name and audited user from path
              const pathParts = audit.path.split('/');
              const projectName = pathParts[pathParts.length - 2]; // Gets the project name
              const auditedUser = pathParts[pathParts.length - 3]; // Gets the username

              return (
                <div key={audit.id} className="activity-item">
                  <p><strong>Project:</strong> {projectName}</p>
                  <p><strong>Student:</strong> {auditedUser}</p>
                  <p><strong>Status:</strong> {audit.grade ? 'SUCCEEDED' : 'FAILED'}</p>
                  <p><strong>Date:</strong> {new Date(audit.createdAt).toLocaleDateString()}</p>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}

export default SchoolProfile;