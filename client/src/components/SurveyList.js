import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { fetchSurveys } from '../api';

function SurveyList() {
  const [surveys, setSurveys] = useState([]);
  const history = useHistory();

  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    async function loadSurveys() {
      try {
        const response = await fetchSurveys();
        setSurveys(response);
      } catch (error) {
        console.error('Failed to fetch surveys:', error);
      }
    }
    if (token) {
      loadSurveys();
    }
  }, [token, setSurveys]);

  const handleTakeSurvey = (id) => {
    history.push(`/survey/${id}`);
  };

  if (!token) {
    history.push('/login');
    return null;
  }

  const mySurveys = surveys.filter(survey => {
    if (!survey.createdBy) {
      console.log('createdBy is null');
      return false;
    }
    console.log('createdBy._id:', survey.createdBy._id);
    console.log('userId:', userId);
    return survey.createdBy._id === userId;
  });

  return (
    <div>
      <h2>My Surveys</h2>
      <ul>
        {mySurveys.map((survey) => (
          <li key={survey._id}>
            <h3>{survey.title}</h3>
            <p>Number of questions: {survey.questions.length}</p>
            <p>Created by: {survey.createdBy._id}</p>
            <p>Start date: {new Date(survey.startDate).toLocaleDateString()}</p>
            <p>Reward: {survey.rewardPerResponse} CSPR</p>
            <button onClick={() => handleTakeSurvey(survey._id)}>Take Survey</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SurveyList;
