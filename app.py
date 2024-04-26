from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key'
CORS(app)  # This applies CORS to all routes
socketio = SocketIO(app, cors_allowed_origins="*")

@app.route('/')
def index():
    return "Real-Time Betting App"

@socketio.on('connect')
def test_connect():
    emit('response', {'message': 'Connected to server'})

@socketio.on('place_bet')
def handle_place_bet(json):
    print('Received bet:', json)
    emit('bet_status', {'status': 'Received'}, broadcast=True)

if __name__ == '__main__':
    socketio.run(app)
