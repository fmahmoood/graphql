import React from 'react';

const AuditRatioGraph = ({ totalUp, totalDown }) => {
  // Convert to MB by moving decimal point 6 places left
  const totalUpMB = totalUp / 1000000;
  const totalDownMB = totalDown / 1000000;

  const maxValue = Math.max(totalUpMB, totalDownMB);
  const scale = 200 / maxValue; // Scale to fit in 200px height
  const upHeight = totalUpMB * scale;
  const downHeight = totalDownMB * scale;
  const ratio = totalUpMB / totalDownMB;

  return (
    <div className="audit-ratio-container">
      <h3 className="title">Audits ratio</h3>
      <div className="graph-container">
        <svg className="graph" width="600" height="300" viewBox="0 0 400 300">
          {/* Up Bar */}
          <g transform="translate(100, 250)">
            <rect
              x="0"
              y={-upHeight}
              width="40"
              height={upHeight}
              className="up-bar"
            />
            <text x="20" y="20" textAnchor="middle" className="label">
              Done
            </text>
            <text x="20" y={-upHeight - 10} textAnchor="middle" className="value">
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
              className="down-bar"
            />
            <text x="20" y="20" textAnchor="middle" className="label">
              Received
            </text>
            <text x="20" y={-downHeight - 10} textAnchor="middle" className="value">
              {totalDownMB.toFixed(2)} MB ↓
            </text>
          </g>

          {/* Ratio Display */}
          <g transform="translate(300, 250)">
            <text
              className="ratio-text"
              x="0"
              y="-20"
            >
              {ratio.toFixed(1)}
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
};

export default AuditRatioGraph;
