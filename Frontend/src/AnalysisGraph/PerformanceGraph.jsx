import React from 'react';
import { FiTrendingUp } from 'react-icons/fi';

const PerformanceGraph = ({ Performance, nDays, className }) => {
  if (!Performance || Performance.length === 0) return null;

  // Filter performance data by nDays - only slice if nDays is specified
  const filteredData = nDays ? Performance.slice(-nDays) : Performance;

  // Validate data structure
  if (filteredData.some(d => typeof d.completed === 'undefined' || typeof d.pending === 'undefined')) {
    return null;
  }

  return (
    <div className={`w-full h-full overflow-x-auto overflow-y-hidden relative ${className}`}>
      {(() => {
        // Calculate dimensions based on data length
        const dataLength = filteredData.length;
        const minWidth = 1050;
        const pointSpacing = 35; // Fixed spacing per point
        const viewBoxWidth = Math.max(minWidth, 60 + dataLength * pointSpacing + 50);
        
        return (
          <svg width={viewBoxWidth} height="100%" viewBox={`0 0 ${viewBoxWidth} 380`} preserveAspectRatio="none" style={{ minHeight: '380px', display: 'block' }}>
            {(() => {
              // Calculate max values first for Y-axis scaling
              const maxCompleted = Math.max(...filteredData.map(d => d.completed || 0), 1)
              const maxPending = Math.max(...filteredData.map(d => d.pending || 0), 1)
              const maxTasks = Math.max(maxCompleted, maxPending)
              // Round up to nearest 5 or 10 for better scale
              const yAxisMax = Math.ceil(maxTasks / 5) * 5
            const yInterval = yAxisMax <= 10 ? 2 : yAxisMax <= 25 ? 5 : yAxisMax <= 50 ? 10 : 25
            const yGridLines = []
            for (let i = 0; i <= yAxisMax; i += yInterval) {
              yGridLines.push(i)
            }

            return (
              <>
                {/* Gradients */}
                <defs>
                  <linearGradient id="completedGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="oklch(0.5 0.06 160)" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="oklch(0.5 0.06 160)" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="pendingGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="oklch(0.5 0.06 100)" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="oklch(0.5 0.06 100)" stopOpacity="0" />
                  </linearGradient>
                </defs>

                  {/* Y-axis grid lines */}
                  {yGridLines.map((val) => {
                    const yPos = 300 - (val / yAxisMax) * 270
                    return (
                      <line
                        key={`grid-${val}`}
                        x1="60"
                        y1={yPos}
                        x2={viewBoxWidth - 20}
                        y2={yPos}
                        stroke="oklch(0.85 0.03 245)"
                        strokeWidth="1"
                        strokeDasharray="5,5"
                      />
                    )
                  })}

                  {/* Axes */}
                  <line x1="60" y1="20" x2="60" y2="300" stroke="oklch(0.4 0.06 245)" strokeWidth="2" />
                  <line x1="60" y1="300" x2={viewBoxWidth - 20} y2="300" stroke="oklch(0.4 0.06 245)" strokeWidth="2" />

                {/* Y-axis labels */}
                {yGridLines.map((val) => {
                  const yPos = 300 - (val / yAxisMax) * 270
                  return (
                    <text
                      key={`label-${val}`}
                      x="50"
                      y={yPos + 5}
                      textAnchor="end"
                      fontSize="13"
                      fontWeight="600"
                      fill="oklch(0.4 0.06 245)"
                    >
                      {val}
                    </text>
                  )
                })}
              </>
            )
          })()}

          {/* Chart Paths */}
          {(() => {
            const data = filteredData;
            if (!data || data.length === 0) return null;
            
            // Calculate max for scale
            const maxCompleted = Math.max(...data.map(d => d.completed || 0), 1)
            const maxPending = Math.max(...data.map(d => d.pending || 0), 1)
            const maxTasks = Math.max(maxCompleted, maxPending)
            const yAxisMax = Math.ceil(maxTasks / 5) * 5
            
            const pointSpacing = 35 // Fixed spacing per point

            let completedPath = `M 60 ${300 - ((data[0].completed || 0) / yAxisMax) * 270}`
            let pendingPath = `M 60 ${300 - ((data[0].pending || 0) / yAxisMax) * 270}`

            data.forEach((day, idx) => {
              const x = 60 + idx * pointSpacing
              const completedY = 300 - ((day.completed || 0) / yAxisMax) * 270
              const pendingY = 300 - ((day.pending || 0) / yAxisMax) * 270
              completedPath += ` L ${x} ${completedY}`
              pendingPath += ` L ${x} ${pendingY}`
            })

            const endX = 60 + (data.length - 1) * pointSpacing

            return (
              <>
                {/* Pending line & area */}
                <path
                  d={pendingPath + ` L ${endX} 300 L 60 300 Z`}
                  fill="url(#pendingGradient)"
                />
                <path
                  d={pendingPath}
                  stroke="oklch(0.5 0.06 100)"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Completed line & area */}
                <path
                  d={completedPath + ` L ${endX} 300 L 60 300 Z`}
                  fill="url(#completedGradient)"
                />
                <path
                  d={completedPath}
                  stroke="oklch(0.5 0.06 160)"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Points */}
                {data.map((day, idx) => {
                  const x = 60 + idx * pointSpacing
                  const completedY = 300 - ((day.completed || 0) / yAxisMax) * 270
                  const pendingY = 300 - ((day.pending || 0) / yAxisMax) * 270
                  return (
                    <g key={idx}>
                      <circle cx={x} cy={completedY} r="4" fill="oklch(0.5 0.06 160)" />
                      <circle cx={x} cy={pendingY} r="4" fill="oklch(0.5 0.06 100)" />
                    </g>
                  )
                })}

                {/* X-axis date labels every 5 days or all if less than 5 days */}
                {data.map((day, idx) => {
                  const showLabel = data.length <= 7 ? true : (idx % 5 === 0 || idx === data.length - 1)
                  if (showLabel) {
                    const x = 60 + idx * pointSpacing
                    
                    // Parse date - could be "YYYY-MM-DD" string or Date object
                    let label = '';
                    let fullDate = '';
                    if (typeof day.date === 'string') {
                      // Format: YYYY-MM-DD, extract day only
                      fullDate = day.date;
                      const parts = day.date.split('-');
                      const dayNum = parseInt(parts[2]);
                      label = String(dayNum);
                    } else {
                      // Try to parse as Date object
                      try {
                        const dateObj = new Date(day.date);
                        if (!isNaN(dateObj.getTime())) {
                          fullDate = dateObj.toISOString().split('T')[0];
                          label = String(dateObj.getDate());
                        } else {
                          label = `${idx + 1}`;
                        }
                      } catch (e) {
                        label = `${idx + 1}`;
                      }
                    }
                    
                    return (
                      <text
                        key={`date-${idx}`}
                        x={x}
                        y="345"
                        textAnchor="middle"
                        fontSize="12"
                        fontWeight="600"
                        fill="oklch(0.4 0.06 245)"
                        title={fullDate}
                      >
                        {label}
                      </text>
                    )
                  }
                  return null
                })}
              </>
            )
          })()}
        </svg>
        );
      })()}
    </div>
  );
};

export default PerformanceGraph;
