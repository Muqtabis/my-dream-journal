import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// We must register the components we want to use
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const MoodChart = ({ dreams }) => {
  // 1. Process the dream data
  // We'll show the last 7 dreams in reverse order (oldest to newest)
  const lastSevenDreams = dreams.slice(0, 7).reverse();
  
  // Create labels (like "11/05", "11/06")
  const labels = lastSevenDreams.map(dream => dream.date);
  // Create data points (the mood scores)
  const dataPoints = lastSevenDreams.map(dream => dream.mood);

  // 2. Define the chart's data
  const data = {
    labels: labels,
    datasets: [
      {
        label: 'Mood Score',
        data: dataPoints,
        fill: false,
        borderColor: '#4facfe', // Your theme's accent color
        tension: 0.1,
      },
    ],
  };

  // 3. Define the chart's options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 10, // Assuming your mood scale is 0-10
      },
    },
    plugins: {
      legend: {
        display: false, // Hide the legend for a cleaner look
      },
    },
  };

  return (
    <div style={{ height: '300px' }}> {/* Give the chart a specific height */}
      <Line data={data} options={options} />
    </div>
  );
};

export default MoodChart;