import React from 'react';

const DailyBarChart = ({ data, title }) => {
  const chartData = data && data.length > 0 ? data.slice(-14) : [];
  
  if (!chartData || chartData.length === 0) {
    return (
      <div className="bg-linear-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl shadow-sm border border-blue-100 h-full flex items-center justify-center">
        <p className="text-gray-400 italic">No data available for this period</p>
      </div>
    );
  }

  const validData = chartData.filter(d => d && d.date);
  
  if (validData.length === 0) {
    return (
      <div className="bg-linear-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl shadow-sm border border-blue-100 h-full flex items-center justify-center">
        <p className="text-gray-400 italic">No valid data available</p>
      </div>
    );
  }

  const maxVal = Math.ceil(Math.max(...validData.map(d => (d.completed || 0) + (d.pending || 0)), 5));
  // Ensure Y-axis always shows at least up to 5
  const yAxisMax = Math.max(maxVal, 7);
  const chartHeight = 380;
  const chartPadding = 50;
  const chartWidth = 1400;
  const bottomPadding = 80;

  return (
    <div className="w-full h-full flex flex-col relative">
      {/* SVG Chart */}
      <svg width="100%" height="100%" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="xMidYMid meet" style={{ backgroundColor: 'oklch(0.96 0.03 245)', minHeight: '340px' }}>
        {/* Y-axis Grid Lines and Labels (Integer values: 1, 2, 3, 4, 5...) */}
        {Array.from({ length: yAxisMax }, (_, i) => i + 1).map((val) => {
          const yPos = chartHeight - chartPadding - (val / yAxisMax) * (chartHeight - chartPadding * 1.5);
          return (
            <g key={`grid-${val}`}>
              {/* Grid Line */}
              <line
                x1={chartPadding}
                y1={yPos}
                x2={chartWidth}
                y2={yPos}
                stroke="#e5e7eb"
                strokeWidth="1"
                strokeDasharray="4,4"
              />
              {/* Y-axis Label */}
              <text
                x={chartPadding - 10}
                y={yPos + 5}
                textAnchor="end"
                fontSize="14"
                fontWeight="600"
                fill="#4b5563"
              >
                {val}
              </text>
            </g>
          );
        })}

        {/* Zero line */}
        <line
          x1={chartPadding}
          y1={chartHeight - chartPadding}
          x2={chartWidth}
          y2={chartHeight - chartPadding}
          stroke="#6b7280"
          strokeWidth="2"
        />

        {/* Y-axis */}
        <line
          x1={chartPadding}
          y1={chartHeight - chartPadding - (yAxisMax / yAxisMax) * (chartHeight - chartPadding * 1.5)}
          x2={chartPadding}
          y2={chartHeight - chartPadding}
          stroke="#6b7280"
          strokeWidth="2"
        />

        {/* Bars */}
        {validData.map((day, i) => {
          if (!day || !day.date) return null;

          const completed = day.completed || 0;
          const pending = day.pending || 0;
          const total = completed + pending;

          const barX = chartPadding + (i + 0.15) * (chartWidth - chartPadding) / validData.length;
          const barWidth = (chartWidth - chartPadding) / validData.length * 0.7;
          
          const completedHeight = (completed / yAxisMax) * (chartHeight - chartPadding * 1.5);
          const pendingHeight = (pending / yAxisMax) * (chartHeight - chartPadding * 1.5);

          const dateObj = new Date(day.date);
          const dateNum = dateObj.getDate();

          return (
            <g key={i}>
              {/* Completed (Green) - Bottom section */}
              {completed > 0 && (
                <rect
                  x={barX}
                  y={chartHeight - chartPadding - completedHeight}
                  width={barWidth}
                  height={completedHeight}
                  fill="#10b981"
                  className="hover:fill-emerald-600 transition-colors"
                  opacity="0.9"
                >
                  <title>{completed} Completed</title>
                </rect>
              )}

              {/* Pending (Orange) - Top section, stacked on completed */}
              {pending > 0 && (
                <rect
                  x={barX}
                  y={chartHeight - chartPadding - completedHeight - pendingHeight}
                  width={barWidth}
                  height={pendingHeight}
                  fill="#f97316"
                  className="hover:fill-orange-600 transition-colors"
                  opacity="0.9"
                >
                  <title>{pending} Pending</title>
                </rect>
              )}

              {/* If no data, show minimal line */}
              {total === 0 && (
                <line
                  x1={barX}
                  y1={chartHeight - chartPadding}
                  x2={barX + barWidth}
                  y2={chartHeight - chartPadding}
                  stroke="#d1d5db"
                  strokeWidth="1"
                  opacity="0.5"
                />
              )}

              {/* Date Label - Show every 2nd or 3rd date to avoid crowding */}
              {i % (validData.length > 7 ? 2 : 1) === 0 && (
                <text
                  x={barX + barWidth / 2}
                  y={chartHeight - chartPadding + 25}
                  textAnchor="middle"
                  fontSize="16"
                  fontWeight="700"
                  fill="#1f2937"
                >
                  {dateNum}
                </text>
              )}

              {/* Day Name - Show every 2nd or 3rd day to avoid crowding */}
              {i % (validData.length > 7 ? 2 : 1) === 0 && (
                <text
                  x={barX + barWidth / 2}
                  y={chartHeight - chartPadding + 40}
                  textAnchor="middle"
                  fontSize="14"
                  fontWeight="700"
                  fill="#4b5563"
                >
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dateObj.getDay()]}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default DailyBarChart;