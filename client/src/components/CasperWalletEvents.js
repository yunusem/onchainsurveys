import { useEffect, useContext } from 'react';
import CasperWalletContext from '../contexts/CasperWalletContext';

const CasperWalletEvents = (handleEvent, handleEventKeyChanged) => {
  const provider = useContext(CasperWalletContext);
  const CasperWalletEventTypes = window.CasperWalletEventTypes;

  useEffect(() => {
    window.addEventListener(CasperWalletEventTypes.Connected, handleEvent);
    window.addEventListener(CasperWalletEventTypes.Disconnected, handleEvent);
    window.addEventListener(CasperWalletEventTypes.ActiveKeyChanged, handleEventKeyChanged);

    return () => {
      window.removeEventListener(CasperWalletEventTypes.Connected, handleEvent);
      window.removeEventListener(CasperWalletEventTypes.Disconnected, handleEvent);
      window.removeEventListener(CasperWalletEventTypes.ActiveKeyChanged, handleEventKeyChanged);
    };
  }, [handleEvent, handleEventKeyChanged, CasperWalletEventTypes]);

  return provider;
};

export default CasperWalletEvents;
