from flask import Flask
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config['SECRET_KEY'] = ''
socketio = SocketIO(app, cors_allowed_origins="*")

@app.route('/')
def index():
    return "Betting App"

@socketio.on('connect')
def test_connect():
    emit('response', {'message': 'Connected to server'})

@socketio.on('place_bet')
def handle_place_bet(json):
    print('Received bet:', json)
    emit('bet_status', {'status': 'Received'}, broadcast=True)

if __name__ == '__main__':
    socketio.run(app)