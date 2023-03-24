import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { fetchSurveys } from '../api';

function SurveyList() {
  const [surveys, setSurveys] = useState([]);
  const history = useHistory();

  const token = localStorage.getItem('token');

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
  }, [token,setSurveys]);

  const handleTakeSurvey = (id) => {
    history.push(`/survey/${id}`);
  };

  if (!token) {
    history.push('/login');
    return null;
  }
  return (
    <div>
      <h2>Survey List</h2>
      <ul>
        {surveys.map((survey) => (
          <li key={survey._id}>
            <h3>{survey.title}</h3>
            <p>Description: {survey.description}</p>
            <p>Number of questions: {survey.questions.length}</p>
            <p>Created by: {survey.createdBy.username}</p>
            <p>Start date: {new Date(survey.startDate).toLocaleDateString()}</p>
            <button onClick={() => handleTakeSurvey(survey._id)}>Take Survey</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SurveyList;
