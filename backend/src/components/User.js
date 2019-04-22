/*
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *
 *  @author Benjamin Wodhams
 *
 */

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
      </div>
    </li>
  );
};

export default User;
