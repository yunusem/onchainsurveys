import { createContext, useContext, useState } from 'react';

const UserActivationContext = createContext();

export function useUserActivation() {
  const context = useContext(UserActivationContext);
  if (!context) {
    throw new Error('useUserActivation must be used within a UserActivationProvider');
  }
  return context;
}

export function UserActivationProvider({ children }) {
  const [userIsActivated, setUserIsActivated] = useState(() => {
    const storedValue = localStorage.getItem('user_is_activated');
    return storedValue ? JSON.parse(storedValue) : false;
  });

  const value = [userIsActivated, setUserIsActivated];

  return <UserActivationContext.Provider value={value}>{children}</UserActivationContext.Provider>;
}
