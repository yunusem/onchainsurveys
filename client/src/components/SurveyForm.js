import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { createSurvey } from '../api';

function SurveyForm() {
  const { id } = useParams();
  const history = useHistory();
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState([{ text: '', answers: [{ text: '' }] }]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const fetchSurvey = async () => {
      if (!id) return;
      const response = await fetch(`/api/surveys/${id}`);
      const data = await response.json();
      setTitle(data.title);
      setQuestions(data.questions);
      setStartDate(data.startDate);
      setEndDate(data.endDate);
    };

    fetchSurvey();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');

    if (!token) {
      console.error('Please log in again.');
      return;
    }

    if (!id) {
      try {
        await createSurvey({ title, questions, startDate, endDate});
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
        body: JSON.stringify({ title, questions, startDate, endDate }),
      });

      if (response.ok) {
        history.push('/surveys');
      } else {
        const error = await response.json();
        console.log(error);
      }
    }
  };

  const handleQuestionChange = (index, newText) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].text = newText;
    setQuestions(updatedQuestions);
  };

  const handleAnswerChange = (questionIndex, answerIndex, newAnswer) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].answers[answerIndex] = { text: newAnswer };
    setQuestions(updatedQuestions);
  };

  const addQuestion = () => {
    setQuestions([...questions, { text: '', answers: [''] }]);
  };

  const addAnswer = (questionIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].answers.push({ text: '' });
    setQuestions(updatedQuestions);
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
        {questions.map((question, questionIndex) => (
          <div key={questionIndex}>
            <label htmlFor={`question-${questionIndex}`}>Question {questionIndex + 1}:</label>
            <input
              type="text"
              id={`question-${questionIndex}`}
              value={question.text}
              onChange={(e) => handleQuestionChange(questionIndex, e.target.value)}
            />
            <br />
            {question.answers.map((answer, answerIndex) => (
              <div key={answerIndex}>
                <label htmlFor={`question-${questionIndex}-answer-${answerIndex}`}>
                  Answer {answerIndex + 1}:
                </label>
                <input
                  type="text"
                  id={`question-${questionIndex}-answer-${answerIndex}`}
                  value={answer.text}
                  onChange={(e) => handleAnswerChange(questionIndex, answerIndex, e.target.value)}
                />
              </div>
            ))}
            <button type="button" onClick={() => addAnswer(questionIndex)}>
              Add Answer
            </button>
            <br />
          </div>
        ))}
        <button type="button" onClick={addQuestion}>
          Add Question
        </button>
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
