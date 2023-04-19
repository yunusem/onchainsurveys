import { createContext, useState, useEffect } from 'react';

const AlertContext = createContext({
  showAlert: () => {},
  hideAlert: () => {},
  alert: {
    show: false,
  },
});

export const AlertProvider = ({ children }) => {
  const [alert, setAlert] = useState({
    show: false,
    type: '',
    message: '',
  });

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
  };

  const hideAlert = () => {
    setAlert({ show: false });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      hideAlert();
    }, 3000);

    return () => clearTimeout(timer);
  }, [alert]);

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert, alert }}>
      {children}
    </AlertContext.Provider>
  );
};

export default AlertContext;
