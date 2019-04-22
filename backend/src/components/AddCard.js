/*
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *
 *  @author Benjamin Wodhams
 *
 */

import React from 'react';
const AddCard = props => {
  if (props.addingCard) {
    return (
      <div>
        <div className="editfields">
        <div>
            <label>Email: </label>
                <input
                  id="email"
                  name="email"
                />
          </div>
          <div>
            <label>Credit Card Number: </label>
                <input
                  id="creditCard"
                  name="cc"
                />
          </div>
          <div>
            <label>Expiration Date: </label>
                <input
                  id="expDate"
                  name="exp"
                  placeholder="MM/YYYY"
                />
          </div>
          <div>
            <label>CVV: </label>
                <input
                  id="cvv"
                  name="cvv"
                />
          </div>
          <div>
            <label>First Name: </label>
                <input
                  id="firstName"
                  name="firstName"
                />
          </div>
          <div>
            <label>Last Name: </label>
                <input
                  id="lastName"
                  name="lastName"
                />
          </div>
          <div>
            <label>Address: </label>
                <input
                  id="userAddress"
                  name="userAddress"
                />
          </div>
          <div>
            <label>City: </label>
                <input
                  id="city"
                  name="city"
                />
          </div>
          <div>
            <label>State: </label>
                <input
                  id="state"
                  name="state"
                  placeholder="CA"
                />
          </div>
          <div>
            <label>Zip Code: </label>
                <input
                  id="zipCode"
                  name="zipCode"
                />
          </div>
        </div>
        <button onClick={props.onCancel}>Cancel</button>
        <button onClick={e => props.onAddCard(e, 
        document.getElementById("email").value,
        document.getElementById("creditCard").value, 
        document.getElementById("expDate").value,
        document.getElementById("cvv").value,
        document.getElementById("firstName").value,
        document.getElementById("lastName").value,
        document.getElementById("userAddress").value,
        document.getElementById("city").value,
        document.getElementById("state").value,
        document.getElementById("zipCode").value)}>Submit</button>
      </div>
    );
  } else {
    return <div />;
  }
};

export default AddCard;
