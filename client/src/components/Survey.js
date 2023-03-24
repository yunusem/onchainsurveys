import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { fetchSurvey, submitSurveyResponse } from '../api';
import SurveyQuestion from './SurveyQuestion';

function Survey() {
  const [survey, setSurvey] = useState(null);
  const [answers, setAnswers] = useState([]);
  const { id } = useParams();
  const history = useHistory();

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
    // Implement client-side validation here
    try {
      console.log(userId);
      await submitSurveyResponse(id, answers);
      history.push('/thankyou');
    } catch (error) {
      console.error('Failed to submit survey response:', error);
    }
  };

  if (!survey) {
    return <div>Loading...</div>;
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
