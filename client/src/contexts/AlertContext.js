import { createContext, useState, useEffect } from 'react';

const AlertContext = createContext({
  showAlert: () => {},
  hideAlert: () => {},
  alert: {
    show: false,
    type: '',
    message: '',
  },
});

export const AlertProvider = ({ children }) => {
  const [alert, setAlert] = useState({show: false});

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
  };

  const hideAlert = () => {
    setAlert({show: false});
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      hideAlert();
    }, 5000);

    return () => clearTimeout(timer);
  }, [alert]);

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert, alert }}>
      {children}
    </AlertContext.Provider>
  );
};

export default AlertContext;
