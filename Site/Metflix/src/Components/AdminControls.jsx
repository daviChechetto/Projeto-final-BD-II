import React from 'react';

const AdminControls = ({ onEdit, onDelete }) => {
  const buttonStyle = {
    position: 'absolute',
    top: '5px',
    padding: '3px 6px',
    fontSize: '12px',
    cursor: 'pointer',
    border: 'none',
    borderRadius: '4px',
    color: 'white'
  };

  return (
    <>
      <button onClick={onEdit} style={{ ...buttonStyle, right: '45px', backgroundColor: '#007bff' }}>Editar</button>
      <button onClick={onDelete} style={{ ...buttonStyle, right: '5px', backgroundColor: '#dc3545' }}>X</button>
    </>
  );
};

export default AdminControls;