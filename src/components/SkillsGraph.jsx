import React from 'react';

const SkillsGraph = ({ skills }) => {
  // Use the actual skills from the data
  const categories = skills.map(skill => skill.name);
  const maxValue = Math.max(...skills.map(s => s.amount));
  const scale = 100 / maxValue;
  const radius = 100;
  const centerX = 250;
  const centerY = 150;
  const labelOffset = 30; // Additional offset for labels

  // Create grid circles
  const circles = [0.2, 0.4, 0.6, 0.8, 1].map((scale, index) => (
    <circle
      key={index}
      cx={centerX}
      cy={centerY}
      r={radius * scale}
      fill="none"
      stroke="#444"
      strokeWidth="1"
    />
  ));

  // Calculate points for skills
  const points = skills.map((skill, index) => {
    const angle = (index * 2 * Math.PI) / skills.length - Math.PI / 2;
    const value = skill.amount / 100;
    const x = centerX + radius * value * Math.cos(angle);
    const y = centerY + radius * value * Math.sin(angle);
    return `${x},${y}`;
  }).join(' ');

  // Calculate label positions with increased offset
  const labels = skills.map((skill, index) => {
    const angle = (index * 2 * Math.PI) / skills.length - Math.PI / 2;
    const x = centerX + (radius + labelOffset) * Math.cos(angle);
    const y = centerY + (radius + labelOffset) * Math.sin(angle);
    
    // Adjust text anchor based on position
    let textAnchor = "middle";
    if (x < centerX - 10) textAnchor = "end";
    if (x > centerX + 10) textAnchor = "start";

    // Adjust vertical alignment based on position
    let dy = "0.3em";
    if (y < centerY - 10) dy = "0em";
    if (y > centerY + 10) dy = "0.6em";

    return (
      <text
        key={index}
        x={x}
        y={y}
        textAnchor={textAnchor}
        dy={dy}
        fill="#fff"
        fontSize="14"
      >
        {skill.name}
      </text>
    );
  });

  // Create grid lines
  const gridLines = skills.map((_, index) => {
    const angle = (index * 2 * Math.PI) / skills.length - Math.PI / 2;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    return (
      <line
        key={index}
        x1={centerX}
        y1={centerY}
        x2={x}
        y2={y}
        stroke="#444"
        strokeWidth="1"
      />
    );
  });

  return (
    <div className="skills-container">
      <h3>Best skills</h3>
      <div className="graph-container">
        <svg width="600" height="300" viewBox="0 0 500 300">
          {/* Grid circles */}
          {circles}
          
          {/* Grid lines */}
          {gridLines}

          {/* Skills polygon */}
          <polygon
            points={points}
            fill="rgba(147, 112, 219, 0.5)"
            stroke="#9370DB"
            strokeWidth="2"
          />

          {/* Skill labels */}
          {labels}
        </svg>
      </div>

      <style jsx>{`
        .skills-container {
          background: rgba(30, 30, 30, 0.5);
          padding: 20px;
          margin: 20px 0;
        }
        .graph-container {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-top: 20px;
        }
        h3 {
          color: #fff;
          margin: 0 0 10px 0;
        }
      `}</style>
    </div>
  );
};

export default SkillsGraph;
