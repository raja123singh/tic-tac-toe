import React, { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase'; // MUST BE CONFIGURED BY USER
import Board from './components/Board';
import PlayerSetup from './components/PlayerSetup';
import { playClickSound, playWinSound } from './utils/audio';
import './styles.css';

const calculateWinner = (squares) => {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
};

// Generate a random 5-character string
const generateRoomId = () => Math.random().toString(36).substring(2, 7).toUpperCase();

const initialGameState = {
  squares: Array(9).fill(null),
  xIsNext: true,
  scores: { X: 0, O: 0 },
  player1Name: '',
  player2Name: 'Waiting...',
  status: 'waiting' // waiting, playing, disconnected
};

function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  // Local state
  const [roomId, setRoomId] = useState(null);
  const [role, setRole] = useState(null); // 'X' or 'O'
  
  // Synced state
  const [gameState, setGameState] = useState(null);

  // Apply theme to body
  useEffect(() => {
    document.body.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Sync with Firestore
  useEffect(() => {
    if (!roomId) return;

    if (!db) {
      alert("Firebase is not initialized. Please configure src/firebase.js");
      return;
    }

    const roomRef = doc(db, 'rooms', roomId);
    const unsubscribe = onSnapshot(roomRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        
        // Handle audio logic on state changes safely (comparing with previous state not easily possible inside onSnapshot directly without ref, but simple enough)
        setGameState((prevState) => {
           if (prevState) {
             const prevWinner = calculateWinner(prevState.squares);
             const currentWinner = calculateWinner(data.squares);
             if (!prevWinner && currentWinner && role) {
               playWinSound();
             }
           }
           return data;
        });

      } else {
        // Room was deleted or player disconnected
        setGameState(prev => prev ? { ...prev, status: 'disconnected' } : null);
      }
    });

    return () => unsubscribe();
  }, [roomId, role]);

  const handleCreateRoom = async (playerName) => {
    if (!db) {
      alert("Firebase is not initialized. Please configure src/firebase.js");
      return;
    }
    const newRoomId = generateRoomId();
    try {
      await setDoc(doc(db, 'rooms', newRoomId), {
        ...initialGameState,
        player1Name: playerName
      });
      setRole('X');
      setRoomId(newRoomId);
    } catch (error) {
      console.error("Error creating room:", error);
      alert("Error creating room. Check Firebase config.");
    }
  };

  const handleJoinRoom = async (playerName, joinRoomId) => {
    if (!db) {
      alert("Firebase is not initialized. Please configure src/firebase.js");
      return;
    }
    try {
      await updateDoc(doc(db, 'rooms', joinRoomId), {
        player2Name: playerName,
        status: 'playing'
      });
      setRole('O');
      setRoomId(joinRoomId);
    } catch (error) {
      console.error("Error joining room:", error);
      alert("Room not found or error joining. Ensure the Room ID is correct.");
    }
  };

  const handleClick = async (i) => {
    if (!gameState || gameState.status !== 'playing') return;
    
    // Check if it's my turn
    const isMyTurn = (gameState.xIsNext && role === 'X') || (!gameState.xIsNext && role === 'O');
    if (!isMyTurn) return;

    const winner = calculateWinner(gameState.squares);
    if (gameState.squares[i] || winner) return;

    playClickSound();

    const nextSquares = gameState.squares.slice();
    nextSquares[i] = role;
    
    const newWinner = calculateWinner(nextSquares);
    const newScores = { ...gameState.scores };
    if (newWinner) {
      newScores[newWinner] += 1;
    }

    try {
      await updateDoc(doc(db, 'rooms', roomId), {
        squares: nextSquares,
        xIsNext: !gameState.xIsNext,
        scores: newScores
      });
    } catch (error) {
      console.error("Error updating move:", error);
    }
  };

  const resetBoard = async () => {
    if (!roomId) return;
    try {
      await updateDoc(doc(db, 'rooms', roomId), {
        squares: Array(9).fill(null),
        xIsNext: true
      });
    } catch (error) {
      console.error("Error resetting board:", error);
    }
  };

  const restartMatch = async () => {
    if (!roomId) return;
    try {
      await updateDoc(doc(db, 'rooms', roomId), {
        squares: Array(9).fill(null),
        xIsNext: true,
        scores: { X: 0, O: 0 }
      });
    } catch (error) {
      console.error("Error restarting match:", error);
    }
  };

  const handleExitGame = () => {
    if (roomId && db) {
       updateDoc(doc(db, 'rooms', roomId), { status: 'disconnected' }).catch(e => console.error(e));
    }
    setRoomId(null);
    setRole(null);
    setGameState(null);
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    alert("Room ID copied to clipboard!");
  };

  // Rendering logic
  if (!roomId || !gameState) {
    return (
      <div className="app-container">
        <button className="theme-toggle" onClick={() => setIsDarkMode(!isDarkMode)}>
          {isDarkMode ? '☀️ Light' : '🌙 Dark'}
        </button>
        <div className="game-card">
          <h1 className="title">Tic Tac Toe</h1>
          <PlayerSetup onCreateRoom={handleCreateRoom} onJoinRoom={handleJoinRoom} />
        </div>
      </div>
    );
  }

  const winner = calculateWinner(gameState.squares);
  const isDraw = !winner && gameState.squares.every((square) => square !== null);

  let statusText;
  if (gameState.status === 'disconnected') {
    statusText = 'Opponent disconnected.';
  } else if (gameState.status === 'waiting') {
    statusText = 'Waiting for Opponent to join...';
  } else if (winner) {
    const winnerName = winner === 'X' ? gameState.player1Name : gameState.player2Name;
    statusText = `${winnerName} (${winner}) Wins 🎉`;
  } else if (isDraw) {
    statusText = 'Match Draw!';
  } else {
    const isMyTurn = (gameState.xIsNext && role === 'X') || (!gameState.xIsNext && role === 'O');
    const currentPlayerName = gameState.xIsNext ? gameState.player1Name : gameState.player2Name;
    statusText = isMyTurn ? `Your Turn (${role})` : `Waiting for ${currentPlayerName}...`;
  }

  return (
    <div className="app-container">
      <button className="exit-top-button" onClick={handleExitGame} title="Exit Game">
        ✕ Exit
      </button>
      <button className="theme-toggle" onClick={() => setIsDarkMode(!isDarkMode)}>
        {isDarkMode ? '☀️ Light' : '🌙 Dark'}
      </button>

      <div className="game-card">
        <div className="room-info">
          <span>Room: <strong style={{letterSpacing: '2px'}}>{roomId}</strong></span>
          <button className="copy-btn" onClick={copyRoomId}>Copy</button>
        </div>

        <h1 className="title" style={{marginTop: '10px', marginBottom: '10px', fontSize: '2rem'}}>Tic Tac Toe</h1>
        
        <div className="scoreboard">
          <div className={`score-badge x-score ${role === 'X' ? 'my-role' : ''}`}>
            <span>{gameState.player1Name} (X)</span>
            <strong>{gameState.scores.X}</strong>
          </div>
          <div className={`score-badge o-score ${role === 'O' ? 'my-role' : ''}`}>
            <span>{gameState.player2Name} (O)</span>
            <strong>{gameState.scores.O}</strong>
          </div>
        </div>

        <div className={`status-indicator ${gameState.status === 'waiting' || gameState.status === 'disconnected' ? 'waiting' : ''}`}>
          {statusText}
        </div>

        <div className={(gameState.status !== 'playing' || ((gameState.xIsNext && role !== 'X') || (!gameState.xIsNext && role !== 'O')) && !winner && !isDraw) ? 'board-disabled' : ''}>
          <Board squares={gameState.squares} onClick={handleClick} />
        </div>

        {gameState.status === 'playing' || gameState.status === 'disconnected' || winner || isDraw ? (
          <div className="action-buttons">
            <button className="reset-button" onClick={resetBoard} title="Keep scores, start next round">
              Next Round
            </button>
            <button className="restart-button" onClick={restartMatch} title="Reset scores to 0">
              Restart Match
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default App;
