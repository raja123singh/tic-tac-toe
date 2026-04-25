import React, { useState, useEffect } from 'react';
import Board from './components/Board';
import PlayerSetup from './components/PlayerSetup';
import { playClickSound, playWinSound } from './utils/audio';
import './styles.css';

const calculateWinner = (squares) => {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
    [0, 4, 8], [2, 4, 6]             // diagonals
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
};

function App() {
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [scores, setScores] = useState({ X: 0, O: 0 });
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  const [gameStarted, setGameStarted] = useState(false);
  const [player1Name, setPlayer1Name] = useState('Player 1');
  const [player2Name, setPlayer2Name] = useState('Player 2');

  // Apply theme to body
  useEffect(() => {
    document.body.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const winner = calculateWinner(squares);
  const isDraw = !winner && squares.every((square) => square !== null);

  useEffect(() => {
    if (winner) {
      playWinSound();
      setScores(prev => ({ ...prev, [winner]: prev[winner] + 1 }));
    }
  }, [winner]);

  const handleClick = (i) => {
    if (squares[i] || winner) return;

    playClickSound();

    const nextSquares = squares.slice();
    nextSquares[i] = xIsNext ? 'X' : 'O';
    
    setSquares(nextSquares);
    setXIsNext(!xIsNext);
  };

  // Resets only the board for the next round (keeps scores)
  const resetGame = () => {
    setSquares(Array(9).fill(null));
    setXIsNext(true);
  };

  // Resets the board and the scores to 0 (keeps names)
  const restartMatch = () => {
    setSquares(Array(9).fill(null));
    setXIsNext(true);
    setScores({ X: 0, O: 0 });
  };

  const handleStartGame = (p1, p2) => {
    setPlayer1Name(p1);
    setPlayer2Name(p2);
    setGameStarted(true);
  };

  const handleExitGame = () => {
    setGameStarted(false);
    setSquares(Array(9).fill(null));
    setXIsNext(true);
    setScores({ X: 0, O: 0 });
    setPlayer1Name('Player 1');
    setPlayer2Name('Player 2');
  };

  let status;
  if (winner) {
    const winnerName = winner === 'X' ? player1Name : player2Name;
    status = `${winnerName} (${winner}) Wins 🎉`;
  } else if (isDraw) {
    status = 'Match Draw!';
  } else {
    const currentPlayerName = xIsNext ? player1Name : player2Name;
    status = `${currentPlayerName} (${xIsNext ? 'X' : 'O'})'s turn`;
  }

  return (
    <div className="app-container">
      {gameStarted && (
        <button 
          className="exit-top-button" 
          onClick={handleExitGame}
          aria-label="Exit Game"
          title="Exit Game"
        >
          ✕ Exit
        </button>
      )}
      <button 
        className="theme-toggle" 
        onClick={() => setIsDarkMode(!isDarkMode)}
        aria-label="Toggle Dark Mode"
      >
        {isDarkMode ? '☀️ Light' : '🌙 Dark'}
      </button>

      <div className="game-card">
        <h1 className="title">Tic Tac Toe</h1>
        
        {!gameStarted ? (
          <PlayerSetup onStart={handleStartGame} />
        ) : (
          <>
            <div className="scoreboard">
              <div className="score-badge x-score">
                <span>{player1Name} (X)</span>
                <strong>{scores.X}</strong>
              </div>
              <div className="score-badge o-score">
                <span>{player2Name} (O)</span>
                <strong>{scores.O}</strong>
              </div>
            </div>

            <div className="status-indicator">
              {status}
            </div>

            <Board squares={squares} onClick={handleClick} />

            <div className="action-buttons">
              <button className="reset-button" onClick={resetGame} title="Keep scores, start next round">
                Next Round (Reset Board)
              </button>
              <button className="restart-button" onClick={restartMatch} title="Reset scores to 0">
                Restart Match
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
