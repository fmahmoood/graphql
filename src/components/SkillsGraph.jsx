import React from 'react';

const SkillsGraph = ({ skills }) => {
  const categories = ['Prog', 'Go', 'Front-End', 'Js', 'Back-End', 'Html'];
  const maxValue = Math.max(...skills.map(s => s.amount));
  const scale = 100 / maxValue;
  const centerX = 150;
  const centerY = 150;
  const radius = 100;

  // Calculate points for the radar chart
  const getPoint = (index, value) => {
    const angle = (Math.PI * 2 * index) / categories.length - Math.PI / 2;
    const scaledValue = value * scale;
    return {
      x: centerX + radius * (scaledValue / 100) * Math.cos(angle),
      y: centerY + radius * (scaledValue / 100) * Math.sin(angle)
    };
  };

  // Create the polygon points for the radar chart
  const points = skills.map((skill, i) => {
    const point = getPoint(i, skill.amount);
    return `${point.x},${point.y}`;
  }).join(' ');

  // Create axis lines and labels
  const axes = categories.map((category, i) => {
    const angle = (Math.PI * 2 * i) / categories.length - Math.PI / 2;
    const endX = centerX + radius * Math.cos(angle);
    const endY = centerY + radius * Math.sin(angle);
    const labelX = centerX + (radius + 30) * Math.cos(angle);
    const labelY = centerY + (radius + 30) * Math.sin(angle);

    return (
      <g key={category}>
        <line
          x1={centerX}
          y1={centerY}
          x2={endX}
          y2={endY}
          stroke="#444"
          strokeWidth="1"
        />
        <text
          x={labelX}
          y={labelY}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#fff"
        >
          {category}
        </text>
      </g>
    );
  });

  // Create circular grid lines
  const circles = [0.2, 0.4, 0.6, 0.8, 1].map((percentage, i) => (
    <circle
      key={i}
      cx={centerX}
      cy={centerY}
      r={radius * percentage}
      fill="none"
      stroke="#444"
      strokeWidth="1"
    />
  ));

  return (
    <div className="skills-container">
      <h3>Best skills</h3>
      <p className="description">
        Here are your skills with the highest completion rate among all categories.
      </p>
      <div className="graph-container">
        <svg width="300" height="300" viewBox="0 0 300 300">
          {/* Grid circles */}
          {circles}
          
          {/* Axis lines and labels */}
          {axes}
          
          {/* Skills polygon */}
          <polygon
            points={points}
            fill="rgba(149, 128, 255, 0.5)"
            stroke="#9580ff"
            strokeWidth="2"
          />
        </svg>
      </div>

      <style jsx>{`
        .skills-container {
          background: rgba(30, 30, 30, 0.5);
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        .graph-container {
          margin-top: 20px;
        }
        h3 {
          margin: 0;
          color: #fff;
          font-size: 1.5rem;
        }
        .description {
          color: #888;
          font-size: 0.9rem;
          margin-top: 8px;
        }
      `}</style>
    </div>
  );
};

export default SkillsGraph;
