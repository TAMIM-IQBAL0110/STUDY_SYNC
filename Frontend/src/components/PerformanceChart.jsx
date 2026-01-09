import React, { useEffect, useState, useRef } from 'react';
import axiosInstance from '../utilities/axiosInstance.js';
import { API_PATH } from '../utilities/apiPath.js';

const PerformanceChart = () => {
  const [data, setData] = useState([]);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 260, height: 40 });

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        const response = await axiosInstance.get(API_PATH.DASHBOARD.GET_DATA);
        const perf = response.data.last30DaysPerformance || [];
        // Ensure default numbers
        const last30 = perf.slice(-30).map(d => ({
          date: d.date,
          completed: d.completed || 0,
          pending: d.pending || 0
        }));
        setData(last30);
      } catch (err) {
      }
    };
    fetchPerformance();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        const containerHeight = containerRef.current.offsetHeight || 300;
        setDimensions({
          width: Math.max(width - 20, 200),
          height: Math.max(containerHeight - 40, 150)
        });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (data.length === 0) return <p className="text-xs md:text-sm text-gray-500">No data to display</p>;

  const maxTasks = Math.max(...data.map(d => d.completed + d.pending), 1);
  const width = dimensions.width;
  const height = dimensions.height;
  const spacing = data.length > 1 ? width / (data.length - 1) : 0;

  return (
    <div ref={containerRef} className="w-full h-auto overflow-x-auto">
      <svg 
        width={width} 
        height={height}
        className="min-w-full md:min-w-0"
        style={{ minWidth: '200px' }}
      >
        {/* Completed line */}
        <polyline
          fill="none"
          stroke="#10b981"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={data.map((d, i) => `${i * spacing},${height - (d.completed / maxTasks) * height}`).join(' ')}
        />
        {/* Pending line */}
        <polyline
          fill="none"
          stroke="#f59e0b"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={data.map((d, i) => `${i * spacing},${height - (d.pending / maxTasks) * height}`).join(' ')}
        />
      </svg>
    </div>
  );
};

export default PerformanceChart;
