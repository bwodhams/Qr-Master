import React from 'react';

const Hero = props => {
  return (
    <li
      onClick={() => props.onSelect(props.hero)}
      className={props.hero === props.selectedHero ? 'selected' : ''}
    >
      <button
        className="delete-button"
        onClick={e => props.onDelete(e, props.hero)}
      >
        Delete
      </button>
      <div className="hero-element">
        <div className="badge">
          {props.hero.email}
        </div>
        <div className="name">
          {props.hero.name}
        </div>
      </div>
    </li>
  );
};

export default Hero;
