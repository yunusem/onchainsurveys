import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { createSurvey } from '../api';

function SurveyForm() {
  const { id } = useParams();
  const history = useHistory();
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const fetchSurvey = async () => {
      if (!id) return;
      const response = await fetch(`/api/surveys/${id}`);
      const data = await response.json();
      setTitle(data.title);
      setQuestions(data.questions.map(question => question.text).join('\n'));
      setStartDate(data.startDate);
      setEndDate(data.endDate);
    };

    fetchSurvey();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const token = localStorage.getItem('token');
    const formattedQuestions = questions.split('\n').map(text => ({ text, answers: [] }));
  
    if (!token) {
      console.error('Please log in again.');
      return;
    }
  
    if (!id) {
      try {
        await createSurvey({ title, questions: formattedQuestions, startDate, endDate }, token);
        history.push('/surveys');
      } catch (error) {
        console.error('Failed to create survey:', error);
      }
    } else {
      const url = `/api/surveys/${id}`;
      const method = 'PUT';
  
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ title, questions: formattedQuestions, startDate, endDate }),
      });
  
      if (response.ok) {
        history.push('/surveys');
      } else {
        const error = await response.json();
        console.log(error);
      }
    }
  };
  

  return (
    <div>
      <h2>{id ? 'Edit Survey' : 'Create Survey'}</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="title">Title:</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <br />
        <label htmlFor="questions">Questions (one per line):</label>
        <textarea
          id="questions"
          value={questions}
          onChange={(e) => setQuestions(e.target.value)}
        />
        <br />
        <label htmlFor="startDate">Start Date:</label>
        <input
          type="date"
          id="startDate"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <br />
        <label htmlFor="endDate">End Date:</label>
        <input
          type="date"
          id="endDate"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <br />
        <button type="submit">{id ? 'Update' : 'Create'}</button>
      </form>
    </div>
  );
}

export default SurveyForm;
