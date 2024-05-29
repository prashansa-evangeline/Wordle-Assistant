from flask import Flask, request, jsonify
from flask_cors import CORS
import random
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import jwt
from datetime import datetime, timedelta
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')

DB_URI = os.getenv('DB_URI')
engine = create_engine(DB_URI)
Session = sessionmaker(bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True)
    username = Column(String(50), unique=True, nullable=False)
    password = Column(String(50), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    firstname = Column(String(50), nullable=False)
    lastname = Column(String(50), nullable=False)
    score = Column(Integer, default=0)

# Create database tables
Base.metadata.create_all(engine)

def load_words_from_file(file_path):
    with open(file_path, 'r') as file:
        return [line.strip().upper() for line in file if line.strip()]

# Load a list of words from a file or define it directly
#words = ["crane", "lives", "brink", "sight", "grape", "stage", "about", "flock"]
words = load_words_from_file('words.txt')
daily_word = random.choice(words).upper()
print(daily_word)

# @app.route('/initialize', methods=['GET'])
# def initialize_game():
#     global daily_word
#     daily_word = random.choice(words).upper()
#     return jsonify({"message": "Game initialized", "word": daily_word})

@app.route('/initialize', methods=['GET'])
def initialize_game():
    global daily_word
    daily_word = random.choice(words).upper()

    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({"error": "Authorization token is missing"}), 401

    token = auth_header.split(" ")[1]
    try:
        data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
        username = data['username']

        session = Session()
        user = session.query(User).filter_by(username=username).first()
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Fetch and send the current score from the database
        return jsonify({
            "message": "Game initialized", 
            "word": daily_word,
            "score": user.score  # Include the current score
        })

    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token expired"}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route('/auth/score', methods=['GET'])
def get_score():
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({"error": "Authorization token is missing"}), 401

    token = auth_header.split(" ")[1]
    try:
        data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
        username = data['username']

        session = Session()
        user = session.query(User).filter_by(username=username).first()
        if not user:
            return jsonify({"error": "User not found"}), 404

        return jsonify({"score": user.score}), 200

    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token expired"}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route('/hints', methods=['POST'])
def get_hints():
    data = request.get_json()
    correct_letters = set(data.get('correctLetters', ''))
    correct_letters = {letter.lower() for letter in correct_letters}
    misplaced_letters = set(data.get('misplacedLetters', ''))
    wrong_letters = set(data.get('wrongLetters', ''))
    wrong_letters = {letter.lower() for letter in wrong_letters}
    
    if ',' in correct_letters:
        correct_letters.remove(',')

    if ',' in wrong_letters:
        wrong_letters.remove(',')

    valid_words = [word for word in words if is_valid_hint(word.lower(), correct_letters, misplaced_letters, wrong_letters)]
    print(len(valid_words))
    print(len(words))
    return jsonify(valid_words)

def is_valid_hint(word, correct, misplaced, wrong):
    print(word)
    word_set = set(word)
    if not correct.issubset(word_set):
        return False
    if any((c in word_set for c in wrong)):
        return False
    #if not all((c in word_set for c in misplaced)):
    #    return False
    return True


@app.route('/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"error": "Username and password are required."}), 400

    session = Session()
    user = session.query(User).filter_by(username=username).first()

    if not user or user.password != password:
        return jsonify({"error": "Invalid credentials."}), 401
    
    else:
        print("User Exists")

    token = jwt.encode({
        'username': user.username,
        'exp': datetime.utcnow() + timedelta(days=1)  # Token expiration time (1 day)
    }, app.config['SECRET_KEY'])

    print(token)

    return jsonify({"token": token}), 200 

@app.route('/auth/signup', methods=['POST'])
def signup():
    data = request.get_json()

    username = data.get('username')
    password = data.get('password')
    email = data.get('email')
    firstname = data.get('firstname')
    lastname = data.get('lastname')

    if not username or not password or not email or not firstname or not lastname:
        return jsonify({"error": "All fields are required."}), 400

    session = Session()

    # Check if the username or email already exists
    existing_user = session.query(User).filter_by(username=username).first()
    if existing_user:
        return jsonify({"error": "Username already exists."}), 400

    existing_email = session.query(User).filter_by(email=email).first()
    if existing_email:
        return jsonify({"error": "Email already exists."}), 400

    # Create a new user
    new_user = User(username=username, password=password, email=email, firstname=firstname, lastname=lastname)
    session.add(new_user)
    session.commit()

    return jsonify({"message": "User created successfully."}), 201

@app.route('/guess', methods=['POST'])
def make_guess():
    data = request.get_json()
    guess = data['guess'].upper()

    if len(guess) != 5:
        return jsonify({"error": "Each guess must be exactly 5 letters."}), 400

    # Authenticate the user first
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({"error": "Authorization token is missing"}), 401

    token = auth_header.split(" ")[1]
    try:
        data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
        username = data['username']

        session = Session()
        user = session.query(User).filter_by(username=username).first()
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Check the guess against the daily word
        result = []
        for i, letter in enumerate(guess):
            if letter == daily_word[i]:
                result.append('correct')
            elif letter in daily_word:
                result.append('present')
            else:
                result.append('absent')
        print(user.score)
        print(user.username)

        # Update the score based on the result
        game_finished = request.json.get('currentGuess') == 5 or all(r == 'correct' for r in result)

        # Update the score based on the final result
        if game_finished:
            if all(r == 'correct' for r in result):
                user.score += 100
            else:
                # Reduce score only if it's the last guess and they haven't guessed it correctly
                user.score -= 20

        session.commit()

        return jsonify({"result": result, "score": user.score, "gameFinished": game_finished}), 200


    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token expired"}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 400


if __name__ == '__main__':
    app.run(host='0.0.0.0', ssl_context="adhoc", port=5000, debug=True)
