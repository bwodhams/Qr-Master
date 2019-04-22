/*
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *
 *  @author Benjamin Wodhams
 *
 */

import React from 'react';
const ShowCards = props => {
  if (props.showingCards) {
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
        </div>
        <button onClick={props.onCancel}>Cancel</button>
        <button onClick={e => props.onSubmit(e, document.getElementById("email").value)}>Submit</button>
      </div>
    );
  } else if(props.showAllCardsNow) {
    return (
        <div>
          <div className="editfields">
          Check console to see card(s) currently on the account
          </div>
          <button onClick={props.onCancel}>Cancel</button>
          <button onClick={e => props.onSubmit(e, document.getElementById("email").value)}>Submit</button>
        </div>
      );
  }else{
    return <div />;
  }
};

export default ShowCards;
