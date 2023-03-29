import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { fetchSurvey, submitSurveyResponse } from '../api';
import SurveyQuestion from './SurveyQuestion';

function Survey() {
  const [survey, setSurvey] = useState(null);
  const [answers, setAnswers] = useState([]);
  const { id } = useParams();
  const history = useHistory();
  const isWalletConnected = Boolean(localStorage.getItem('active_public_key'));

  function removeItems() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('active_public_key');
    localStorage.removeItem('user_already_signed');
  }

  if (!isWalletConnected) {
    history.push('/');
  }

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
    const userId = localStorage.getItem('userId');
    try {
      console.log(userId);
      await submitSurveyResponse(id, answers);
      history.push('/thankyou');
    } catch (error) {
      console.error('Failed to submit survey response:', error);
    }
  };

  if (!survey) {
    return (
      <div className="bg-gray-700 text-center h-screen w-screen text-white flex items-center flex flex-col  justify-center ">
    <div>Loading...</div>
    </div>);
  }

  return (
    <div>
      <h2>{survey.title}</h2>
      <p>{survey.description}</p>
      <form onSubmit={handleSubmit}>
        {survey.questions.map((question, index) => (
          <SurveyQuestion
            key={question._id}
            question={question}
            onChange={(answer) => handleChange(index, answer)}
          />
        ))}
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default Survey;
