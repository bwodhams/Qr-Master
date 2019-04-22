/*
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *
 *  @author Benjamin Wodhams
 *
 */

import React from 'react';

const EditUser = props => {
  if (props.selectedUser) {
    return (
      <div>
        <div className="editfields">
          <div>
            <label>email: </label>
            {props.addingUser
              ? <input
                  name="email"
                  placeholder="email"
                  value={props.selectedUser.email}
                  onChange={props.onChange}
                />
              : <label className="value">
                  {props.selectedUser.email}
                </label>}
          </div>
          <div>
            <label>name: </label>
            <input
              name="name"
              value={props.selectedUser.name}
              placeholder="name"
              onChange={props.onChange}
            />
          </div>
          <div>
            <label>Password: </label>
            <input
              type="password"
              secureTextEntry={true}
              name="passwordHash"
              onChange={props.onChange}
            />
          </div>
        </div>
        <button onClick={props.onCancel}>Cancel</button>
        <button onClick={props.onSave}>Save</button>
      </div>
    );
  } else {
    return <div />;
  }
};

export default EditUser;
