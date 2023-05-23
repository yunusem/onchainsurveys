import React, { useState, useEffect, useContext } from 'react';
import { useHistory, Link } from 'react-router-dom';
import Logo from "../assets/onchain-surveys-logo.svg";
import { registerUser, loginWithWallet, checkUserActive, syncUserDetail } from '../api';
import CasperWalletEvents from './CasperWalletEvents';
import { useUserActivation } from '../contexts/UserActivationContext';
import { CLPublicKey, verifyMessageSignature } from 'casper-js-sdk';
import AlertContext from '../contexts/AlertContext';

function Login() {
  // Define state variables and hooks
  const [email, setEmail] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isWalletConnected, setIsWalletConnected] = useState(Boolean(localStorage.getItem('active_public_key')));
  const [isUserAlreadySigned, setIsUserAlreadySigned] = useState(localStorage.getItem('user_already_signed') === "true");
  const [activePublicKey, setActivePublicKey] = useState(localStorage.getItem('active_public_key'));
  const [, setUserIsActivated] = useUserActivation();
  const history = useHistory();
  const { showAlert } = useContext(AlertContext);
  const [connectedVisible, setConnectedVisible] = useState(false);


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
    const timer = setTimeout(() => {
      setConnectedVisible(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

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
    const userId = localStorage.getItem('userId');
    provider
      .signMessage(message, signingPublicKeyHex)
      .then(async (res) => {
        if (res.cancelled) {
          setIsVerifying(false);
          showAlert('error', 'Signing cancelled!');
        } else {
          const publicKey = CLPublicKey.fromHex(signingPublicKeyHex, true);
          const result = verifyMessageSignature(publicKey, message, res.signature);
          if (result) {
            const response = await registerUser({ publicAddress: signingPublicKeyHex, email: message });
            if (response.success) {
              const activationResponse = await checkUserActive(userId, setUserIsActivated);
              setIsVerifying(true);
              if (activationResponse.success) {
                const userHandled = await syncUserDetail(userId, signingPublicKeyHex);
                if (userHandled.success) {
                  localStorage.setItem('x_casper_provided_signature', JSON.stringify(res.signature));
                  history.push('/');
                } else {
                  showAlert('error', "Could not fetch user account details from the chain!");
                }
              } else {
                localStorage.removeItem('x_casper_provided_signature');
                showAlert('error', activationResponse.message);
              }
            } else {
              showAlert('error', response.message);
            }
          } else {
            localStorage.removeItem('x_casper_provided_signature');
            showAlert('error', "Could not verify the signature");
          }
          setIsVerifying(false);
        }
      })
      .catch((err) => {
        showAlert('error', 'Error: Could not verify the signature');
      });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const currentDate = new Date().toLocaleString();
    signMessage(isUserAlreadySigned ? `Please verify with your signature. \nDate: ${currentDate}` : email, activePublicKey)
      .catch((err) => {
        console.error(err);
        showAlert('error', 'An error occurred while signing the message.');
      });
  };
  return (
    <div className="select-none flex bg-slate-900 text-center h-screen w-full text-white items-start justify-center">
      <div className="relative mt-48 flex flex-col items-center justify-between">
        <div className="mb-20">
          <Link to="/">
            <img src={Logo} alt="logo" width="256px" />
          </Link>
        </div>
        <h1 className={`w-fit font-medium text-4xl p-6 text-slate-200 transition-all duration-700 ease-in-out ${connectedVisible ? "opacity-100 scale-100" : "opacity-0 scale-0"}`}>
          Wallet <span className="text-red-500 ">Connected!</span>
        </h1>
        <form onSubmit={handleSubmit} className={`w-72 transition-all delay-300 duration-1000 ease-in-out ${connectedVisible ? "opacity-100" : "opacity-0"}`}>
          <div className="flex flex-col">
            {isUserAlreadySigned ? (<div className="h-11 w-20"></div>) : (
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
            className={`bg-red-500  py-3 rounded font-semibold px-5 text-white w-72 ${isVerifying && "animate-pulse  cursor-not-allowed pointer-events-none"}`}>
            {isVerifying ? ("Syncing ...") : (isUserAlreadySigned ? "Verify" : "Verify Email")}
          </button>
        </form>
        <p className={`mt-4 w-fit text-slate-400 font-medium text-sm transition-all delay-500 duration-1000 ease-in-out ${connectedVisible ? "opacity-100" : "opacity-0"}`}>

          Activity problem ? Checkout
          <a href="https://cspr.live/">
            <span className="text-red-500 font-semibold"> CSPR.live</span>
          </a>

        </p>
      </div>
    </div>
  );
}

export default Login;
