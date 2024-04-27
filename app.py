from flask import Flask, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import random
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'default_secret_key')
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Global variables for different random walks
current_numbers = {
    'standard': 0,
    'volatile': 0,
    'biased_positive': 0,
    'biased_negative': 0
}

@app.route('/')
def index():
    return "Real-Time Betting App"

def random_walk_adjustment(walk_type):
    if walk_type == 'standard':
        return random.randint(-2, 2)
    elif walk_type == 'volatile':
        return random.randint(-5, 5)
    elif walk_type == 'biased_positive':
        return random.randint(0, 3)
    elif walk_type == 'biased_negative':
        return random.randint(-3, 0)

@app.route('/random-number/<walk_type>')
def random_number(walk_type):
    if walk_type in current_numbers:
        current_numbers[walk_type] += random_walk_adjustment(walk_type)
        return jsonify({'random_number': current_numbers[walk_type], 'bid': (current_numbers[walk_type]-2), 'ask':(current_numbers[walk_type]+2)})
    else:
        return jsonify({'error': 'Invalid walk type'}), 400

@app.route('/orders/<walk_type>')
def no_orders(walk_type):
    return jsonify({'orders':[{'orderID':0, 'type': 0, 'price':0, 'amount':0, 'executed':0}]})

if __name__ == '__main__':
    socketio.run(app)
