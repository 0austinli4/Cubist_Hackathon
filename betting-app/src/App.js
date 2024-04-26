import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000'); // Adjust URL/port as necessary

function App() {
    const [response, setResponse] = useState('');

    useEffect(() => {
        socket.on('response', data => {
            setResponse(data.message);
        });

        socket.on('bet_status', data => {
            alert(data.status);
        });

        return () => {
          socket.off('response');
          socket.off('bet_status');
        };
    }, []);

    const placeBet = () => {
        socket.emit('place_bet', { user: 'User1', bet: 100 });
    };

    return (
        <div>
            <p>{response}</p>
            <button onClick={placeBet}>Place Bet</button>
        </div>
    );
}

export default App;