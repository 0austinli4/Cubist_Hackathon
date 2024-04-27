# Cubist_Hackathon
Cubist Hackathon 2024 Project

MetroBet is a web app developed to provide a platform for users to hedge their travels with the NYC Metro system. 

Realtime data is streamed through csp, which obtains data from the MTA LIRR Real-Time Feeds, and is used for the bets.  
Historical data is obtained from the recorded data files streamed from the csp, which provides data collected from three most recent days, to determine the odds of the bets.

## Tech stack:
- React: we built our front end with React.js in order to provide the user with a clean and real-time interface
- Flask: the backend, which queries the NYC metro data real time, is written with the Flask framework in Python
- PostgreSQL: the database stores the user's bets, and at every settlement date, calculates the PnL of the user

## Installation & Running
1. Run python app.py
2. cd ./betting-app
3. run npm start

## Future work
We hope to upgrade this WebApp into a fully functional exchange with a proper limit order book, where every player bets against another player. We implemented a sample spread, which would be determined by market participants
