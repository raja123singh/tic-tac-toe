import React, { useState } from 'react';

const PlayerSetup = ({ onCreateRoom, onJoinRoom }) => {
  const [mode, setMode] = useState('create'); // 'create' or 'join'
  const [playerName, setPlayerName] = useState('');
  const [roomId, setRoomId] = useState('');

  const handleCreate = (e) => {
    e.preventDefault();
    const name = playerName.trim() || 'Player 1';
    onCreateRoom(name);
  };

  const handleJoin = (e) => {
    e.preventDefault();
    const name = playerName.trim() || 'Player 2';
    if (!roomId.trim()) {
      alert("Please enter a Room ID");
      return;
    }
    onJoinRoom(name, roomId.trim());
  };

  return (
    <div className="setup-container">
      <div className="setup-tabs">
        <button 
          type="button"
          className={`tab-btn ${mode === 'create' ? 'active' : ''}`}
          onClick={() => setMode('create')}
        >
          Create Room
        </button>
        <button 
          type="button"
          className={`tab-btn ${mode === 'join' ? 'active' : ''}`}
          onClick={() => setMode('join')}
        >
          Join Room
        </button>
      </div>

      {mode === 'create' ? (
        <form onSubmit={handleCreate} className="setup-form">
          <h2 className="setup-title">Host a New Game</h2>
          <div className="input-group">
            <label htmlFor="playerName">Your Name</label>
            <input
              id="playerName"
              type="text"
              placeholder="Enter your name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="player-input x-input"
              maxLength={15}
            />
          </div>
          <button type="submit" className="start-button">
            Create Room
          </button>
        </form>
      ) : (
        <form onSubmit={handleJoin} className="setup-form">
          <h2 className="setup-title">Join Existing Game</h2>
          <div className="input-group">
            <label htmlFor="playerName">Your Name</label>
            <input
              id="playerName"
              type="text"
              placeholder="Enter your name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="player-input o-input"
              maxLength={15}
            />
          </div>
          <div className="input-group">
            <label htmlFor="roomId">Room ID</label>
            <input
              id="roomId"
              type="text"
              placeholder="Enter Room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value.toUpperCase())}
              className="player-input"
              maxLength={10}
            />
          </div>
          <button type="submit" className="start-button join-btn">
            Join Game
          </button>
        </form>
      )}
    </div>
  );
};

export default PlayerSetup;
