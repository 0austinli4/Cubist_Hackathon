import React, { useState, useEffect, useRef } from 'react';
import PageHeader from './Components/PageHeader';
import TransactionView from './Components/TransactionView';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import ConfirmButton from './Components/ConfirmButton';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);
function Profile() {

  const profit = '+0';

  const transactions = [
    { id: 1, date: '2022-01-01', type: 'avg delay', amount: 50, profit: -10 },
    { id: 2, date: '2022-01-01', type: 'total delay', amount: 50, profit: 20 },
    { id: 3, date: '2022-01-01', type: 'number of delays', amount: 50, profit: 100  },
    // Add more transactions here
  ];

  let lastTenTransactions = [];
  const transactionType = 'all';
    if (transactionType == 'all') {
      lastTenTransactions = transactions.slice(-10);
    } else {
      for (let t in transactions) {
      console.log(transactions[t]);
          if (transactions[t].description == 'Coffee') {
              lastTenTransactions.push(transactions[t]);
          }
      }
    }

   const chartRef = useRef(null);
    const transactionViewRef = useRef(null);
  const profitData = [{date:'2024-04-01', totalProfit:'10'},{date:'2024-04-02', totalProfit:'20'}]
    useEffect(() => {
      const ctx = chartRef.current.getContext('2d');

      ChartJS.register(
        CategoryScale,
        LinearScale,
        PointElement,
        LineElement,
        Title,
        Tooltip,
        Legend
      );
      if (chartRef.current && transactionViewRef.current) {
            const transactionViewHeight = transactionViewRef.current.clientHeight;
            chartRef.current.height = transactionViewHeight * 0.8;
      }
      const chart = new ChartJS(ctx, {
        type: 'line',
        data: {
          labels: profitData.map(item => item.date),
          datasets: [{
            label: 'Total Profit',
            data: profitData.map(item => item.totalProfit),
            borderColor: 'blue',
            borderWidth: 2,
            fill: false,
          }]
        },
        options: {
          scales: {
            x: {
              type: 'category',
              title: {
                display: true,
                text: 'Date'
              }
            },
            y: {
              title: {
                display: true,
                text: 'Average Profit'
              }
            }
          }
        }
      });

      return () => {
        chart.destroy();
      };
    }, [profitData]);

  return (
 <div style={{ display: 'flex', flexDirection: 'column'}}>
      <div style={{display: 'flex', flexDirection:'row'}}>
         <img src="logo.png" alt="Logo" style={{ width: '160px', height: '160px', marginBottom: '-35px', marginTop: '20px' }} />
         <PageHeader> Profile </PageHeader>
         </div>
   <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
        <div style= {{margin: '50px'}}>
        <p style={{ textAlign: 'left' }}>You are currently {profit}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', margin: '50px',  width: '100%'}}>
          <div style={{ flex: 1}}>
            <h2>Total Daily Profits </h2>
            <canvas ref={chartRef} style={{ height:' 100%', width: '100%', padding:'10px' }} ></canvas>
          </div>
           <div ref={transactionViewRef} style={{ flex: 1}}>
            <TransactionView transactions={lastTenTransactions}/>
           </div>
        </div>
   </div>



 </div>

  );
}

export default Profile;
