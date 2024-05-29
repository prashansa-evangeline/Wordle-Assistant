import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Game() {
    const [guesses, setGuesses] = useState(Array(6).fill(Array(5).fill('')));
    const [currentGuess, setCurrentGuess] = useState(0);
    const [results, setResults] = useState([]);
    const [gameFinished, setGameFinished] = useState(false);
    const [gameWon, setGameWon] = useState(false);
    const [correctWord, setCorrectWord] = useState('');
    const [score, setScore] = useState(0);
    const navigate = useNavigate();

    const inputRefs = useRef([]);
    if (inputRefs.current.length !== 6) {
        inputRefs.current = Array(6).fill(0).map(() => Array(5).fill(0).map(() => React.createRef()));
    }

    useEffect(() => {
        initializeGame(); 
    }, []);

    const initializeGame = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error("No token found");
            navigate('/login');
            return;
        }
        try {
            const response = await axios.get('https://18.212.87.142:5000/initialize', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setGuesses(Array(6).fill(Array(5).fill('')));
            setCurrentGuess(0);
            setResults([]);
            setGameFinished(false);
            setGameWon(false);
            setCorrectWord(response.data.word);
            setScore(response.data.score);  // Reset score on game initialization
            if (inputRefs.current[0][0].current) {
                inputRefs.current[0][0].current.focus();
            }
        } catch (error) {
            console.error('Error initializing game:', error);
        }
    };

    const updateGuess = (guessIndex, charIndex, char) => {
        const newGuesses = guesses.slice();
        const newGuess = [...newGuesses[guessIndex]];
        newGuess[charIndex] = char.toUpperCase();
        newGuesses[guessIndex] = newGuess;
        setGuesses(newGuesses);

        if (char) {
            if (charIndex < 4) {
                inputRefs.current[guessIndex][charIndex + 1].current.focus();
            } else if (guessIndex < 5) {
                inputRefs.current[guessIndex + 1][0].current.focus();
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    const handleSubmit = async () => {
      if (currentGuess >= 6 || gameFinished) return;
      const token = localStorage.getItem('token');
      if (!token) return;
  
      try {
          const guessWord = guesses[currentGuess].join('');
          const response = await axios.post('https://18.212.87.142:5000/guess', {
              guess: guessWord,
              currentGuess: currentGuess  // Send the index of the current guess
          }, {
              headers: {
                  Authorization: `Bearer ${token}`
              }
          });
  
          const newResults = [...results, response.data.result];
          setResults(newResults);
          
          const nextGuessIndex = currentGuess + 1;
          setCurrentGuess(nextGuessIndex);
  
          // Update score from the server's response
          setScore(response.data.score);
  
          if (response.data.result.every(r => r === 'correct')) {
              setGameWon(true);
              setGameFinished(true);
          } else if (nextGuessIndex === 6) {
              setGameFinished(true);
              setGameWon(false);
              // Update score if the game is finished and they haven't won
              if (!response.data.gameFinished) {
                  setScore(prevScore => prevScore - 50);
              }
          } else {
              inputRefs.current[nextGuessIndex][0].current.focus();
          }
      } catch (error) {
          console.error('Error submitting guess:', error);
        }
    };
  

    const getColorClass = (result) => {
        switch (result) {
            case 'correct':
                return 'bg-green-500 border-green-500 text-white';
            case 'present':
                return 'bg-yellow-500 border-yellow-500 text-white';
            case 'absent':
                return 'bg-gray-600 border-gray-600 text-white';
            default:
                return 'border-gray-300';
        }
    };

    const closeModal = () => {
        initializeGame();
    };

    return (
        <div className="flex bg-gray-100 flex-col items-center p-2">
            <div className="flex justify-between items-center w-full">
                <h1 className="text-3xl font-bold text-green-500 text-center">Wordle</h1>
                <button onClick={handleLogout} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
                    Logout
                </button>
            </div>
            <div className="score-container my-2 mt-2">
                <h2 className="text-xl font-bold">Score: {score}</h2>
            </div>
            <div className="grid grid-cols-5 gap-2 mb-4 mt-4">
                {guesses.map((guess, guessIndex) =>
                    guess.map((char, charIndex) => (
                        <input
                            key={`${guessIndex}-${charIndex}`}
                            ref={inputRefs.current[guessIndex][charIndex]}
                            className={`w-14 h-14 text-2xl text-center uppercase border-2 ${
                                results[guessIndex] ? getColorClass(results[guessIndex][charIndex]) : 'border-gray-300'
                            }`}
                            maxLength="1"
                            value={char}
                            onChange={(e) => updateGuess(guessIndex, charIndex, e.target.value)}
                            disabled={guessIndex !== currentGuess || gameFinished}
                        />
                    ))
                )}
            </div>
            <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-green-300"
                disabled={currentGuess >= 6 || gameFinished}
            >
                Submit
            </button>
            {/* <button onClick={() => alert(`Current Score: ${score}`)} className="mt-2 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600">
                Show Score
            </button> */}
            <button onClick={() => navigate('/hints')} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Show Hints
            </button>
            {gameFinished && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-8 bg-white border-2 border-gray-400 rounded-lg shadow-xl w-96">
                    <h3 className="text-center text-xl font-semibold">
                        {gameWon ? "Congratulations! You guessed it right!" : `You Lost, the correct word was ${correctWord}!`}
                    </h3>
                    <h4 className="text-center text-lg mt-2">Your Score: {score}</h4>
                    <button onClick={closeModal} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mx-auto block">
                        Close
                    </button>
                </div>
            )}
        </div>
    );
}

export default Game;
