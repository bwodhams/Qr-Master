import React from 'react';

const User = props => {
  return (
    <li
      onClick={() => props.onSelect(props.user)}
      className={props.user === props.selectedUser ? 'selected' : ''}
    >
      <button
        className="delete-button"
        onClick={e => props.onDelete(e, props.user)}
      >
        Delete
      </button>
      <div className="user-element">
        <div className="badge">
          {props.user.email}
        </div>
        <div className="name">
          {props.user.name}
        </div>
        <div className="passwordHash">
          {props.user.passwordHash}
        </div>
      </div>
    </li>
  );
};

export default User;
