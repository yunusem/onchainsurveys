import React, { useState, useEffect } from 'react';
import { useParams, useHistory, Link } from 'react-router-dom';
import { fetchSurvey, submitSurveyResponse } from '../api';
import SurveyQuestion from './SurveyQuestion';
import Logo from "../assets/onchain-surveys-logo.svg";

function Survey() {
  const [survey, setSurvey] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const { id } = useParams();
  const history = useHistory();
  const isWalletConnected = Boolean(localStorage.getItem('active_public_key'));
  const [allQuestionsAnswered, setAllQuestionsAnswered] = useState(false);


  useEffect(() => {
    if (answers.every((answer) => answer !== null)) {
      setAllQuestionsAnswered(true);
    } else {
      setAllQuestionsAnswered(false);
    }
  }, [answers]);

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


  useEffect(() => {
    async function loadSurvey() {
      try {
        const response = await fetchSurvey(id);
        setSurvey(response);
        setAnswers(new Array(response.questions.length).fill(null));
      } catch (error) {
        console.error('Failed to fetch survey:', error);
      }
    }
    loadSurvey();
  }, [id]);

  const handleChange = (index, answer) => {
    setAnswers((prevAnswers) => {
      const newAnswers = [...prevAnswers];
      newAnswers[index] = answer;
      return newAnswers;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await submitSurveyResponse(id, answers);
      history.push('/thankyou');
    } catch (error) {
      console.error('Failed to submit survey response:', error);
    }

  };


  if (!survey) {
    return (
      <div className="bg-gray-800 text-center h-screen w-screen text-white flex items-center flex-col  justify-center ">
        <div>Loading...</div>
      </div>);
  }

  return (
    <div className="bg-gray-800 h-screen w-screen text-white flex items-center flex-col justify-center">
      <div name="logo" className="absolute left-0 top-0 w-64 h-24 flex justify-center items-center p-8">
        <Link to="/">
          <img src={Logo} alt="logo" width="512px" />
        </Link>
      </div>
      <div className="py-12 px-8 bg-gray-900 shadow-lg rounded w-3/4">
        <h2 className="text-2xl font-semibold mb-6">{survey.title}</h2>
        <p className="mb-6">{survey.description}</p>
        <form onSubmit={handleSubmit} className="w-full">
          {survey.questions.map((question, index) => (
            <div
              key={question._id}
              className={`bg-gray-800 p-6 rounded mb-6 transition-opacity duration-300 ${index === currentPage ? 'opacity-100' : 'opacity-0 hidden'
                }`}
            >
              <SurveyQuestion
                key={question._id}
                question={{ ...question, selectedAnswer: answers[index] }}
                onChange={(answer) => handleChange(index, answer)}
              />
            </div>
          ))}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 0}
              className={`bg-emerald-500 py-2 px-4 rounded font-semibold text-white ${currentPage !== 0 ? 'opacity-100' : 'opacity-0 hidden'}`}
            >
              Previous
            </button>
            {currentPage < survey.questions.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentPage(currentPage + 1)}
                className="bg-emerald-500 py-2 px-4 rounded font-semibold text-white"
              >
                Next
              </button>
            ) : null}
          </div>
        </form>
      </div>
      {allQuestionsAnswered && (
        <div className="mt-4">
          <button
            type="submit"
            onClick={handleSubmit}
            className="bg-emerald-500 py-2 px-4 rounded font-semibold text-white"
          >
            Submit
          </button>
        </div>
      )}
    </div>
  );

}

export default Survey;
