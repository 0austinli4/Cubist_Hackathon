import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import PageHeader from './Components/PageHeader'
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function Home(){
  const [graphData, setGraphData] = useState({
    standard: [],
    volatile: [],
    biased_positive: [],
    biased_negative: []
  });

  const [formData, setFormData] = useState({
    standard: { field1: '', field2: '' , field3: ''},
    volatile: { field1: '', field2: '', field3: '' },
    biased_positive: { field1: '', field2: '',field3: '' },
    biased_negative: { field1: '', field2: '' ,field3: ''}
  });

  const [timeLeft, setTimeLeft] = useState(60);

  const [orderData, setOrderData] = useState({
    standard: [],
    volatile: [],
    biased_positive: [],
    biased_negative: []
  });

  const handleFormChange = (type, name, value) => {
    setFormData(prevData => ({
      ...prevData,
      [type]: {
        ...prevData[type],
        [name]: value
      }
    }));
  };

  const [graphType, setGraphType] = useState('all');


  useEffect(() => {
    const fetchData = (type) => {
      axios.get(`http://localhost:5000/random-number/${type}`)
        .then(response => {
          const newNumber = response.data.random_number;
          const newBid = response.data.bid;
          const newAsk = response.data.ask;
          updateChartData(newNumber, newBid, newAsk, type);
        })
        .catch(error => {
          console.error('Error fetching data:', error);
        });

        // Fetch orders data from the '/orders' endpoint
      axios.get(`http://localhost:5000/orders/${type}`)
        .then(response => {
          updateOrderData(response.data.orders, type);
        })
        .catch(error => {
          console.error('Error fetching orders:', error);
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
    }, 5000);
    return () => clearInterval(intervalId);
  }, [graphType]);

  const updateOrderData = (orders, type) => {
    setOrderData(prevOrderData => ({
      ...prevOrderData,
      [type]: orders
    }));
  }

  const updateChartData = (newNumber, newBid, newAsk, type) => {
    setGraphData(prevData => {
      const maxDataPoints = 15;
      const newData = { ...prevData };
      const labels = newData[type].labels || [];
      const data = newData[type].data || [];
      const bid = newData[type].bid || [];
      const ask = newData[type].ask || [];
      const time = new Date().toISOString().split('T')[1].split(':')
      labels.push(time[1]+":"+time[2].split(".")[0]);
      data.push(newNumber);
      bid.push(newBid);
      ask.push(newAsk);

      if (labels.length > maxDataPoints) {
        labels.shift();
        data.shift();
        bid.shift();
        ask.shift();
      }

      newData[type] = { labels, data, bid, ask };
      return newData;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      console.log(formData);
//      for (let d in formData) {
//        d.field3 = '3'; //hardcoded
//      }
      const response = await axios.post('http://localhost:5000/inputData', formData);
      console.log('Response:', response.data);
      alert('Data submitted successfully!');
    } catch (error) {
      console.error('Error submitting data:', error);
      alert('Failed to submit data.');
    }
  };

  const cancelOrder = (orderId) => {
    // Function to cancel order by sending a request to the '/cancel-orders' endpoint
    axios.post('/cancel-orders', { orderId })
      .then(response => {
        console.log('Order cancelled successfully:', response.data);
        // Assuming response data contains updated orders information
        setOrderData(response.data);
      })
      .catch(error => {
        console.error('Error cancelling order:', error);
      });
  };

  function OrderForm({ type, formData, onChange }) {

    return (
      <form onSubmit={(event) => handleSubmit(event, type)}>
        <input
          type="text"

          name="field1"
          value={formData.field1}
          onChange={e => onChange(type, e.target.name, e.target.value)}
          placeholder="Enter field 1"
          style={{ margin: '5px', width: '140px', height: '30px' }}
        />
        <input
          type="text"
          name="field2"
          value={formData.field2}
          onChange={e => onChange(type, e.target.name, e.target.value)}
          placeholder="Enter field 2"
          style={{ margin: '5px', width: '140px', height: '30px' }}
        />
        <button
          type="submit"
          style={{ margin: '5px', width: '100px', height: '35px', backgroundColor: 'darkblue', color: 'white' }}
        >
          Submit
        </button>
      </form>
    );
  }

  // Simple CSS for table borders
  const tableStyle = {
    border: '1px solid black', // Sets the border around the table
    borderCollapse: 'collapse', // Ensures borders between cells are shared
    marginLeft: '5px'
  };

  const cellStyle = {
    border: '1px solid black', // Sets the border around each cell
    padding: '8px', // Adds some padding inside each cell for better readability
    textAlign: 'center' // Centers the text inside the cells
  };

  const bigComponents = Object.keys(graphData).map((type) => (
    <div key={type} style={{ width: '100%', height: '50%' }}>
      <h3>{type.replace('_', ' ').toUpperCase()}</h3>
      <Line
        data={{
          labels: graphData[type].labels,
          datasets: [
            {
              label: `Random Numbers - ${type}`,
              data: graphData[type].data,
              borderColor: 'rgb(75, 192, 192)',
              backgroundColor: 'rgba(75, 192, 192, 0.5)',
            },
            {
              label: `Bid - ${type}`,
              data: graphData[type].bid,
              borderColor: 'rgb(255, 99, 132)',
              backgroundColor: 'rgba(255, 99, 132, 0.5)',
              stepped: true,
            },
            {
              label: `Ask - ${type}`,
              data: graphData[type].ask,
              borderColor: 'rgb(54, 162, 235)',
              backgroundColor: 'rgba(54, 162, 235, 0.5)',
              stepped: true,
            }
          ]
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

      <table style={tableStyle}>
          <thead>
            <tr>
              <th style={cellStyle}>Order ID</th>
              <th style={cellStyle}>Type</th>
              <th style={cellStyle}>Price</th>
              <th style={cellStyle}>Amount</th>
              <th style={cellStyle}>Executed</th>
            </tr>
          </thead>
          <tbody>
            {orderData[type].map((order, index) => (
              <tr key={index}>
                <td style={cellStyle}>{order.orderID}</td>
                <td style={cellStyle}>{order.type}</td>
                <td style={cellStyle}>{order.price}</td>
                <td style={cellStyle}>{order.amount}</td>
                <td style={cellStyle}>{order.executed}</td>
                <td style={cellStyle}>
                  <button onClick={() => cancelOrder(order.orderID)}>
                    Cancel
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  ));


  const graphComponents = Object.keys(graphData).map((type) => (
    <div key={type} style={{ width: '50%', height: '45%', marginBottom: '50px' }}>
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

  function Timer() {

    useEffect(() => {
      const timer = setInterval(() => {
        // Decrease timeLeft by 1 every second
        setTimeLeft(prevTime => prevTime - 2);
        if (timeLeft === 0) {axios.post('/settle')
        .then(response => {
          console.log("Settlement completed!");
        })
        .catch(error => {
          console.error("Error settling:", error);
        }); setTimeLeft(60);}
      }, 3000);

      // Cleanup function to clear the interval when component unmounts
      return () => clearInterval(timer);
    }, []); // Run only once on component mount

    const totalTime = 60;
    const percentage = (timeLeft / totalTime) * 100;
    const circumference = 2 * Math.PI * 40; // Circumference of the circle
    const strokeLength = (percentage / 100) * circumference;

    return (
      <div style={{ position: 'relative', width: '160px', height: '150px', marginTop: '20px' }}>
        <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
          <circle cx="50" cy="50" r="40" fill="none" strokeWidth="20" stroke="#ccc" />
          <circle cx="50" cy="50" r="40" fill="none" strokeWidth="20" stroke="#007bff" strokeDasharray={`${strokeLength} ${circumference - strokeLength}`} />
        </svg>
      </div>
    );
  }
  const inputRef= useRef(null)
  const formInput = () => {
            <OrderForm
                   ref={inputRef}
                   type={graphType}
                   formData={formData[graphType] || {}}
                   onChange={handleFormChange}
                 />
  }
  return (
    <div>
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '90vh' }}>
      <div style={{display: 'flex', flexDirection:'row'}}>
      <img src="logo.png" alt="Logo" style={{ width: '160px', height: '160px', marginBottom: '-35px', marginTop: '20px' }} />
      <PageHeader> Today's Bets </PageHeader>
      </div>
      <div style={{ display: 'flex', width: '100%', height: '90vh'}}>
      <div style={{ display: 'flex', flexDirection: 'column', margin: '10px'}}>

        <button style={{ margin: '5px', width: '150px', height: '50px', border: 'none', backgroundColor: 'teal', color: 'white', fontSize: '20px' }} onClick={() => setGraphType('standard')}>Standard</button>
        <button style={{ margin: '5px', width: '150px', height: '50px', border: 'none', backgroundColor: 'teal', color: 'white', fontSize: '20px' }} onClick={() => setGraphType('volatile')}>Volatile</button>
        <button style={{ margin: '5px', width: '150px', height: '50px', border: 'none', backgroundColor: 'teal', color: 'white', fontSize: '20px' }} onClick={() => setGraphType('biased_positive')}>Biased Pos</button>
        <button style={{ margin: '5px', width: '150px', height: '50px', border: 'none', backgroundColor: 'teal', color: 'white', fontSize: '20px' }} onClick={() => setGraphType('biased_negative')}>Biased Neg</button>
        <button style={{ margin: '5px', width: '150px', height: '200px', border: 'none', backgroundColor: 'navy', color: 'white', fontSize: '25px' }} onClick={() => setGraphType('all')}>All Graphs</button>
        <Timer />
      </div>
      <div style={{ display: 'flex', flexGrow: 1, flexWrap: 'wrap' }}>
        {graphType === 'all' ? graphComponents : bigComponents.filter(comp => comp.key === graphType)}
{graphType != 'all' ? <OrderForm
                     ref={inputRef}
                     type={graphType}
                     formData={formData[graphType] || {}}
                     onChange={handleFormChange}
                   /> : null}
                   </div>
      </div>
       <div>

      </div>
    </div>
    </div>
  );
}

export default Home;