import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function App() {
  const [graphData, setGraphData] = useState({
    labels: [],
    datasets: [{
      label: 'Random Numbers',
      data: [],
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.5)',
    }]
  });

  useEffect(() => {
    console.log('Setting up interval'); // Log when the interval is set up
    const intervalId = setInterval(() => {
      axios.get('http://localhost:5000/random-number')
        .then(response => {
          const newNumber = response.data.random_number;
          console.log('Received number:', newNumber); // Log each number received

          updateChartData(newNumber);
        })
        .catch(error => {
          console.error('Error fetching random number:', error);
        });
    }, 2000);
  
    return () => {
      console.log('Clearing interval'); // Log when the interval is cleared
      clearInterval(intervalId);
    };
  }, []); // The empty dependency array should ensure this effect runs only once  

  const updateChartData = (newNumber) => {
    setGraphData(prevData => {
      console.log("update");
      const maxDataPoints = 15;
      const newData = { ...prevData };
      const { labels, datasets } = newData;
      labels.push(new Date().toISOString().split('T')[1]); // Use precise timestamps
      datasets[0].data.push(newNumber);

      if (labels.length > maxDataPoints) {
        labels.shift();
        datasets[0].data.shift();
      }

      return newData;
    });
  };

  return (
    <div>
      <h1>Real-Time Random Number Graph</h1>
      <Line
        data={graphData}
        options={{
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            tooltip: {
              mode: 'index',
              intersect: false,
            },
          },
          scales: {
            x: {
              display: true, // Optionally, show the timestamp labels for troubleshooting
            },
            y: {
              type: 'linear',
              display: true,
              position: 'left',
            },
          }
        }}
      />
    </div>
  );
}

export default App;
