import React from 'react';
import { useHistory } from 'react-router-dom';

function ThankYou() {
  const history = useHistory();

  const handleClick = () => {
    history.push('/');
  };

  return (
    <div>
      <h2>Thank you for submitting your response!</h2>
      <p>Your input is valuable to us.</p>
      <button onClick={handleClick}>Go to Home Page</button>
    </div>
  );
}

export default ThankYou;
