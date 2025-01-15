import React from 'react';

const AuditRatioGraph = ({ totalUp, totalDown }) => {
  // Convert bytes to megabytes
  const totalUpMB = totalUp / (1024 * 1024);
  const totalDownMB = totalDown / (1024 * 1024);

  const maxValue = Math.max(totalUpMB, totalDownMB);
  const scale = 200 / maxValue; // Scale to fit in 200px height
  const upHeight = totalUpMB * scale;
  const downHeight = totalDownMB * scale;
  const ratio = totalUpMB / totalDownMB;

  return (
    <div className="audit-ratio-container">
      <h3>Audits ratio</h3>
      <div className="graph-container">
        <svg width="600" height="300" viewBox="0 0 400 300">
          {/* Up Bar */}
          <g transform="translate(100, 250)">
            <rect
              x="0"
              y={-upHeight}
              width="40"
              height={upHeight}
              fill="#FFD700"
              className="up-bar"
            />
            <text x="20" y="20" textAnchor="middle" fill="#888">
              Done
            </text>
            <text x="20" y={-upHeight - 10} textAnchor="middle" fill="#FFD700">
              {totalUpMB.toFixed(2)} MB ↑
            </text>
          </g>

          {/* Down Bar */}
          <g transform="translate(200, 250)">
            <rect
              x="0"
              y={-downHeight}
              width="40"
              height={downHeight}
              fill="#FFFFFF"
              className="down-bar"
            />
            <text x="20" y="20" textAnchor="middle" fill="#888">
              Received
            </text>
            <text x="20" y={-downHeight - 10} textAnchor="middle" fill="#FFFFFF">
              {totalDownMB.toFixed(2)} MB ↓
            </text>
          </g>

          {/* Ratio Display */}
          <g transform="translate(300, 250)">
            <text
              className="ratio-text"
              x="0"
              y="-20"
              fontSize="32"
              fontWeight="bold"
              fill="#FFD700"
            >
              {ratio.toFixed(1)}
            </text>
            <text x="0" y="20" fontSize="14" fill="#888">
              You can do better!
            </text>
          </g>
        </svg>
      </div>

      <style jsx>{`
        .audit-ratio-container {
          background: rgba(30, 30, 30, 0.5);
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
      `}</style>
    </div>
  );
};

export default AuditRatioGraph;
