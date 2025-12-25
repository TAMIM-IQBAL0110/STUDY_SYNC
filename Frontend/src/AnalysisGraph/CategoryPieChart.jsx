import React from 'react';

const CategoryPieChart = ({ title, tasks, colorScheme, extraHeader }) => {
  // Aggregate tasks into categories
  const categoryCounts = tasks?.reduce((acc, task) => {
    const cat = task.category || "Others";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {}) || {};

  const data = Object.entries(categoryCounts).map(([name, value]) => ({ name, value }));
  const total = data.reduce((sum, item) => sum + item.value, 0);

  const colors = colorScheme === 'greens' 
    ? ['#10b981', '#059669', '#34d399', '#6ee7b7', '#a7f3d0']
    : ['#f97316', '#ea580c', '#fb923c', '#fdba74', '#fed7aa'];

  // Initialize tracker outside the return for the SVG logic
  let cumulativePercent = 0;

  return (
    <div className="p-8 rounded-2xl shadow-lg group transition-transform duration-300 hover:-translate-y-1" style={{ backgroundColor: 'oklch(1 0.03 245)' }}>
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-xl font-bold" style={{ color: 'oklch(0.15 0.06 245)' }}>{title}</h3>
        {extraHeader}
      </div>

      {total === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 py-10">
          <p className="italic" style={{ color: 'oklch(0.4 0.06 245)' }}>No tasks found for this period</p>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row items-center justify-around gap-6 flex-1">
          <div className="relative w-40 h-40">
            <svg viewBox="0 0 32 32" className="w-full h-full rounded-full -rotate-90">
              {data.map((item, index) => {
                const percent = (item.value / total) * 100;
                const dashArray = `${percent} ${100 - percent}`;
                const dashOffset = -cumulativePercent;
                cumulativePercent += percent; // Update tracker for next slice
                
                return (
                  <g key={index} className="hover:opacity-80 transition-opacity cursor-pointer group/slice">
                    <circle
                      r="16" cx="16" cy="16"
                      fill="transparent"
                      stroke={colors[index % colors.length]}
                      strokeWidth="32"
                      strokeDasharray={dashArray}
                      strokeDashoffset={dashOffset}
                    />
                    <title>{item.name}</title>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="flex flex-col gap-2">
            {data.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[index % colors.length] }}></div>
                <span className="text-sm font-semibold" style={{ color: 'oklch(0.15 0.06 245)' }}>{item.name}</span>
                <span className="text-sm" style={{ color: 'oklch(0.4 0.06 245)' }}>({item.value})</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryPieChart;