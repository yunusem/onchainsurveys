import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { createSurvey } from '../api';
import NavigationBar from './NavigationBar';
import { differenceInDays } from 'date-fns';

function SurveyForm() {
  const { id } = useParams();
  const history = useHistory();
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState([{ text: '', answers: [{ text: '' }, { text: '' }] }]);
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
  function daysUntilEndDate() {
    const endDateObj = new Date(endDate);
    const today = new Date();
    return differenceInDays(endDateObj, today);
  }
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
    setQuestions([...questions, { text: '', answers: ['', ''] }]);
    setTimeout(() => {
      window.scrollTo({ top: document.body.offsetHeight, behavior: 'smooth' });
    }, 0);
  };


  const addAnswer = (questionIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].answers.push({ text: '' });
    setQuestions(updatedQuestions);
  };

  return (
    <div className="grid grid-rows-13 grid-flow-col bg-gray-800 h-screen w-screen">
      <NavigationBar />
      <div className='col-span-12 items-center flex justify-center'>
        <div className='flex w-full items-center justify-center h-screen flex-col'>
          <div className=' w-3/4 flex h-32 flex-col text-white'>
            <div className='w-2/4 '>
            <h1 className=" text-4xl font-bold  text-white   text-left">
              {id ? 'Edit Survey' : 'Create Survey'}
            </h1>
            <p className='text-sm mt-2' >You can create surveys where the organizers will distribute rewards to participants using <a href="https://cspr.live/" target="_blank" rel="noopener noreferrer"> <span className='text-emerald-500'>Casper</span> </a> Blockchain Technology.</p>            </div>
          </div>
          <div className=" w-3/4">
            <div className='w-4/6'>
            <div className= "text-white justify-center bg-gray-800  rounded w-full overflow-y-auto ">
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
                    className="p-2 h-11 rounded mt-1 text-white bg-gray-700 font-medium outline-none focus:outline-emerald-500"
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
                        className="p-2 h-11 rounded mt-1 text-white bg-gray-700 font-medium outline-none focus:outline-emerald-500"
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
                            className="p-2 h-11 rounded mt-1 text-white bg-gray-700 font-medium outline-none focus:outline-emerald-500"
                          />
                        </div>
                      </div>

                    ))}
                    <div className="flex items-center mt-3">
                      <button
                        type="button"
                        onClick={() => addAnswer(questionIndex)}
                        className="bg-emerald-500 py-2 px-4 rounded font-semibold text-white mr-2">
                        Add Answer
                      </button>
                      <div className="flex items-center">or</div>
                      <button className="flex items-center ml-2 text-emerald-500" onClick={addQuestion}>
                        Add "Question"
                      </button>
                    </div>
                  </div>
                ))}
                <div className="w-full flex mt-3 ">
                  <div>
                    <input
                      type="date"
                      id="endDate"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="p-2 h-11 rounded mt-1 text-white bg-gray-700 font-medium outline-none"
                    />
                    <span className="ml-3">{daysUntilEndDate()} days left</span>
                  </div>

                </div>
                <div className="flex items-center justify-end">
                  <button
                    type="submit"
                    className="bg-emerald-500 py-3 px-5 rounded font-semibold text-white"
                  >
                    {id ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default SurveyForm;

