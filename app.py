from flask import Flask, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import random
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'default_secret_key')  # Use environment variable or default
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Keep track of a global variable safely
curr_number = 0

@app.route('/')
def index():
    return "Real-Time Betting App"

@socketio.on('connect')
def test_connect():
    try:
        emit('response', {'message': 'Connected to server'})
    except Exception as e:
        emit('error', {'message': str(e)})

@socketio.on('place_bet')
def handle_place_bet(json):
    try:
        print('Received bet:', json)
        emit('bet_status', {'status': 'Received'}, broadcast=True)
    except Exception as e:
        emit('error', {'message': str(e)})

@app.route('/random-number')
def random_number():
    global curr_number
    curr_number += random.randint(-2, 2)  # Adjust the current number by a random amount between -2 and 2
    return jsonify({'random_number': curr_number})

if __name__ == '__main__':
    socketio.run(app)