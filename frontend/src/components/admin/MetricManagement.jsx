import React, { useEffect, useState } from "react";
import AAPI from "../../api"; // Adjust to your setup
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { FaSync } from "react-icons/fa";

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

const MetricManagement = () => {
  const [realtime, setRealtime] = useState({ cpuUsage: 0, memoryUsage: 0 });
  const [historical, setHistorical] = useState([]);
  const [timeRange, setTimeRange] = useState(30); // Default to last 30 minutes
  const [refreshInterval, setRefreshInterval] = useState(5000); // Default 5 seconds

  const fetchRealtime = async () => {
    const { data } = await AAPI.get("/api/metrics/realtime");
    setRealtime(data);
  };

  const fetchHistorical = async () => {
    const { data } = await AAPI.get("/api/metrics/historical");
    const filteredData = data.filter((metric) => {
      const metricTime = new Date(metric.timestamp);
      const now = new Date();
      return metricTime >= new Date(now - timeRange * 60 * 1000); // Filter by time range
    });
    setHistorical(filteredData);
  };

  const handleRefresh = async () => {
    await fetchHistorical();
  };

  useEffect(() => {
    fetchRealtime();
    fetchHistorical();
    const interval = setInterval(fetchRealtime, refreshInterval);
    return () => clearInterval(interval); // Cleanup interval on unmount
  }, [timeRange, refreshInterval]);

  const cpuGraphData = {
    labels: historical.map((metric) => new Date(metric.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: "CPU Usage (%)",
        data: historical.map((metric) => metric.cpuUsage),
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        fill: true,
      },
    ],
  };

  const memoryGraphData = {
    labels: historical.map((metric) => new Date(metric.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: "Memory Usage (%)",
        data: historical.map((metric) => metric.memoryUsage),
        borderColor: "rgba(54, 162, 235, 1)",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        fill: true,
      },
    ],
  };

  const graphOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "System Metrics Over Time",
      },
    },
    scales: {
      x: {
        type: "category",
        title: {
          display: true,
          text: "Time",
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Usage (%)",
        },
      },
    },
  };

  return (
    <div className="container">
      <h1 className="text-center my-4">System Metrics</h1>
      <div className="row mb-4">
        <div className="col text-center">
          <p className="mb-1">
            Real-Time CPU Usage: <strong>{realtime.cpuUsage}%</strong>
          </p>
          <p>
            Real-Time Memory Usage: <strong>{realtime.memoryUsage}%</strong>
          </p>
        </div>
      </div>
      <div className="row mb-4">
        <div className="col">
          <button className="btn btn-primary me-2" onClick={handleRefresh}>
            <FaSync className="me-2" />
            Refresh Charts
          </button>
          <select
            className="form-select d-inline-block w-auto me-2"
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
          >
            <option value={10}>Last 10 minutes</option>
            <option value={30}>Last 30 minutes</option>
            <option value={60}>Last 1 hour</option>
          </select>
          <select
            className="form-select d-inline-block w-auto"
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
          >
            <option value={1000}>Every 1 second</option>
            <option value={5000}>Every 5 seconds</option>
            <option value={10000}>Every 10 seconds</option>
          </select>
        </div>
      </div>
      <div className="row">
        <div className="col-md-6">
          <h2 className="text-center">CPU Usage</h2>
          <div className="chart-container w-100" style={{ height: "400px" }}>
            <Line data={cpuGraphData} options={graphOptions} />
          </div>
        </div>
        <div className="col-md-6">
          <h2 className="text-center">Memory Usage</h2>
          <div className="w-100" style={{ height: "400px" }}>
            <Line data={memoryGraphData} options={graphOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricManagement;
