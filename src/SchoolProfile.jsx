import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_USER_BY_ID } from './queries';
import SkillsGraph from './components/SkillsGraph';
import AuditRatioGraph from './components/AuditRatioGraph';

function SchoolProfile({ userId }) {
  const { data: userData, loading, error } = useQuery(GET_USER_BY_ID, {
    variables: { id: userId }
  });

  if (loading) return <div>Loading profile...</div>;
  if (error) return <div>Error loading profile: {error.message}</div>;
  if (!userData?.user?.[0]) return <div>No user data found</div>;

  const calculateSkillsData = (skills) => {
    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      return [];
    }

    const technicalSkillNames = {
      'prog': 'Elementary programming',
      'back-end': 'Back-end',
      'front-end': 'Front-end',
      'algo': 'Elementary algorithms',
      'sys-admin': 'System administration',
      'game': 'Game programming'
    };

    const technologyNames = {
      'go': 'Go',
      'js': 'JS',
      'php': 'PHP',
      'c': 'C',
      'python': 'Python',
      'html': 'HTML',
      'css': 'CSS',
      'sql': 'SQL',
      'unix': 'Unix',
      'docker': 'Docker',
      'rust': 'Rust',
      'ruby': 'Ruby'
    };

    try {
      const skillsMap = {};
      
      skills.forEach(skill => {
        if (!skill?.type || typeof skill.amount !== 'number') return;
        
        const baseName = skill.type.replace('skill_', '').toLowerCase();
        const currentAmount = skillsMap[baseName]?.amount || 0;
        
        if (!skillsMap[baseName] || currentAmount < skill.amount) {
          let name = baseName;
          if (technicalSkillNames[baseName]) {
            name = technicalSkillNames[baseName];
          } else if (technologyNames[baseName]) {
            name = technologyNames[baseName];
          } else {
            name = baseName.split('-')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
              .join('-');
          }
          
          skillsMap[baseName] = {
            name,
            amount: Math.round(skill.amount)
          };
        }
      });

      return Object.values(skillsMap)
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 6);
    } catch (error) {
      console.error('Error processing skills data:', error);
      return [];
    }
  };

  const formatProjectName = (path) => {
    if (!path) return '';
    const parts = path.split('/');
    return parts[parts.length - 1];
  };

  const formatGrade = (grade) => {
    if (grade === null || grade === undefined) return 'Pending';
    return 'Succeeded';
  };

  const getAuditStatus = (grade) => {
    return grade >= 1 ? 'SUCCEEDED' : 'FAILED';
  };

  const skillsData = calculateSkillsData(userData.user[0].skills);

  return (
    <div className="profile-container">
      <div className="content-wrapper">
        <section className="user-info">
          <h2>Welcome, {userData.user[0].firstName} {userData.user[0].lastName}</h2>
          <div className="info-card">
            <p><strong>Login:</strong> {userData.user[0].login}</p>
            <p><strong>Name:</strong> {userData.user[0].firstName} {userData.user[0].lastName}</p>
            <p><strong>Email:</strong> {userData.user[0].email}</p>
          </div>
        </section>

        <div className="graphs-container">
          <AuditRatioGraph 
            totalUp={userData.user[0].totalUp || 0} 
            totalDown={userData.user[0].totalDown || 0} 
          />
          <SkillsGraph skills={skillsData} />
        </div>

        <section className="audit-activity">
          <h2>Your audits</h2>
          <div className="activity-list">
            {!userData.user[0].audits?.nodes?.length ? (
              <p>No recent audits found</p>
            ) : (
              userData.user[0].audits.nodes.map(audit => (
                <div key={audit.id} className="audit-item">
                  <div className="audit-info">
                    <span className="project-name">{audit.group?.object?.name}</span>
                    <span className="separator">—</span>
                    <span className="student-name">{audit.group?.captainLogin}</span>
                  </div>
                  <span className={`audit-status ${getAuditStatus(audit.grade).toLowerCase()}`}>
                    {getAuditStatus(audit.grade)}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="recent-progress">
          <h2>Recent Progress</h2>
          {userData.user[0].progresses.map((progress) => (
            <div key={progress.id} className="progress-item">
              <div className="project">
                <strong>Project: </strong>
                {formatProjectName(progress.object.name)}
              </div>
              <div className="grade">
                <strong>Grade: </strong>
                {formatGrade(progress.grade)}
              </div>
              <div className="date">
                <strong>Date: </strong>
                {new Date(progress.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </section>
      </div>
      <style jsx>{`
        .profile-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: #2b2b2b;
          padding: 0;
          margin: 0;
        }

        .content-wrapper {
          flex: 1;
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
          padding: 2rem;
          box-sizing: border-box;
        }

        .user-info {
          background: #363636;
          padding: 1.5rem;
          margin-bottom: 2rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          border: 1px solid #444;
        }

        .graphs-container {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2rem;
          margin: 2rem 0;
          width: 100%;
        }

        .info-card {
          background: #363636;
          padding: 20px;
          border: 1px solid #444;
        }

        .info-card p {
          color: #e4e4e4;
          margin: 8px 0;
        }

        .info-card strong {
          color: ##f9f9f9;
          width: 80px;
          display: inline-block;
        }

        .audit-activity,
        .recent-progress {
          background: #363636;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          width: 100%;
          box-sizing: border-box;
        }

        h2 {
          color: #e4e4e4;
          font-family: 'Fira Code', monospace;
          font-size: 1.5rem;
          margin: 0 0 15px 0;
          font-weight: 500;
          border-bottom: 1px solid #444;
          padding-bottom: 10px;
        }

        .activity-list {
          display: grid;
          gap: 10px;
          width: 100%;
        }

        .audit-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: #2b2b2b;
          border: 1px solid #444;
        }

        .audit-info {
          display: flex;
          gap: 10px;
          align-items: center;
          font-family: 'Fira Code', monospace;
        }

        .separator {
          color: #666;
        }

        .project-name {
          font-weight: 500;
          color: #e4e4e4;
        }

        .student-name {
          color: #999;
        }

        .audit-status {
          font-family: 'Fira Code', monospace;
          font-weight: 500;
          padding: 4px 8px;
          font-size: 0.9em;
        }

        .audit-status.succeeded {
          color: #00ff9d;
        }

        .audit-status.failed {
          color: #ff4444;
        }

        .recent-progress {
          background: #363636;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          border: 1px solid #444;
          width: 100%;
        }

        .progress-item {
          background: #2b2b2b;
          padding: 15px;
          margin: 10px 0;
          border: 1px solid #444;
        }

        .progress-item div {
          margin: 5px 0;
          font-family: 'Fira Code', monospace;
        }

        .progress-item strong {
          color: #fff;
          width: 80px;
          display: inline-block;
        }

        @media (max-width: 1200px) {
          .graphs-container {
            grid-template-columns: 1fr;
          }
          .content-wrapper {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
}

export default SchoolProfile;