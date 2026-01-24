import React from 'react';

export interface Props {
  title: string;
}

export const Header: React.FC<Props> = ({ title }) => {
  return <h1>{title}</h1>;
};

export default function App() {
  const [count, setCount] = React.useState(0);
  return <Header title="Hello" />;
}
