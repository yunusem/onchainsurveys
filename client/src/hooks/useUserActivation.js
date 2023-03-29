import { useState } from 'react';

let setUserIsActivatedGlobal = null;

export function useUserActivation() {
  const [userIsActivated, setUserIsActivated] = useState(false);

  setUserIsActivatedGlobal = setUserIsActivated;

  return [userIsActivated, setUserIsActivated];
}

export function updateUserIsActivated(value) {
  if (setUserIsActivatedGlobal) {
    setUserIsActivatedGlobal(value);
  }
}
