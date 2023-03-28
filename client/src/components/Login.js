import React, { useState, useContext } from 'react';
import { useHistory, Link } from 'react-router-dom';
import Logo from "../assets/casper-logo.svg";
import CasperWalletContext from './CasperWalletContext';
import { registerUser, loginWithWallet } from '../api';
function Login() {
  const [email, setEmail] = useState('');
  const [isWalletConnected, setIsWalletConnected] = useState(localStorage.getItem('active_public_key'));
  const history = useHistory();
  const provider = useContext(CasperWalletContext);
  const activePublicKey = localStorage.getItem('active_public_key');
  const CasperWalletEventTypes = window.CasperWalletEventTypes;
  const userAlreadySigned = localStorage.getItem('user_already_signed');

  if (!isWalletConnected) {
    history.push('/');
  }

  const handleEvent = async (event) => {
    try {
      const state = JSON.parse(event.detail);
      setIsWalletConnected(state.isConnected);
      if (!isWalletConnected) {
        localStorage.removeItem('active_public_key');
        localStorage.removeItem('user_already_signed');
      }
    } catch (err) {
      console.error('Failed to handle event:', err);
    }
  };

  const handleEventKeyChanged = async (event) => {
    try {
      const state = JSON.parse(event.detail);
      setIsWalletConnected(state.isConnected);
      if (state.activeKey) {
        const response = await loginWithWallet(state.activeKey);
        if (response.success) {
          localStorage.setItem('active_public_key', state.activeKey);
        }
      }
    } catch (err) {
      console.error('Failed to handle event:', err);
    }
  };

  const signMessage = async (message, signingPublicKeyHex) => {
    provider
      .signMessage(message, signingPublicKeyHex)
      .then(async (res) => {
        if (res.cancelled) {
          alert('Sign cancelled');
        } else {
          const response = await registerUser({ publicAddress: signingPublicKeyHex, email: message });
          if (response.success) {
            history.push('/', { signature: res.signature });
          } else {
            console.log(response)
          }
        }
      })
      .catch((err) => {
        alert('Error: ' + err);
      });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const currentDate = new Date().toLocaleString();
    signMessage(userAlreadySigned ? `Please verify with your signature. Date: ${currentDate}` : email, activePublicKey);
  };


  window.addEventListener(CasperWalletEventTypes.Connected, handleEvent);
  window.addEventListener(CasperWalletEventTypes.Disconnected, handleEvent);
  window.addEventListener(CasperWalletEventTypes.ActiveKeyChanged, handleEventKeyChanged);

  return (
    <div className="bg-gray-700 h-screen w-screen text-white flex items-center flex flex-col  justify-center ">
      <Link to="/">
        <img src={Logo} alt="logo" width="72px" />
      </Link>
      <h2 className="text-2xl font-semibold my-4">Wallet Connected!</h2>
      <form onSubmit={handleSubmit} className="w-72">
        <div className="flex flex-col">
        {console.log(userAlreadySigned)}
          { userAlreadySigned ? ( <br></br>) : (
            <input
              type="email"
              id="email"
              placeholder="E-mail address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="p-2 h-11 rounded-lg mt-1 text-black font-medium outline-none"
            />
          )
          }
        </div>
        <br />
        <button
          type="submit"
          className="bg-red-500  py-3 rounded-xl font-semibold px-5 text-white w-72">
          Sign
        </button>
      </form>
      <br></br>
      <p className="w-144 mt-2 font-medium text-sm">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
        <Link to="/register">
          <span className="text-red-500 font-semibold"> link link</span>
        </Link>
      </p>
    </div>
  );
}

export default Login;
