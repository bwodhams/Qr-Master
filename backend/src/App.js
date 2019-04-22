/*
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *
 *  @author Benjamin Wodhams
 *
 */

import React, { Component } from "react";
import "./App.css";

import Users from "./components/Users";

class App extends Component {
  render() {
    return (
      <div>
        <h1>QRCodes4Good Registered Accounts</h1>
        <div className="header-bar" />
        <app-users />
        <Users />
      </div>
    );
  }
}

export default App;
