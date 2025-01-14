import React from 'react'
import { getUserIdFromToken } from './utils'
import AuditRatioGraph from './components/AuditRatioGraph'
import SkillsGraph from './components/SkillsGraph'
import { useQuery, gql } from '@apollo/client'

const GET_USER_PROFILE = gql`
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

export default function SchoolProfile() {
  const jwt = localStorage.getItem('jwt_token');
  if (!jwt) {
    console.error('No JWT token found');
    return <div>Please log in to view your profile</div>;
  }

  let userId;
  try {
    userId = getUserIdFromToken(jwt);
    console.log('Using userId:', userId);
  } catch (error) {
    console.error('Error getting user ID:', error);
    return <div>Error loading profile: Invalid token</div>;
  }

  const { loading, error, data } = useQuery(GET_USER_PROFILE, {
    variables: { userId },
    fetchPolicy: 'network-only'
  });

  if (loading) return <div>Loading...</div>;
  
  if (error) {
    console.error('GraphQL Error:', error);
    return <div>Error loading profile: {error.message}</div>;
  }

  if (!data || !data.user || data.user.length === 0) {
    console.error('No user data found:', JSON.stringify(data, null, 2));
    return <div>No user data found</div>;
  }

  const userData = data.user[0];
  console.log('User data received:', JSON.stringify(userData, null, 2));
  console.log('Raw skills data:', userData.skills);
  
  const getStatus = (grade) => {
    if (grade === null) return <span className="status-pending">Pending</span>;
    return grade >= 1 ? <span className="status-pass">Pass</span> : <span className="status-fail">Fail</span>;
  };

  const calculateSkillsData = (skills) => {
    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      console.log('No skills data available');
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
      // First map all skills to their proper names and amounts
      const skillsMap = {};
      
      skills.forEach(skill => {
        if (!skill || !skill.type || typeof skill.amount !== 'number') return;
        
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

      // Convert to array, sort by amount and take top 6
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
    // Get the last part of the path
    const parts = path.split('/');
    return parts[parts.length - 1];
  };

  const formatGrade = (grade) => {
    if (grade === null || grade === undefined) return 'Pending';
    return 'Succeeded';
  };

  // Get skills data safely
  const skillsData = calculateSkillsData(userData?.skills);
  console.log('Processed skills data:', skillsData);

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="user-info">
          <h1>{userData.login}</h1>
          <p>{userData.email}</p>
        </div>
        <button className="logout-button" onClick={() => console.log('Logout button clicked')}>
          Logout
        </button>
      </div>

      <div className="stats-container">
        <div className="graphs-container">
          <SkillsGraph skills={skillsData} />
          <AuditRatioGraph 
            auditRatio={userData.auditRatio} 
            totalUp={userData.totalUp}
            totalDown={userData.totalDown}
          />
        </div>
      </div>

      <section className="audit-activity">
        <h2>Your audits</h2>
        <p className="audit-description">
          Here you can find back all your audits : the ones you have to make and the ones you've
          already made for other students projects. For the audits you have to do, hover the block to
          get the verification code you'll need to complete the audit on your classmate computer.
        </p>
        <div className="activity-list">
          {!userData.audits?.nodes?.length ? (
            <p>No recent audits found</p>
          ) : (
            userData.audits.nodes.map(audit => (
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

      <section className="recent-progress">
        <h2>Recent Progress</h2>
        {userData.progresses.map((progress) => (
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

      <style jsx>{`
        .profile-container {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .profile-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .user-info {
          margin-right: 20px;
        }
        .stats-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        .graphs-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }
        .audit-activity {
          background: #fff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .audit-description {
          color: #666;
          margin-bottom: 20px;
        }
        .activity-list {
          display: grid;
          gap: 10px;
        }
        .audit-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px;
          background: #f5f5f5;
          border-radius: 4px;
        }
        .audit-info {
          display: flex;
          gap: 10px;
          align-items: center;
        }
        .separator {
          color: #999;
        }
        .project-name {
          font-weight: 500;
        }
        .student-name {
          color: #666;
        }
        .recent-progress {
          background: rgba(30, 30, 30, 0.5);
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        .progress-item {
          background: rgba(40, 40, 40, 0.5);
          padding: 15px;
          margin: 10px 0;
          border-radius: 5px;
        }
        .progress-item div {
          margin: 5px 0;
        }
        .progress-item strong {
          color: #9580ff;
        }
        h2 {
          color: #fff;
          margin: 0 0 15px 0;
        }
      `}</style>
    </div>
  );
}