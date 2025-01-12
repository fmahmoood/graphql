import React from 'react';

const AuditRatioGraph = ({ totalUp, totalDown }) => {
  const maxValue = Math.max(totalUp, totalDown);
  const scale = 200 / maxValue; // Scale to fit in 200px height
  const upHeight = totalUp * scale;
  const downHeight = totalDown * scale;
  const ratio = totalUp / totalDown;

  return (
    <div className="audit-ratio-container">
      <h3>Audits ratio</h3>
      <div className="graph-container">
        <svg width="300" height="300" viewBox="0 0 300 300">
          {/* Up Bar */}
          <g transform="translate(50, 250)">
            <rect
              x="40"
              y={-upHeight}
              width="40"
              height={upHeight}
              fill="#FFD700"
            />
            <text x="60" y="-5" textAnchor="middle" fill="#888">
              Done
            </text>
            <text x="60" y={-upHeight - 20} textAnchor="middle" fill="#FFD700">
              {totalUp.toFixed(2)} MB ↑
            </text>
          </g>

          {/* Down Bar */}
          <g transform="translate(50, 250)">
            <rect
              x="120"
              y={-downHeight}
              width="40"
              height={downHeight}
              fill="#FFFFFF"
            />
            <text x="140" y="-5" textAnchor="middle" fill="#888">
              Received
            </text>
            <text x="140" y={-downHeight - 20} textAnchor="middle" fill="#FFFFFF">
              {totalDown.toFixed(2)} MB ↓
            </text>
          </g>

          {/* Ratio Display */}
          <g transform="translate(230, 150)">
            <text
              className="ratio-text"
              x="0"
              y="0"
              fontSize="48"
              fontWeight="bold"
              fill="#FFD700"
            >
              {ratio.toFixed(1)}
            </text>
            <text x="0" y="30" fontSize="14" fill="#888">
              You can do better!
            </text>
          </g>
        </svg>
      </div>

      <style jsx>{`
        .audit-ratio-container {
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
      `}</style>
    </div>
  );
};

export default AuditRatioGraph;
