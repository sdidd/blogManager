import React, { useEffect, useState, useRef } from 'react';
import API from '../../api'; // Adjust to your setup
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

const MetricManagement = () => {
  const [realtime, setRealtime] = useState({ cpuUsage: 0, memoryUsage: 0 });
  const [historical, setHistorical] = useState([]);
  const chartRef = useRef(null);

  useEffect(() => {
    const fetchRealtime = async () => {
      const { data } = await API.get('/api/metrics/realtime');
      setRealtime(data);
    };

    const fetchHistorical = async () => {
      const { data } = await API.get('/api/metrics/historical');
      setHistorical(data);
    };

    fetchRealtime();
    fetchHistorical();
    const interval = setInterval(fetchRealtime, 5000); // Fetch every 5 seconds
    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

  const graphData = {
    labels: historical.map(metric =>
      new Date(metric.timestamp).toLocaleTimeString()
    ),
    datasets: [
      {
        label: 'CPU Usage (%)',
        data: historical.map(metric => metric.cpuUsage),
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        fill: true,
      },
      {
        label: 'Memory Usage (%)',
        data: historical.map(metric => metric.memoryUsage),
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        fill: true,
      },
    ],
  };

  const graphOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'System Metrics Over Time',
      },
    },
    scales: {
      x: {
        type: 'category',
        title: {
          display: true,
          text: 'Time',
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Usage (%)',
        },
      },
    },
  };

  return (
    <div>
      <h1>System Metrics</h1>
      <div>
        <p>Real-Time CPU Usage: {realtime.cpuUsage}%</p>
        <p>Real-Time Memory Usage: {realtime.memoryUsage}%</p>
      </div>
      <div style={{ width: '600px', height: '400px' }}>
        <Line ref={chartRef} data={graphData} options={graphOptions} />
      </div>
    </div>
  );
};

export default MetricManagement;
