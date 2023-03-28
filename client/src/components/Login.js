import React, { useState, useContext } from 'react';
import { loginUser, loginWithWallet } from '../api';
import { useHistory, Link } from 'react-router-dom';
import Logo from "../assets/casper-logo.svg";
import CasperWalletContext from './CasperWalletContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const history = useHistory();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await loginUser(email, password);
      history.push('/');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };
  
  const provider = useContext(CasperWalletContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const isConnected = await provider.requestConnection();
      if (isConnected) {
        const walletAddress = await provider.getActivePublicKey();
        
        const response = await loginWithWallet(walletAddress);
        if (response.success) {
          localStorage.setItem('wallet_address', walletAddress);
          history.push('/');
        }
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="bg-gray-700 h-screen w-screen text-white flex items-center flex flex-col  justify-center ">
      <Link to="/">
        <img src={Logo} alt="logo" width="72px" />
      </Link>
      
      <h2 className="text-2xl font-semibold my-4">Login</h2>
      <form onSubmit={handleSubmit} className="w-72">
        <div className="flex flex-col">
          <label htmlFor="email" className="font-medium">
            E-mail Address
          </label>
          <input
            type="email"
            id="email"
            placeholder="E-mail address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-2 h-11 rounded-lg mt-1 text-black font-medium outline-none"
          />
        </div>
        <div className="flex flex-col mt-3">
          <label htmlFor="password" className="font-medium">
            Password
          </label>
          <input
            type="password"
            id="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-2 h-11 rounded-lg rounded-lg mt-1 text-black font-medium outline-none"
          />
        </div>

        <br />
        <button
          type="submit"
          className="bg-red-500  py-3 rounded-xl font-semibold px-5 text-white w-72"
        >
          Login
        </button>
      </form>
      <br></br>
      <form onSubmit={handleLogin} className="w-72">
        <button
          type="submit"
          className="bg-red-500  py-3 rounded-xl font-semibold px-5 text-white w-72"
        >
          Connect Wallet
        </button>
      </form>
      <p className="mt-2 font-medium text-sm">
        Do you haven't account?
        <Link to="/register">
          <span className="text-red-500 font-semibold"> Register</span>
        </Link>
      </p>
    </div>
  );
}

export default Login;
