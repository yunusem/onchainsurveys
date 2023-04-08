import React, { useEffect, useContext } from 'react';
import { useHistory, Link } from 'react-router-dom';
import Logo from "../assets/onchain-surveys-logo.svg";
import QRCode from 'qrcode.react';
import CasperWalletContext from './CasperWalletContext';



function NavigationBar() {
    const history = useHistory();
    const token = localStorage.getItem('token');
    const isWalletConnected = Boolean(localStorage.getItem('active_public_key'));
    const provider = useContext(CasperWalletContext);
    const currentPath = history.location.pathname

    const isActive = (path) => {
        return currentPath === path ? 'bg-gray-800' : 'bg-gray-700 ';
    };
    const isCreateActive = (path) => {
        return currentPath === path ? 'bg-emerald-500 text-white ' : 'bg-gray-700 border-solid border-2 border-emerald-500 text-emerald-500';
    };


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
    const end = walletAddress.substring(walletAddress.length - 4);
    const formattedAddress = `${start}...${end}`;

    const handleLogout = async () => {
        try {
            const isConnected = await provider.isConnected();
            if (isConnected) {
                // Attempt to disconnect from the wallet
                const isDisconnected = await provider.disconnectFromSite();
                if (isDisconnected) {
                    removeItems();
                    //   setIsAuthenticated(false);
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


        <div className="w-64 font-bold">
            <div className="bg-gray-700 h-screen flex-col flex justify-between">
                <div name="logo" className="h-24 bg-gray-700 flex justify-center items-center p-8">
                    <Link to="/">
                        <img src={Logo} alt="logo" width="512px" />
                    </Link>
                </div>
                <div name="menu" className="bg-gray-800 flex-col">
                    <div
                        className={`h-16 justify-center items-center  ${isCreateActive(
                            '/surveys/new'
                        )}`}
                    >
                        <div className=" h-14 flex  items-center justify-center ">
                            <Link to="/surveys/new">

                                + Create


                            </Link>
                        </div>
                    </div>
                    <div className={`h-16 text-white flex justify-center items-center ${isActive('/surveysall')}`}>
                        <Link to="/surveysall">
                            History
                        </Link>
                    </div>
                    <div className={`h-16 text-white flex justify-center items-center ${isActive('/surveys')}`}>
                        <Link to="/surveys">
                            My Surveys
                        </Link>
                    </div>
                </div>
                <div className="card bg-gray-800 p-2 h-24 justify-end">
                    <div class="grid grid-rows-3 grid-flow-col gap-2">
                        <div class=" rounded  row-span-3 bg-gray-800 mb-2 flex justify-center items-center">
                            <QRCode value={walletAddress} size={80} />
                        </div>
                        <div className="rounded col-span-2 bg-gray-700 flex justify-center items-center break-all text-white">
                            {formattedAddress}
                        </div>
                        <button onClick={handleLogout} class="rounded row-span-2 col-span-2 bg-gray-700 border-solid border-2 border-red-400 text-red-400 mb-2 flex justify-center items-center text-base">
                            Logout
                        </button>
                    </div>
                </div>
            </div>


        </div>
    );
}

export default NavigationBar;
