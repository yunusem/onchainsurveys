import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { createSurvey } from '../api';
import NavigationBar from './NavigationBar';

function SurveyForm() {
  const { id } = useParams();
  const history = useHistory();
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState([{ text: '', answers: [{ text: '' }, { text: '' }] }]);
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState('');
  const isWalletConnected = Boolean(localStorage.getItem('active_public_key'));
  const token = localStorage.getItem('token');
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [isFormValid, setIsFormValid] = useState(false);
  const [isCurrentQuestionValidForNewAnswer, setIsCurrentQuestionValidForNewAnswer] = useState(false);
  const [isEndDateFilled, setIsEndDateFilled] = useState(false);

  useEffect(() => {
    const updateFormValidity = () => {
      if (!title) {
        return;
      }
  
      const isTitleValid = title.trim() !== '';
      const areAllQuestionsValid = questions.every((question, index) => {
        if (!question.text) {
          return null;
        }
        const isQuestionTextValid = question.text.trim() !== '';
        const areAllAnswersValid = question.answers.length >= 2 && question.answers.every(answer => answer.text && answer.text.trim() !== '');
        const isQuestionValid = isQuestionTextValid && areAllAnswersValid;
  
        if (index === activeQuestionIndex) {
          const hasAtLeastTwoNonEmptyAnswers = question.answers.filter(answer => answer.text && answer.text.trim() !== '').length >= 2;
          setIsCurrentQuestionValidForNewAnswer(hasAtLeastTwoNonEmptyAnswers);
        }
  
        return isQuestionValid;
      });
      setIsFormValid(isTitleValid && areAllQuestionsValid );
    };

    updateFormValidity();
  }, [title, questions, activeQuestionIndex]);

  useEffect(() => {
    setIsEndDateFilled(Boolean(endDate));
  }, [isEndDateFilled, endDate]);



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
        console.error(error);
      }
    }
  };

  const handleQuestionChange = (questionIndex, newText) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].text = newText;
    setQuestions(updatedQuestions);
  };

  const handleAnswerChange = (questionIndex, answerIndex, newAnswer) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].answers[answerIndex] = { text: newAnswer };
    setQuestions(updatedQuestions);
  };


  const addQuestion = () => {
    setQuestions([...questions, { text: '', answers: ['', ''] }]);
    setActiveQuestionIndex(questions.length);
  };

  const removeAnswer = (questionIndex, answerIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].answers.splice(answerIndex, 1);
    setQuestions(updatedQuestions);
  };

  const addAnswer = () => {
    const updatedQuestions = [...questions];
    updatedQuestions[activeQuestionIndex].answers.push({ text: '' });
    setQuestions(updatedQuestions);
  };

  const goToPreviousQuestion = () => {
    if (activeQuestionIndex > 0) {
      setActiveQuestionIndex(activeQuestionIndex - 1);
    }
  };
  const goToNextQuestion = () => {
    if (activeQuestionIndex < questions.length - 1) {
      setActiveQuestionIndex(activeQuestionIndex + 1);
    }
  };
  return (
    <div className="grid grid-flow-col bg-gray-800 h-auto w-screen">
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
          <div className="w-3/4">
            <div className= "w-4/6">
              <div className="flex justify-center mt-3  h-full">
                <div className="text-white justify-center  w-full p-1 ">

                  <form onSubmit={handleSubmit} className="w-full">
                    <div className="flex justify-between items-center">
                      <div >
                        <label htmlFor="title" className="font-medium bg-gray ">
                          Title
                        </label>
                      </div>

                    </div>
                    <div className='flex'>
                      <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="p-2 h-8 rounded mt-1 w-full text-white bg-gray-700 font-medium outline-none focus:outline-emerald-500"
                      />
                    </div>
                    <hr className='border-gray-400 mt-8 h-3 w-full '></hr>
                    {questions.map((question, questionIndex) => (
                      questionIndex === activeQuestionIndex && (
                        <div key={questionIndex} className="mt-3">
                          <div className="flex flex-col">
                            <div className=' flex justify-between items-center'>
                              <div>
                                <label htmlFor={`question-${questionIndex}`} className="font-medium">
                                  Question {questionIndex + 1}
                                </label>
                              </div>
                              <div className="flex space-x-2">
                                {activeQuestionIndex > 0 && (
                                  <button
                                    onClick={goToPreviousQuestion}
                                    className="w-6 h-6 rounded bg-gray-600 items-center"
                                  >
                                    {"<"}
                                  </button>
                                )}

                                {questions.length > 0 && activeQuestionIndex !== questions.length - 1 && (
                                  <button
                                    onClick={goToNextQuestion}
                                    className="w-6 h-6 rounded bg-gray-600 items-center"
                                  >
                                    {">"}
                                  </button>
                                )}

                              </div>

                            </div>
                            <input
                              type="text"
                              id={`question-${questionIndex}`}
                              value={question.text}
                              onChange={(e) => handleQuestionChange(questionIndex, e.target.value)}
                              className="p-2 h-8 rounded mt-1 text-white bg-gray-700 font-medium outline-none focus:outline-emerald-500"
                            />
                          </div>

                          {question.answers.map((answer, answerIndex) => (
                            <div key={answerIndex} className="mt-3 relative">
                              <div className="flex items-center">
                                <input
                                  type="text"
                                  id={`question-${questionIndex}-answer-${answerIndex}`}
                                  value={answer.text}
                                  placeholder={`Answer ${answerIndex + 1}`}
                                  onChange={(e) => handleAnswerChange(questionIndex, answerIndex, e.target.value)}
                                  className="p-2 h-8 rounded mt-1 text-white bg-gray-600 font-medium outline-none focus:outline-emerald-500 flex-grow"
                                />
                                {answerIndex >= 2 && (
                                  <button
                                    type="button"
                                    onClick={() => removeAnswer(questionIndex, answerIndex)}
                                    className="ml-2 text-white rounded p-1"
                                  >
                                    x
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}

                          <div className="flex  mt-3 h-12">
                            <button
                              type="button"
                              onClick={() => addAnswer(questionIndex)}
                              className={`bg-emerald-500 rounded font-semibold text-white mr-2 h-8 w-40 ${!isCurrentQuestionValidForNewAnswer && 'opacity-50 cursor-not-allowed'}`}
                              disabled={!isCurrentQuestionValidForNewAnswer}
                            >
                              Add Answer
                            </button>

                            <div className='grid justify-items-end content-end w-full h-8'>
                              <div className='grid h-8 w-36 justify-items-end'>
                                <button
                                  className={`text-emerald-500 text-end ${!isFormValid && 'opacity-50 cursor-not-allowed'}`}
                                  onClick={addQuestion}
                                  disabled={!isFormValid}
                                >
                                  Add  Question ?
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )))}
                    <div className="w-full flex ">
                      <div className='flex items-center justify-end w-full mb-4'>
                        <input
                          type="date"
                          id="endDate"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="p-2 h-8 rounded mt-1 text-white bg-gray-700 font-medium outline-none"
                        />
                      </div>

                    </div>
                    <div className="flex items-center justify-end">
                      <button
                        type="submit"
                        className={`bg-emerald-500 h-8 px-3 rounded font-semibold text-white ${(!isFormValid || !isEndDateFilled) && 'opacity-50 cursor-not-allowed'}`}
                        disabled={!isFormValid || !isEndDateFilled}
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
    </div>
  );
}

export default SurveyForm;