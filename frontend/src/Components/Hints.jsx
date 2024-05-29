import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Hints() {
    const [correctLetters, setCorrectLetters] = useState('');
    const [misplacedLetters, setMisplacedLetters] = useState('');
    const [wrongLetters, setWrongLetters] = useState('');
    const [hintResults, setHintResults] = useState([]);
    const navigate = useNavigate();

    const fetchHints = async () => {
        // Assuming you have configured the backend and token is managed appropriately
        const token = localStorage.getItem('token');
        console.log("here")
        try {
            const response = await axios.post('https://18.212.87.142:5000/hints', {
                correctLetters,
                misplacedLetters,
                wrongLetters
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setHintResults(response.data);
            console.log(hintResults)
        } catch (error) {
            console.error('Error fetching hints:', error);
        }
    };

    return (
        <div className="flex flex-col items-center p-4">
            <button onClick={() => navigate('/game')} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
                Back to Game
            </button>
            <div className="flex flex-col items-center mt-4">
                <input
                    className="mt-2 p-2 border-2 border-gray-400"
                    placeholder="Correct letters (e.g., 'a,e,r')"
                    value={correctLetters}
                    onChange={(e) => setCorrectLetters(e.target.value)}
                />
                {/* <input
                    className="mt-2 p-2 border-2 border-gray-400"
                    placeholder="Misplaced letters (e.g., 'n,t')"
                    value={misplacedLetters}
                    onChange={(e) => setMisplacedLetters(e.target.value)}
                /> */}
                <input
                    className="mt-2 p-2 border-2 border-gray-400"
                    placeholder="Wrong letters (e.g., 'x,y,z')"
                    value={wrongLetters}
                    onChange={(e) => setWrongLetters(e.target.value)}
                />
                <button onClick={fetchHints} className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                    Get Hints
                </button>
                {hintResults.map((word, idx) => (
                    <div key={idx} className="mt-2 text-lg">{word}</div>
                ))}
            </div>
        </div>
    );
}

export default Hints;
