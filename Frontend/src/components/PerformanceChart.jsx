import React, { useEffect, useState } from 'react';
import axiosInstance from '../utilities/axiosInstance.js';
import { API_PATH } from '../utilities/apiPaths.js';

const PerformanceChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        const response = await axiosInstance.get(API_PATH.DASHBOARD.STATS);
        const perf = response.data.last30DaysPerformance || [];
        // Ensure default numbers
        const last30 = perf.slice(-30).map(d => ({
          date: d.date,
          completed: d.completed || 0,
          pending: d.pending || 0
        }));
        setData(last30);
      } catch (err) {
        console.error('Error fetching performance', err);
      }
    };
    fetchPerformance();
  }, []);

  if (data.length === 0) return <p>No data to display</p>;

  const maxTasks = Math.max(...data.map(d => d.completed + d.pending), 1);
  const width = 260;
  const height = 40;
  const spacing = width / (data.length - 1);

  return (
    <svg width={width} height={height}>
      {/* Completed line */}
      <polyline
        fill="none"
        stroke="green"
        strokeWidth="2"
        points={data.map((d, i) => `${i * spacing},${height - (d.completed / maxTasks) * height}`).join(' ')}
      />
      {/* Pending line */}
      <polyline
        fill="none"
        stroke="orange"
        strokeWidth="2"
        points={data.map((d, i) => `${i * spacing},${height - (d.pending / maxTasks) * height}`).join(' ')}
      />
    </svg>
  );
};

export default PerformanceChart;
