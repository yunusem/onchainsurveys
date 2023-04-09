import React, { useState, useEffect } from 'react';
import { useHistory, Link } from 'react-router-dom';
import Logo from "../assets/onchain-surveys-logo.svg";
import { registerUser, loginWithWallet, checkUserActive } from '../api';
import CasperWalletEvents from './CasperWalletEvents';
import { useUserActivation } from '../components/UserActivationContext';
import { CLPublicKey, verifyMessageSignature } from 'casper-js-sdk';

function Login() {
  // Define state variables and hooks
  const [email, setEmail] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isWalletConnected, setIsWalletConnected] = useState(Boolean(localStorage.getItem('active_public_key')));
  const [isUserAlreadySigned, setIsUserAlreadySigned] = useState(localStorage.getItem('user_already_signed') === "true");
  const [activePublicKey, setActivePublicKey] = useState(localStorage.getItem('active_public_key'));
  const [, setUserIsActivated] = useUserActivation();
  const history = useHistory();

  // Define a function to remove all items from localStorage
  function removeItems() {
    // Remove all necessary items from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('active_public_key');
    localStorage.removeItem('user_already_signed');
    localStorage.removeItem('x_casper_provided_signature');
    localStorage.removeItem('user_is_activated');
  }

  useEffect(() => {
    if (!isWalletConnected) {
      history.push('/');
    }
  }, [isWalletConnected, history]);

  const handleEvent = async (event) => {
    try {
      const state = JSON.parse(event.detail);
      setIsWalletConnected(state.isConnected);
      if (!isWalletConnected) {
        removeItems();
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
          setActivePublicKey(state.activeKey);
          setIsUserAlreadySigned(localStorage.getItem('user_already_signed') === "true");
        }
      }
    } catch (err) {
      console.error('Failed to handle event:', err);
    }
  };

  const provider = CasperWalletEvents(handleEvent, handleEventKeyChanged);

  const signMessage = async (message, signingPublicKeyHex) => {
    provider
      .signMessage(message, signingPublicKeyHex)
      .then(async (res) => {
        if (res.cancelled) {
          alert('Sign cancelled');
        } else {
          setIsVerifying(true);
          const publicKey = CLPublicKey.fromHex(signingPublicKeyHex, true);
          const result = verifyMessageSignature(publicKey, message, res.signature);
          if (result) {
            const response = await registerUser({ publicAddress: signingPublicKeyHex, email: message });
            if (response.success) {
              const userId = localStorage.getItem('userId');
              const activationResponse = await checkUserActive(userId, setUserIsActivated);
              if (activationResponse.success) {
                localStorage.setItem('x_casper_provided_signature', JSON.stringify(res.signature));
                history.push('/');
              } else {
                localStorage.removeItem('x_casper_provided_signature');
                alert(activationResponse.message);
              }
              setIsVerifying(false);
            } else {
              alert(response.message);
            }
          } else {
            localStorage.removeItem('x_casper_provided_signature');
            alert('Error: Could not verify the signature');
          }
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const currentDate = new Date().toLocaleString();

    signMessage(isUserAlreadySigned ? `Please verify with your signature. \nDate: ${currentDate}` : email, activePublicKey);
  };

  return (
    <div className="bg-gray-800 h-screen w-screen text-white flex items-center flex-col justify-center">
      <Link to="/">
        <img src={Logo} alt="logo" width="512px" />
      </Link>
      <h2 className="text-4xl font-semibold my-4">
      Wallet <span className="text-emerald-500">Connected!</span>
      </h2>
      <form onSubmit={handleSubmit} className="w-72">
        <div className="flex flex-col">
          {isUserAlreadySigned ? (<br></br>) : (
            <input
              type="email"
              id="email"
              placeholder="E-mail address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="p-2 h-11 rounded mt-1 text-black font-medium outline-none"
            />
          )
          }
        </div>
        <br />
        <button
          type="submit"
          className="bg-emerald-500  py-3 rounded font-semibold px-5 text-white w-72">
          {isVerifying ? ("Verifying ...") : (isUserAlreadySigned ? "Verify" : "Verify Email")}
        </button>
      </form>
      <br></br>
      <br></br>
      <p className="w-96 px-12 py-12 font-medium text-sm">
      
            Activity problem ? Checkout
            <a href="https://www.casperwallet.io/download">
              <span className="text-emerald-500 font-semibold"> CSPR.live</span>
            </a>
          
      </p>
    </div>
  );
}

export default Login;
