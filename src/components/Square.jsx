import React from 'react';

const Square = ({ value, onClick }) => {
  return (
    <button 
      className={`square ${value ? `filled-${value.toLowerCase()}` : ''}`} 
      onClick={onClick}
    >
      {value}
    </button>
  );
};

export default Square;
