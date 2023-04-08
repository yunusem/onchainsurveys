import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { createSurvey } from '../api';
import NavigationBar from './NavigationBar';

function SurveyForm() {
  const { id } = useParams();
  const history = useHistory();
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState([{ text: '', answers: [{ text: '' },{ text: '' }] }]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const isWalletConnected = Boolean(localStorage.getItem('active_public_key'));
  const token = localStorage.getItem('token');

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

    if (!isWalletConnected) {
      history.push('/');
    }

    if (!id) {
      try {
        //TODO make creationFee adjustable from server, rewardPerResponse dynamic
        await createSurvey({ title, questions, startDate, endDate, creationFee: 10, rewardPerResponse: 1 });
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
    setQuestions([...questions, { text: '', answers: ['',''] }]);
  };

  const addAnswer = (questionIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].answers.push({ text: '' });
    setQuestions(updatedQuestions);
  };

  return (
    <div className="grid grid-rows-13 grid-flow-col bg-gray-800 h-screen w-screen">
   
    <NavigationBar/>
    <div className='col-span-12 items-center flex justify-center'>
    <div className="py-12 px-8   text-white  justify-center bg-gray-900 shadow-lg rounded w-3/4 overflow-auto h-screen">
      <h2 className="text-2xl font-semibold my-4">{id ? 'Edit Survey' : 'Create Survey'}</h2>
      <form onSubmit={handleSubmit} className="w-full">
        <div className="flex flex-col ">
          <label htmlFor="title" className="font-medium">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="p-2 h-11 rounded mt-1 text-black font-medium outline-none"
          />
        </div>
        {questions.map((question, questionIndex) => (
          <div key={questionIndex} className="mt-3">
            <div className="flex flex-col">
              <label htmlFor={`question-${questionIndex}`} className="font-medium">
                Question {questionIndex + 1}
              </label>
              <input
                type="text"
                id={`question-${questionIndex}`}
                value={question.text}
                onChange={(e) => handleQuestionChange(questionIndex, e.target.value)}
                className="p-2 h-11 rounded mt-1 text-black font-medium outline-none"
              />
            </div>
            {question.answers.map((answer, answerIndex) => (
              <div key={answerIndex} className="mt-3">
                <div className="flex flex-col">
                  <input
                    type="text"
                    id={`question-${questionIndex}-answer-${answerIndex}`}
                    value={answer.text}
                    placeholder={`Answer ${answerIndex + 1}`}
                    onChange={(e) => handleAnswerChange(questionIndex, answerIndex, e.target.value)}
                    className="p-2 h-11 rounded mt-1 text-black font-medium outline-none"
                  />
                </div>
              </div>
              
            ))}
            <button
              type="button"
              onClick={() => addAnswer(questionIndex)}
              className="bg-emerald-500 py-2 px-4 rounded font-semibold text-white mt-3 w-1/4">
              Add Answer
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addQuestion}
          className="bg-emerald-500 py-2 px-4 rounded font-semibold text-white mt-3 w-1/4"
        >
          Add Question
        </button>
        <div className="w-full flex mt-3 ">
        <div className="w-1/4 flex flex-col mt-3">
          <label htmlFor="startDate" className="font-medium">
            Start Date
          </label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="p-2 h-11 rounded mt-1 text-black font-medium outline-none"
          />
        </div>
        <div className="w-1/4 flex flex-col mt-3 ">
          <label htmlFor="endDate" className="font-medium">
            End Date
          </label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="p-2 h-11 rounded mt-1 text-black font-medium outline-none"
          />
        </div>
        </div>
        <button
          type="submit"
          className="bg-emerald-500 py-3 px-5 rounded font-semibold text-white w-full mt-3"
        >
          {id ? 'Update' : 'Create'}
        </button>
      </form>
      </div>
    </div>
    </div>
    
  );
}
export default SurveyForm;
