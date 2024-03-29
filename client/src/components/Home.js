import React, { useState, useEffect, useContext } from 'react';
import { useHistory, Link } from 'react-router-dom';
import Logo from "../assets/onchain-surveys-logo.svg";
import { fetchSurveys, loginWithWallet, getUser } from '../api';
import CasperWalletContext from '../contexts/CasperWalletContext';
import { useUserActivation } from '../contexts/UserActivationContext';
import NavigationBar from './NavigationBar';
import QuestionIcon from "../assets/question-mark.svg";
import VolunteerIcon from "../assets/volunteer.svg";
import CalendarIcon from "../assets/calendar.svg";
import CoinLogo from "../assets/casper-logo.svg";

function Home() {
  // Define state variables and hooks
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [surveys, setSurveys] = useState([]);
  const [userIsActivated] = useUserActivation();
  const history = useHistory();
  const provider = useContext(CasperWalletContext);
  const [userDetails, setUserDetails] = useState(null);

  // Retrieve user signature and ID from localStorage
  const signature = localStorage.getItem('x_casper_provided_signature');
  const userId = localStorage.getItem('userId');

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

  // Define a function to handle wallet login
  const handleWalletLogin = async (e) => {
    // Attempt to connect to the wallet
    e.preventDefault();
    try {
      const isConnected = await provider.requestConnection();
      if (isConnected) {
        const walletAddress = await provider.getActivePublicKey();
        const response = await loginWithWallet(walletAddress);
        if (response.success) {
          localStorage.setItem('active_public_key', walletAddress);
          history.push('/login');
        }
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const uid = localStorage.getItem("userId");
      if (uid){
        const userData = await getUser(localStorage.getItem("userId"));
        setUserDetails(userData);
      }
    };

    fetchData();
  }, []);

  // Define an effect hook to check if the user is authenticated
  useEffect(() => {
    const token = localStorage.getItem("token");
    const walletAddress = localStorage.getItem("active_public_key");
    const signature = localStorage.getItem('x_casper_provided_signature');
    // Check if the user is authenticated
    if (token && signature && walletAddress && userIsActivated) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, [signature, userIsActivated]);

  // Define an effect hook to load surveys if the user is authenticated
  useEffect(() => {
    async function loadSurveys() {
      try {
        const response = await fetchSurveys();
        setSurveys(response);
      } catch (error) {
        console.error('Failed to fetch surveys:', error);
      }
    }
    // Load surveys if the user is authenticated
    if (isAuthenticated) {
      loadSurveys();
    }
  }, [isAuthenticated]);

  // Define a function to handle taking a survey
  const handleTakeSurvey = (id) => {
    // Navigate to the survey page
    history.push(`/survey/${id}`);
  };

  // Define an effect hook to handle wallet disconnection
  useEffect(() => {
    const handleDisconnect = (event) => {
      try {
        const state = JSON.parse(event.detail);
        if (!state.isConnected) {
          removeItems();
        }
      } catch (error) {
        console.error("Error handling disconnect event: " + error.message);
      }
    };

    // Add event listeners to handle wallet disconnection
    const CasperWalletEventTypes = window.CasperWalletEventTypes;
    window.addEventListener(CasperWalletEventTypes.Disconnected, handleDisconnect);
    window.addEventListener(CasperWalletEventTypes.ActiveKeyChanged, handleDisconnect);
    return () => {
      // Remove event listeners
      window.removeEventListener(CasperWalletEventTypes.Disconnected, handleDisconnect);
      window.removeEventListener(CasperWalletEventTypes.ActiveKeyChanged, handleDisconnect);
    };
  }, []);

  // Filter out the surveys to fit the available requirement
  const availabeSurveys = surveys.filter(survey => {
    // Destructure required user properties for clarity
    if (!userDetails || !userDetails.user) {
      return false;
    }
    const { accountAgeInHours, balance, isValidator, stakedAmount, participantsLimit } = userDetails.user;

    if(survey.responses.length >= participantsLimit){
      return false;
    }

    // Convert user account age to days
    const accountAgeInDays = accountAgeInHours / 24;

    if (!survey.createdBy) {
      return false;
    }

    // Check if user has responded to the survey
    if (survey.responses.length > 0 && survey.responses.find((response) => response.user === userId)) {
      return false;
    }

    // Check if the survey's end date has passed
    if (new Date(survey.endDate) <= new Date()) {
      return false;
    }

    // Check if user created the survey
    if (survey.createdBy._id === userId) {
      return false;
    }

    // Check survey requirements
    if (balance < survey.minimumRequiredBalance || stakedAmount < survey.minimumRequiredStake || accountAgeInDays < survey.minimumAgeInDays) {
      return false;
    }

    // If validator status is required, check if user is a validator
    if (survey.validatorStatus && !isValidator) {
      return false;
    }

    // If none of the conditions fail, include the survey
    return true;
  });


  // Define a function to calculate remaining time
  const remainingTime = (endDate) => {
    const remainingMs = new Date(endDate) - new Date();
    const remainingDays = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
    const remainingHours = Math.floor((remainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    // Calculate remaining time and return a string
    let timeString = '';
    if (remainingDays > 0) {
      timeString += `${remainingDays} day${remainingDays > 1 ? 's' : ''}, `;
    }
    if (remainingHours > 0) {
      timeString += `${remainingHours} hour${remainingHours > 1 ? 's' : ''} `;
    }

    return timeString;
  };

  // Render the Home component
  return (
    <div className="select-none flex bg-slate-900 text-center w-full text-slate-400 items-start justify-center h-screen">
      {isAuthenticated ? (
        <div className="flex h-full w-full bg-slate-800">
          <div className="pt-16 w-full">
            <div className="flex flex-col h-full w-full">
              <div className="flex flex-col overflow-y-auto h-full ">
                <div className=' flex flex-col space-y-16'>
                  <div className='flex w-full  justify-center'>
                    <div className='flex  mt-7 w-3/4 items-center '>
                      <h1 className=" text-3xl font-bold  text-white">
                        Available Surveys
                      </h1>
                    </div>
                  </div>
                  <div className="w-full flex justify-center">
                    <ul className="w-3/4 grid grid-cols-2 grid-rows-7 overflow-y-auto gap-3 gap-y-4 content-start">
                      {availabeSurveys && availabeSurveys.map((survey) => (
                        <li
                          key={survey._id}
                          className="select-none bg-slate-700 rounded   w-full col-span-1 flex items-center space-x-2 group "
                        >
                          <div className=" flex w-full flex-col space-y-2 h-full p-3 justify-between rounded">
                            <div className="col-span-2 text-xl font-semibold text-start break-word">
                              {survey.title}
                            </div>
                            <div className="flex justify-between w-full">
                              <div className='flex items-center space-x-8'>
                                <div className='flex w-8 space-x-1 '>
                                  <img
                                    src={CoinLogo}
                                    alt="Casper Coin Logo"
                                    className="w-4"
                                  />
                                  <div className="text-xl"> {survey.rewardPerResponse} </div>
                                </div>
                                <div className='flex w-8 space-x-1'>
                                  <img
                                    src={QuestionIcon}
                                    alt="Question Icon"
                                    className="w-4"
                                  />
                                  <p> {survey.questions.length}</p>
                                </div>
                                <div className='flex w-8 space-x-1'>
                                  <img
                                    src={VolunteerIcon}
                                    alt="Volunteer Icon"
                                    className="w-4"
                                  />
                                  <p> {survey.responses.length}</p>
                                </div>
                                <div className='flex space-x-1'>
                                  <img
                                    src={CalendarIcon}
                                    alt="Calendar Icon"
                                    className="w-4"
                                  />
                                  <p> {remainingTime(survey.endDate)}</p>
                                </div>
                              </div>

                            </div>
                          </div>
                          <div className="flex justify-center items-start px-3">
                            <button
                              className="bg-red-500  p-4 flex  items-center rounded   font-semibold text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                              onClick={() => handleTakeSurvey(survey._id)}
                            >
                              Vote
                            </button>
                          </div>
                        </li>
                      ))}

                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <NavigationBar />
        </div>
      ) : (
        <div className="flex flex-col mt-48 w-full items-center justify-between">
          <div className="mb-20 ">
            <Link to="/">
              <img src={Logo} alt="logo" width="256px" />
            </Link>
          </div>
          <h1 className="w-[720px] text-4xl p-6 break-normal text-slate-300">
            Create<span className="text-red-500">/Vote</span> on Casper-based surveys using coins and get rewarded automatically
          </h1>
          <button
            className="bg-red-500 px-5 py-3 mt-7 rounded font-semibold text-white w-72"
            onClick={handleWalletLogin}
          >
            Connect Wallet
          </button>
        </div>
      )}
    </div>
  );
}

export default Home;
