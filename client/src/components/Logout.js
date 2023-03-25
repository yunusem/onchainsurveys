import { useHistory } from 'react-router-dom';

function Logout() {
  const history = useHistory();

  
  // const disconnectWallet = async () => {
  //   try {
  //     const isDisconnected = await provider.disconnectFromSite();
  //     if (isDisconnected) {
  //       setActivePublicKey(null);
  //     }
  //   } catch (error) {
  //     console.error("Error disconnecting wallet: " + error.message);
  //   }
  // };

  // const handleLogout = (e) => {
  //   e.preventDefault();
  //   disconnectWallet();
  // };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    history.push('/login');
  };


  return (
    <div>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Logout;
