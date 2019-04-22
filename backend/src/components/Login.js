/*
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *
 *  @author Benjamin Wodhams
 *
 */

import React from 'react';

const Login = props => {
  if (props.startLogin) {
    return (
      <div>
        <div className="editfields">
          <div>
            <label>Email: </label>
                <input
                  id="inputEmail"
                  name="email"
                />
          </div>
          <div>
            <label>Password: </label>
            <input
              id="inputPassword"
              type="password"
              secureTextEntry={true}
              name="passwordHash"
            />
          </div>
        </div>
        <button onClick={props.onCancel}>Cancel</button>
        <button onClick={e => props.onLogin(e, document.getElementById("inputEmail").value, document.getElementById("inputPassword").value)}>Login</button>
      </div>
    );
  } else if(props.loggedIn === null || props.loggedIn === undefined){
    return <div />;
  } else if(props.loggedIn){
    return (
            <h2>You have logged in successfully!</h2>
      );
  } else if(!props.loggedIn){
    return (
            <h2>You are not logged in!</h2>
    );
  } else {
    return <div />;
  }
};

export default Login;
