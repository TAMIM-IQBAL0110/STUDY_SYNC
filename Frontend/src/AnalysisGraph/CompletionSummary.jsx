import React from 'react';

const CompletionSummary = ({ stats, label = "Overall Progress", daysLabel = "All Time" }) => {
  // Calculate progress percentage safely
  const progressPercent = stats?.totalTasks
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
    : 0;

  return (
    <div
      className="rounded-xl p-6 shadow-lg mt-8"
      style={{ backgroundColor: 'oklch(1 0.03 245)' }}
    >
      <h2 className="text-xl font-bold mb-4" style={{ color: 'oklch(0.15 0.06 245)' }}>
        {label}
      </h2>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-2">
            <p style={{ color: 'oklch(0.4 0.06 245)' }} className="text-sm">
              {label}
            </p>
            <p className="font-semibold" style={{ color: 'oklch(0.15 0.06 245)' }}>
              {progressPercent}%
            </p>
          </div>
          <div
            className="w-full h-3 rounded-full"
            style={{ backgroundColor: 'oklch(0.85 0.03 245)' }}
          >
            <div
              className="h-full rounded-full transition-all"
              style={{
                backgroundColor: 'oklch(0.4 0.1 245)',
                width: `${progressPercent}%`,
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompletionSummary;
