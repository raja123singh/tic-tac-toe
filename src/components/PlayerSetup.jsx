import React, { useState } from 'react';

const PlayerSetup = ({ onStart }) => {
  const [player1, setPlayer1] = useState('');
  const [player2, setPlayer2] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const p1 = player1.trim() || 'Player 1';
    const p2 = player2.trim() || 'Player 2';
    onStart(p1, p2);
  };

  return (
    <div className="setup-container">
      <h2 className="setup-title">Enter Player Names</h2>
      <form onSubmit={handleSubmit} className="setup-form">
        <div className="input-group">
          <label htmlFor="player1">Player 1 (X)</label>
          <input
            id="player1"
            type="text"
            placeholder="Name for X"
            value={player1}
            onChange={(e) => setPlayer1(e.target.value)}
            className="player-input x-input"
            maxLength={15}
          />
        </div>
        <div className="input-group">
          <label htmlFor="player2">Player 2 (O)</label>
          <input
            id="player2"
            type="text"
            placeholder="Name for O"
            value={player2}
            onChange={(e) => setPlayer2(e.target.value)}
            className="player-input o-input"
            maxLength={15}
          />
        </div>
        <button type="submit" className="start-button">
          Start Game
        </button>
      </form>
    </div>
  );
};

export default PlayerSetup;
