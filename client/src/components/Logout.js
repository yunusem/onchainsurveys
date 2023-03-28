import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import CasperWalletContext from './CasperWalletContext';
import { useContext } from 'react';

function Logout() {
  const history = useHistory();
  const provider = useContext(CasperWalletContext);

  useEffect(() => {
    const handleDisconnect = (event) => {
      try {
        const state = JSON.parse(event.detail);
        if (!state.isConnected) {
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          localStorage.removeItem('wallet_address');
          history.push('/login');
        }
      } catch (error) {
        console.error("Error handling disconnect event: " + error.message);
      }
    };

    const CasperWalletEventTypes = window.CasperWalletEventTypes;
    window.addEventListener(CasperWalletEventTypes.Disconnected, handleDisconnect);

    return () => {
      window.removeEventListener(CasperWalletEventTypes.Disconnected, handleDisconnect);
    };
  }, [history]);

  const handleLogout = async () => {
    try {
      const isConnected = await provider.isConnected();
      if (isConnected) {
        const isDisconnected = await provider.disconnectFromSite();
        if (isDisconnected) {
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          localStorage.removeItem('wallet_address');
          history.push('/login');
        }
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('wallet_address');
        history.push('/login');
      }
    } catch (error) {
      console.error("Error disconnecting wallet: " + error.message);
    }
  };

  return (
    <div>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Logout;
