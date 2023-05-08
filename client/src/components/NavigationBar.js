import React, { useState, useEffect, useContext } from 'react';
import { useHistory, Link } from 'react-router-dom';
import Logo from "../assets/onchain-surveys-logo.svg";
import Identicon from 'react-hooks-identicons';
import CasperWalletContext from '../contexts/CasperWalletContext';

function NavigationBar() {
    const history = useHistory();
    const token = localStorage.getItem('token');
    const isWalletConnected = Boolean(localStorage.getItem('active_public_key'));
    const provider = useContext(CasperWalletContext);
    const currentPath = history.location.pathname;
    const [dropdownOpen, setDropdownOpen] = useState(false);

    function removeItems() {
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

    useEffect(() => {
        const handleDisconnect = (event) => {
            try {
                const state = JSON.parse(event.detail);
                if (!state.isConnected) {
                    removeItems();
                    history.push('/');
                }
            } catch (error) {
                console.error("Error handling disconnect event: " + error.message);
            }
        };

        const CasperWalletEventTypes = window.CasperWalletEventTypes;
        window.addEventListener(CasperWalletEventTypes.Disconnected, handleDisconnect);
        window.addEventListener(CasperWalletEventTypes.ActiveKeyChanged, handleDisconnect);

        return () => {
            window.removeEventListener(CasperWalletEventTypes.Disconnected, handleDisconnect);
            window.removeEventListener(CasperWalletEventTypes.ActiveKeyChanged, handleDisconnect);
        };
    }, [history]);


    if (!token) {
        history.push('/login');
        return null;
    }

    const walletAddress = localStorage.getItem('active_public_key');
    const start = walletAddress.substring(0, 6);
    const end = walletAddress.substring(walletAddress.length - 7);
    const formattedAddress = `${start}...${end}`;

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    const handleLogout = async () => {
        try {
            const isConnected = await provider.isConnected();
            if (isConnected) {
                const isDisconnected = await provider.disconnectFromSite();
                if (isDisconnected) {
                    removeItems();
                    history.push('/');
                }
            } else {
                removeItems();
            }
        } catch (error) {
            console.error("Error disconnecting wallet: " + error.message);
        }
    };

    return (

        <div className="fixed top-0 left-0 w-full bg-slate-900 p-2">
            <div className="container mx-auto">
                <div className="flex justify-between items-center">
                    <div name="logo">
                        <Link to="/">
                            <img src={Logo} alt="logo" width="96" />
                        </Link>
                    </div>
                    <div name="menu" className="flex space-x-4">
                        {/* ... */}
                        <Link
                            to="/surveys/new"
                            className={`text-ml rounded px-4 py-2 ${currentPath === "/surveys/new"
                                ? " text-red-500"
                                : "text-red-900"
                                }`}
                        >
                            Create +
                        </Link>
                        <Link
                            to="/surveys"
                            className={`text-ml rounded px-4 py-2 ${currentPath === "/surveys"
                                ? " text-white"
                                : "text-slate-600"
                                }`}
                        >
                            History
                        </Link>


                        <div
                            className="relative flex items-center space-x-2 group cursor-pointer"
                            onClick={toggleDropdown}
                        >
                            <div className="rounded">
                                <Identicon className="-translate-y-1" string={walletAddress} size={20} />
                            </div>
                            <div className="text-slate-600 text-sm font-normal group-hover:text-white">
                                {formattedAddress}
                            </div>
                            <div className="text-slate-600 group-hover:text-white">
                                <svg
                                    className="w-5 h-5"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M6 9l6 6 6-6" />
                                </svg>
                            </div>
                            {dropdownOpen && (
                                <div className="absolute right-0 top-10 w-48 rounded-lg bg-white">
                                    <button
                                        onClick={handleLogout}
                                        className="block w-full text-left rounded px-4 py-2 text-white bg-slate-900 font-semibold"
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default NavigationBar;