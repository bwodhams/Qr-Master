import React from 'react';

const EditHero = props => {
  if (props.selectedHero) {
    return (
      <div>
        <div className="editfields">
          <div>
            <label>email: </label>
            {props.addingHero
              ? <input
                  name="email"
                  placeholder="email"
                  value={props.selectedHero.email}
                  onChange={props.onChange}
                />
              : <label className="value">
                  {props.selectedHero.email}
                </label>}
          </div>
          <div>
            <label>name: </label>
            <input
              name="name"
              value={props.selectedHero.name}
              placeholder="name"
              onChange={props.onChange}
            />
          </div>
          <div>
            <label>Password: </label>
            <input
              name="passwd"
              value={props.selectedHero.passwd}
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

export default EditHero;
