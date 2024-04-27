import React, { useState, useEffect, useRef } from 'react';
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
    standard: [],
    volatile: [],
    biased_positive: [],
    biased_negative: []
  });

  const [graphType, setGraphType] = useState('standard');
  const prevType = useRef(null);

  useEffect(() => {
    const fetchData = (type) => {
      axios.get(`http://localhost:5000/random-number/${type}`)
        .then(response => {
          const newNumber = response.data.random_number;
          updateChartData(newNumber, type);
        })
        .catch(error => {
          console.error('Error fetching data:', error);
        });
    };

    if (graphType === 'all') {
      ['standard', 'volatile', 'biased_positive', 'biased_negative'].forEach(type => fetchData(type));
    } else {
      fetchData(graphType);
    }
    const intervalId = setInterval(() => {
      if (graphType === 'all') {
        ['standard', 'volatile', 'biased_positive', 'biased_negative'].forEach(type => fetchData(type));
      } else {
        fetchData(graphType);
      }
    }, 2000);
    return () => clearInterval(intervalId);
  }, [graphType]);

  const updateChartData = (newNumber, type) => {
    setGraphData(prevData => {
      const maxDataPoints = 15;
      const newData = { ...prevData };
      const labels = newData[type].labels || [];
      const data = newData[type].data || [];
      
      labels.push(new Date().toISOString().split('T')[1]);
      data.push(newNumber);

      if (labels.length > maxDataPoints) {
        labels.shift();
        data.shift();
      }

      newData[type] = { labels, data };
      return newData;
    });
  };

  const graphComponents = Object.keys(graphData).map((type) => (
    <div key={type} style={{ width: '50%', height: '50%' }}>
      <h3>{type.replace('_', ' ').toUpperCase()}</h3>
      <Line
        data={{
          labels: graphData[type].labels,
          datasets: [{
            label: `Random Numbers - ${type}`,
            data: graphData[type].data,
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
          }]
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
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
              display: true,
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
  ));

  return (
    <div style={{ display: 'flex', width: '100%', height: '90vh' }}>
      <div style={{ display: 'flex', flexDirection: 'column', margin: '10px' }}>
        <button style={{ margin: '5px', width: '150px' }} onClick={() => setGraphType('standard')}>Standard</button>
        <button style={{ margin: '5px', width: '150px' }} onClick={() => setGraphType('volatile')}>Volatile</button>
        <button style={{ margin: '5px', width: '150px' }} onClick={() => setGraphType('biased_positive')}>Biased Positive</button>
        <button style={{ margin: '5px', width: '150px' }} onClick={() => setGraphType('biased_negative')}>Biased Negative</button>
        <button style={{ margin: '5px', width: '150px' }} onClick={() => setGraphType('all')}>All Graphs</button>
      </div>
      <div style={{ display: 'flex', flexGrow: 1, flexWrap: 'wrap' }}>
        {graphType === 'all' ? graphComponents : graphComponents.filter(comp => comp.key === graphType)}
      </div>
    </div>
  );
}

export default App;
