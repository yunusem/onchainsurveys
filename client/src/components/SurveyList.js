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
    if (token)
    loadSurveys();
  }, []);

  if (!token) {
    history.push('/login');
    return null;
  }
  return (
    <div>
      <h2>Survey List</h2>
      <ul>
        {surveys.map((survey) => (
          <li key={survey._id}>{survey.title}</li>
        ))}
      </ul>
    </div>
  );
}

export default SurveyList;
