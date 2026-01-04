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
        // Calculate dimensions based on data length - responsive for mobile
        const dataLength = filteredData.length;
        const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
        const minWidth = isMobile ? 300 : 1050;
        const pointSpacing = isMobile ? 20 : 35; // Smaller spacing on mobile
        const viewBoxWidth = Math.max(minWidth, 60 + dataLength * pointSpacing + 50);
        const viewBoxHeight = isMobile ? 310 : 420; // Increased to show date labels
        
        return (
          <svg width={viewBoxWidth} height="100%" viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} preserveAspectRatio="none" style={{ minHeight: viewBoxHeight, display: 'block' }}>
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

            const chartHeight = isMobile ? 220 : 270;
            const chartBottom = isMobile ? 240 : 300;
            const chartTop = isMobile ? 20 : 20;

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
                    const yPos = chartBottom - (val / yAxisMax) * chartHeight
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
                  <line x1="60" y1={chartTop} x2="60" y2={chartBottom} stroke="oklch(0.4 0.06 245)" strokeWidth="2" />
                  <line x1="60" y1={chartBottom} x2={viewBoxWidth - 20} y2={chartBottom} stroke="oklch(0.4 0.06 245)" strokeWidth="2" />

                {/* Y-axis labels */}
                {yGridLines.map((val) => {
                  const yPos = chartBottom - (val / yAxisMax) * chartHeight
                  return (
                    <text
                      key={`label-${val}`}
                      x="50"
                      y={yPos + 5}
                      textAnchor="end"
                      fontSize={isMobile ? "11" : "13"}
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
            
            const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
            const pointSpacing = isMobile ? 20 : 35;
            const chartHeight = isMobile ? 220 : 270;
            const chartBottom = isMobile ? 240 : 300;

            let completedPath = `M 60 ${chartBottom - ((data[0].completed || 0) / yAxisMax) * chartHeight}`
            let pendingPath = `M 60 ${chartBottom - ((data[0].pending || 0) / yAxisMax) * chartHeight}`

            data.forEach((day, idx) => {
              const x = 60 + idx * pointSpacing
              const completedY = chartBottom - ((day.completed || 0) / yAxisMax) * chartHeight
              const pendingY = chartBottom - ((day.pending || 0) / yAxisMax) * chartHeight
              completedPath += ` L ${x} ${completedY}`
              pendingPath += ` L ${x} ${pendingY}`
            })

            const endX = 60 + (data.length - 1) * pointSpacing

            return (
              <>
                {/* Pending line & area */}
                <path
                  d={pendingPath + ` L ${endX} ${chartBottom} L 60 ${chartBottom} Z`}
                  fill="url(#pendingGradient)"
                />
                <path
                  d={pendingPath}
                  stroke="oklch(0.5 0.06 100)"
                  strokeWidth={isMobile ? "2" : "3"}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Completed line & area */}
                <path
                  d={completedPath + ` L ${endX} ${chartBottom} L 60 ${chartBottom} Z`}
                  fill="url(#completedGradient)"
                />
                <path
                  d={completedPath}
                  stroke="oklch(0.5 0.06 160)"
                  strokeWidth={isMobile ? "2" : "3"}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Points */}
                {data.map((day, idx) => {
                  const x = 60 + idx * pointSpacing
                  const completedY = chartBottom - ((day.completed || 0) / yAxisMax) * chartHeight
                  const pendingY = chartBottom - ((day.pending || 0) / yAxisMax) * chartHeight
                  return (
                    <g key={idx}>
                      <circle cx={x} cy={completedY} r={isMobile ? "3" : "4"} fill="oklch(0.5 0.06 160)" />
                      <circle cx={x} cy={pendingY} r={isMobile ? "3" : "4"} fill="oklch(0.5 0.06 100)" />
                    </g>
                  )
                })}

                {/* X-axis date labels - more frequent on mobile */}
                {data.map((day, idx) => {
                  // Show more dates on mobile: every 2 days if 30+ days, else show all
                  const showLabel = isMobile 
                    ? (data.length <= 10 ? true : (idx % 2 === 0 || idx === data.length - 1))
                    : (data.length <= 7 ? true : (idx % 5 === 0 || idx === data.length - 1))
                  
                  if (showLabel) {
                    const x = 60 + idx * pointSpacing
                    
                    // Parse date - could be "YYYY-MM-DD" string or Date object
                    let label = '';
                    let fullDate = '';
                    
                    if (!day.date) {
                      // No date available, use index
                      label = String(idx + 1);
                    } else if (typeof day.date === 'string') {
                      // Format: YYYY-MM-DD, extract day only
                      fullDate = day.date;
                      const parts = day.date.split('-');
                      const dayNum = parseInt(parts[2]);
                      label = isNaN(dayNum) ? String(idx + 1) : String(dayNum);
                    } else {
                      // Try to parse as Date object
                      try {
                        const dateObj = new Date(day.date);
                        if (!isNaN(dateObj.getTime())) {
                          fullDate = dateObj.toISOString().split('T')[0];
                          label = String(dateObj.getDate());
                        } else {
                          label = String(idx + 1);
                        }
                      } catch {
                        label = String(idx + 1);
                      }
                    }
                    
                    const yPos = isMobile ? 280 : 360;
                    
                    return (
                      <text
                        key={`date-${idx}`}
                        x={x}
                        y={yPos}
                        textAnchor="middle"
                        fontSize={isMobile ? "10" : "12"}
                        fontWeight="600"
                        fill="oklch(0.4 0.06 245)"
                        title={fullDate || `Day ${idx + 1}`}
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
