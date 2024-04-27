import os
from sqlalchemy import create_engine, Column, Integer, Numeric, DateTime
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

# Environment variable for the database URL, ensure it is set in your environment or directly paste it here
database_url = "postgresql://u5irs6g0q7bqmo:p5ab5378697e674b4e466ae376dabe65965347bbaf3f3a143057ba025390d782b@c9pbiquf6p6pfn.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com:5432/d3lsbo7gbsjd48"
engine = create_engine(database_url)

Base = declarative_base()


class Bet(Base):
    __tablename__ = 'bets'
    BetID = Column(Integer, primary_key=True, autoincrement=True)
    # Adjust precision as needed
    BetAmount = Column(Numeric(10, 2), nullable=False)
    # Adjust precision as needed
    BetPrice = Column(Numeric(10, 2), nullable=False)
    Time = Column(DateTime, default=datetime.utcnow, nullable=False)
    Spot = Column(Integer, nullable=False)  # Corrected type


Base.metadata.create_all(engine)
Session = sessionmaker(bind=engine)


def add_new_bet(bet_amount, bet_price, input_spot=1):
    """
    Adds a new bet to the database and returns the ID of the new bet.
    """
    session = Session()
    try:
        new_bet = Bet(
            BetAmount=bet_amount,
            BetPrice=bet_price,
            Time=datetime.now(),
            Spot=input_spot  # Corrected position of input_spot with comma
        )
        session.add(new_bet)
        session.commit()
        return new_bet.BetID
    except Exception as e:
        session.rollback()
        print(f"An error occurred: {e}")
        return None
    finally:
        session.close()


def delete_bet(bet_id):
    """
    Deletes a bet from the database based on the BetID.
    """
    session = Session()
    try:
        bet_to_delete = session.query(Bet).filter(Bet.BetID == bet_id).first()
        if bet_to_delete:
            session.delete(bet_to_delete)
            session.commit()
            print(f"Bet with ID {bet_id} has been deleted.")
            return True
        else:
            print(f"No bet found with ID {bet_id}.")
            return False
    except Exception as e:
        session.rollback()
        print(f"An error occurred: {e}")
        return False
    finally:
        session.close()


def get_bet(bet_id):
    """
    Retrieves a bet from the database based on the BetID.
    """
    session = Session()
    try:
        bet = session.query(Bet).filter(Bet.BetID == bet_id).first()
        if bet:
            bet_details = {
                'BetID': bet.BetID,
                'BetAmount': float(bet.BetAmount),
                'BetPrice': float(bet.BetPrice),
                'Time': bet.Time,
                'Spot': bet.Spot  # Corrected key-value pair
            }
            return bet_details
        else:
            print(f"No bet found with ID {bet_id}.")
            return None
    except Exception as e:
        print(f"An error occurred: {e}")
        return None
    finally:
        session.close()


def main():
    # Create a new bet
    print("Testing adding a new bet...")
    new_bet_id = add_new_bet(200.00, 3.5, datetime.now(), 1)
    if new_bet_id:
        print(f"Bet added with ID: {new_bet_id}")
    else:
        print("Failed to add bet.")

    # Retrieve the newly created bet
    if new_bet_id:
        print(f"\nTesting retrieving bet ID {new_bet_id}...")
        bet = get_bet(new_bet_id)
        if bet:
            print("Retrieved Bet Details:")
            for key, value in bet.items():
                print(f"{key}: {value}")
        else:
            print("Failed to retrieve bet.")

    # Delete the bet
    if new_bet_id:
        print(f"\nTesting deleting bet ID {new_bet_id}...")
        if delete_bet(new_bet_id):
            print(f"Bet with ID {new_bet_id} was successfully deleted.")
        else:
            print(f"Failed to delete bet with ID {new_bet_id}.")

    # Attempt to retrieve the deleted bet
    if new_bet_id:
        print(f"\nTesting retrieving deleted bet ID {new_bet_id}...")
        bet = get_bet(new_bet_id)
        if not bet:
            print("Bet retrieval failed as expected for a deleted bet.")
        else:
            print("Unexpected success in retrieving a deleted bet.")

    # Create a new bet
    print("Testing adding a new bet...")
    new_bet_id = add_new_bet(10.00, 1.3, datetime.now(), 1)
    if new_bet_id:
        print(f"Bet added with ID: {new_bet_id}")
    else:
        print("Failed to add bet.")


if __name__ == "__main__":
    main()
