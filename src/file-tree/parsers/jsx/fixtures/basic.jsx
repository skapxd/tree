import React from 'react';

export const Button = ({ label }) => {
  return <button data-helper={helper()}>{label}</button>;
};

export class Card extends React.Component {
  render() {
    return <div>{this.props.children}</div>;
  }
}

function helper() {
  return 'helper';
}
