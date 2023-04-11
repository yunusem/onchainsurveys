import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { createSurvey, fetchSurvey, updateSurvey } from '../api';
import NavigationBar from './NavigationBar';
import CoinLogo from "../assets/caspercoin-logo.svg";

function SurveyForm() {
  const { id } = useParams();
  const history = useHistory();
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState([{ text: '', answers: [{ text: '' }, { text: '' }] }]);
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState('');
  const isWalletConnected = Boolean(localStorage.getItem('active_public_key'));
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [isFormValid, setIsFormValid] = useState(false);
  const [isCurrentQuestionValidForNewAnswer, setIsCurrentQuestionValidForNewAnswer] = useState(false);
  const [areAllInputsFilled, setAreAllInputsFilled] = useState(false);
  const [reward, setReward] = useState('');
  const [numOfParticipants, setParticipants] = useState('');
  const [pminbalance, setPminBalance] = useState(10);
  const [pminstake, setPminStake] = useState(1);
  const [paccage, setPaccAge] = useState(1);
  const [pvalidator, setPValidator] = useState(1);


  useEffect(() => {
    const loadSurvey = async () => {
      if (!id) return;
      try {
        const data = await fetchSurvey(id);
        setTitle(data.title);
        setQuestions(data.questions);
        setStartDate(data.startDate);

        setEndDate(data.endDate.slice(0, 10));
      } catch (error) {
        console.error('Failed to fetch survey:', error);
      }
    };

    loadSurvey();
  }, [id]);

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
      setIsFormValid(isTitleValid && areAllQuestionsValid);
    };

    updateFormValidity();
  }, [title, questions, activeQuestionIndex]);

  useEffect(() => {
    setAreAllInputsFilled(Boolean(endDate) && Boolean(pminbalance) && Boolean(pminstake) && Boolean(paccage) && Boolean(pvalidator));
  }, [areAllInputsFilled, endDate, pminbalance, pminstake, paccage, pvalidator]);



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

  const updateExistingSurvey = async () => {
    try {
      await updateSurvey(id, { title, questions, startDate, endDate, reward, numOfParticipants });
      history.push('/surveys');
    } catch (error) {
      console.error('Failed to update survey:', error);
    }
  };

  const createNewSurvey = async () => {
    try {
      
      const survey = {
        title,
        questions,
        startDate,
        endDate,
        creationFee: reward,
        rewardPerResponse: numOfParticipants,
      };
      await createSurvey(survey);
      history.push('/surveys');
    } catch (error) {
      console.error('Failed to create survey:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isWalletConnected) {
      history.push('/');
    }

    if (!id) {
      createNewSurvey();
    } else {
      updateExistingSurvey();
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

  const removeQuestion = (questionIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions.splice(questionIndex, 1);
    setQuestions(updatedQuestions);

    if (activeQuestionIndex === questionIndex) {
      setActiveQuestionIndex(questionIndex > 0 ? questionIndex - 1 : 0);
    }
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

  // minimum balance
  // minimum stake
  // account age
  // validator status

  // reward
  // number of participants

  return (
    <div className="grid grid-flow-col bg-gray-800 h-auto w-screen">
      <NavigationBar />
      <div className='col-span-12'>
        <div className='flex flex-col w-full items-center justify-center'>
          <div className='mt-7 w-3/4 flex h-32 flex-col text-white'>
            <div className='w-2/4 '>
              <h1 className=" text-3xl font-bold  text-white   text-left">
                {id ? 'Edit Survey' : 'Create Survey'}
              </h1>
              <p className='text-gray-300 text-sm mt-2' >You can create surveys where the organizers will distribute rewards to participants using <a href="https://cspr.live/" target="_blank" rel="noopener noreferrer"> <span className='text-emerald-500'>Casper</span> </a> Blockchain Technology.</p>            </div>
          </div>
          <div className="w-3/4 ">
            <div className="w-4/6">
              <div className="flex justify-center mt-3 h-full">
                <div className="text-white justify-center  w-full p-1">
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
                    <hr className='border-gray-400 mt-6 h-3 w-full '></hr>
                    {questions.map((question, questionIndex) => (
                      questionIndex === activeQuestionIndex && (
                        <div key={questionIndex} className=" relative ">
                          <div className="flex flex-col ">
                            <div className=' flex justify-between items-center '>
                              <div>
                                <label htmlFor={`question-${questionIndex}`} className="font-medium">
                                  Question {questionIndex + 1}
                                </label>
                              </div>
                              <div className="flex space-x-2">
                                {activeQuestionIndex > 0 && (
                                  <button
                                    onClick={goToPreviousQuestion}
                                    className="w-6 h-6 rounded bg-emerald-500 text-white items-center"
                                  >
                                    {"<"}
                                  </button>
                                )}
                                {questions.length > 0 && activeQuestionIndex !== questions.length - 1 && (
                                  <button
                                    onClick={goToNextQuestion}
                                    className="w-6 h-6 rounded bg-emerald-500 text-white items-center"
                                  >
                                    {">"}
                                  </button>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center">
                              <input
                                type="text"
                                id={`question-${questionIndex}`}
                                value={question.text}
                                onChange={(e) => handleQuestionChange(questionIndex, e.target.value)}
                                className="p-2 h-8 bg-gray-700 rounded mt-1 text-whit font-medium outline-none focus:outline-emerald-500 flex-grow"
                              />
                              {questionIndex > 0 && (
                                <button
                                  type="button"
                                  onClick={() => removeQuestion(questionIndex)}
                                  className="absolute right-0 top-7 ml-2 bg-gray-700 px-2 text-gray-300 rounded text-xl"
                                >
                                  x
                                </button>
                              )}
                            </div>
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
                                  className="p-2 h-8 bg-gray-600 rounded mt-1 text-whit font-medium outline-none focus:outline-emerald-500 flex-grow"
                                />
                                {answerIndex >= 2 && (
                                  <button
                                    type="button"
                                    onClick={() => removeAnswer(questionIndex, answerIndex)}
                                    className="absolute right-0 top-1 ml-2 bg-gray-600 px-2 text-gray-300 rounded text-xl"
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
                          <hr className='border-gray-400  h-3 w-full '></hr>
                        </div>
                      )))}
                    <div className="grid space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <input
                            type="number"
                            id="reward"
                            value={reward}
                            onChange={(e) => setReward(e.target.value)}
                            className="p-2 h-8 rounded w-24 text-gray-300 bg-gray-700 font-medium outline-none focus:outline-emerald-500"
                            placeholder="Reward"
                          />
                          <img
                            src={CoinLogo}
                            alt="Casper Coin Logo"
                            className="ml-2 h-5 w-5"
                          />
                          <span className="ml-2 text-gray-400">CSPR</span>
                          <input
                            type="number"
                            id="participants"
                            value={numOfParticipants}
                            onChange={(e) => setParticipants(e.target.value)}
                            className="p-2 h-8 ml-8 rounded w-20 text-gray-300 bg-gray-700 font-medium outline-none focus:outline-emerald-500 "
                            placeholder="# of "
                          />
                          <span className="ml-2 text-gray-400">People</span>
                        </div>
                        <div className="flex items-center justify-end">
                          <input
                            type="date"
                            id="endDate"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="p-2 h-8 rounded text-gray-300 bg-gray-700 font-medium outline-none focus:outline-emerald-500"
                          />
                        </div>
                      </div>
                      <div className="flex justify-between items-end">
                        <div className="flex items-center space-x-5 ">
                          <div className='flex flex-col space-y-1'>
                            <span className="ml-2 text-sm text-gray-400">Min. Balance</span>
                            <input
                              type="number"
                              id="minbalance"
                              value={pminbalance}
                              onChange={(e) => setPminBalance(e.target.value)}
                              className="p-2 h-8 rounded w-24 text-gray-300 bg-gray-700 font-medium outline-none focus:outline-emerald-500"
                              placeholder="Balance"

                            />

                          </div>
                          <div className='flex flex-col space-y-1'>
                            <span className="ml-2 text-sm text-gray-400">Min. Stake</span>
                            <input
                              type="number"
                              id="minstake"
                              value={pminstake}
                              onChange={(e) => setPminStake(e.target.value)}
                              className="p-2 h-8 rounded w-20 text-gray-300 bg-gray-700 font-medium outline-none focus:outline-emerald-500"
                              placeholder="Stake"
                            />

                          </div>
                          <div className='flex flex-col space-y-1'>
                            <span className="ml-2 text-sm text-gray-400">Account Age</span>
                            <input
                              type="number"
                              id="age"
                              value={paccage}
                              onChange={(e) => setPaccAge(e.target.value)}
                              className="p-2 h-8 rounded w-24 text-gray-300 bg-gray-700 font-medium outline-none focus:outline-emerald-500"
                              placeholder="Age" // in weeks
                            />

                          </div>
                          <div className='flex flex-col space-y-1'>
                            <span className="ml-2text-sm text-gray-400">Validator Count</span>
                            <input
                              type="number"
                              id="validator"
                              value={pvalidator}
                              onChange={(e) => setPValidator(e.target.value)}
                              className="p-2 h-8 rounded w-28 text-gray-300 bg-gray-700 font-medium outline-none focus:outline-emerald-500"
                              placeholder="Validator" //??
                            />
                          </div>
                        </div>
                        <div className='items-center'>
                          <button
                            type="submit"
                            className={`bg-emerald-500 h-8 px-3 place-items-center rounded flex items-center font-semibold text-white ${(!isFormValid || !areAllInputsFilled) &&
                              "opacity-50 cursor-not-allowed"
                              }`}
                            disabled={!isFormValid || !areAllInputsFilled}
                          >
                            {id ? "Update" : "Create"}
                          </button>
                        </div>
                      </div>
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