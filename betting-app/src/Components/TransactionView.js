import React from 'react';



const TransactionView = ({transactions}) => {


  return (
    <div >
      <h2>Last Transactions</h2>
       <table style={{ borderCollapse: 'collapse', marginTop:'50px' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid black', padding: '10px'}}>Date</th>
                <th style={{ border: '1px solid black', padding: '10px'}}>Type</th>
                <th style={{  border: '1px solid black', padding: '10px'}}>Amount</th>
                <th style={{  border: '1px solid black', padding: '10px'}}>Profit</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(item => (
                <tr key={item.id} style={{margin: '5px'}}>
                  <td style={{borderLeft: '1px solid black', borderBottom: '1px solid black', padding: '10px'}}>{item.date}</td>
                  <td style={{borderLeft: '1px solid black', borderBottom: '1px solid black', padding: '10px'}}>{item.type}</td>
                  <td style={{borderLeft: '1px solid black', borderBottom: '1px solid black', padding: '10px'}}>{item.amount}</td>
                  <td style={{borderLeft: '1px solid black', borderBottom: '1px solid black', borderRight: '1px solid black', padding: '10px'}}>{item.profit}</td>
                </tr>
              ))}
            </tbody>
          </table>
    </div>
  );
};

export default TransactionView;
