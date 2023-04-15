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
  const [reward, setReward] = useState(0);
  const [plimit, setPlimit] = useState(0);
  const [pminbalance, setPminBalance] = useState(10);
  const [pminstake, setPminStake] = useState(1);
  const [paccage, setPaccAge] = useState(1);
  const [pvalidator, setPValidator] = useState(false);


  useEffect(() => {
    const loadSurvey = async () => {
      if (!id) {
        setTitle('');
        setQuestions([{ text: '', answers: [{ text: '' }, { text: '' }] }]);
        setStartDate(new Date().toISOString().slice(0, 10));
        setEndDate('');
        setReward('');
        setPlimit('');
        return;
      }
      else {
        const data = await fetchSurvey(id);

        setTitle(data.title);
        setQuestions(data.questions);
        setStartDate(data.startDate);
        setEndDate(new Date(data.endDate).toISOString().slice(0, 10));
        setReward(data.rewardPerResponse);
        setPlimit(data.participantsLimit);
        setPminBalance(data.minimumRequiredBalance);
        setPminStake(data.minimumRequiredStake);
        setPaccAge(data.minimumAgeInDays);
        setPValidator(Boolean(data.validatorStatus));
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
    setAreAllInputsFilled(Boolean(endDate) && Boolean(pminbalance) && Boolean(pminstake) && Boolean(paccage));
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



  const updateExistingSurvey = async () => {
    try {
      const survey = {
        title,
        questions,
        startDate,
        endDate,
        creationFee: 5,
        reward,
        plimit,
        pminbalance,
        pminstake,
        paccage,
        pvalidator
      };
      await updateSurvey(id, survey);
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
        creationFee: 5,
        reward,
        plimit,
        pminbalance,
        pminstake,
        paccage,
        pvalidator
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

  return (
    <div className="flex bg-slate-800 h-screen w-full text-white items-center justify-center">
      <div className="flex h-screen w-full">
        <NavigationBar />
        <div className="flex flex-col h-screen w-full">
          <div className='flex flex-col w-full items-center justify-center'>
            <div className=' mt-7 w-3/4 flex h-32 flex-col text-white'>
              <div className='w-2/4 '>
                <h1 className=" text-3xl font-bold  text-white   text-left">
                  {id ? 'Edit Survey' : 'Create Survey'}
                </h1>
                <p className='text-slate-300 text-sm mt-2' >You can create surveys where the organizers will distribute rewards to participants using <a href="https://cspr.live/" target="_blank" rel="noopener noreferrer"> <span className='text-red-500'>Casper</span> </a> Blockchain Technology.</p>            </div>
            </div>
            <div className="w-3/4">
              <div className="w-1/2">
                <div className="flex justify-center mt-3  h-full">
                  <div className="text-white justify-center  w-full p-1">
                    <form onSubmit={handleSubmit} className="w-full">
                      <div className="flex justify-between items-center">
                        <div >
                          <label htmlFor="title" className="font-medium bg-slate ">
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
                          className="p-2 h-8 rounded mt-1 w-full text-white bg-slate-700 font-medium outline-none focus:outline-red-500 focus:scale-105"
                          placeholder='A relevant title of the survey'
                        />
                      </div>
                      <hr className='border-slate-500 mt-4 h-3 w-full '></hr>
                      {questions.map((question, questionIndex) => (
                        questionIndex === activeQuestionIndex && (
                          <div key={questionIndex} className=" relative ">
                            <div className="flex flex-col  ">
                              <div className='flex  items-center space-x-6 mb-2'>
                                <div >
                                  <label htmlFor={`question-${questionIndex}`} className="font-medium">
                                    Question {questionIndex + 1}
                                  </label>
                                </div>
                                <div className="flex space-x-2">
                                  {activeQuestionIndex > 0 && (
                                    <button
                                      onClick={goToPreviousQuestion}
                                      className="w-6 h-6 rounded bg-red-500 text-white items-center"
                                    >
                                      {"<"}
                                    </button>
                                  )}
                                  {questions.length > 0 && activeQuestionIndex !== questions.length - 1 && (
                                    <button
                                      onClick={goToNextQuestion}
                                      className="w-6 h-6 rounded bg-red-500 text-white items-center"
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
                                  className="p-2 h-8 bg-slate-700 rounded mb-1 text-white font-medium outline-none flex-grow focus:outline-red-500 focus:scale-105 "
                                  placeholder='Which one is your favorite?'
                                />
                                {questionIndex > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => removeQuestion(questionIndex)}
                                    className="absolute right-0 top-8 ml-2 bg-slate-700 px-2 text-slate-300 rounded text-xl"
                                  >
                                    x
                                  </button>
                                )}
                              </div>
                            </div>
                            {question.answers.map((answer, answerIndex) => (
                              <div key={answerIndex} className="relative mt-1">
                                <div className="flex items-center">
                                  <input
                                    type="text"
                                    id={`question-${questionIndex}-answer-${answerIndex}`}
                                    value={answer.text}
                                    placeholder={`Option ${answerIndex + 1}`}
                                    onChange={(e) => handleAnswerChange(questionIndex, answerIndex, e.target.value)}
                                    className="p-2 h-8 bg-slate-600 rounded mt-1 text-slate-200 font-normal outline-none focus:outline-red-500 flex-grow"
                                  />
                                  {answerIndex >= 2 && (
                                    <button
                                      type="button"
                                      onClick={() => removeAnswer(questionIndex, answerIndex)}
                                      className="absolute right-0 top-1 ml-2 bg-slate-600 px-2 text-slate-300 rounded text-xl"
                                    >
                                      x
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                            <div className="flex items-center mt-4 h-8">
                              <button
                                type="button"
                                onClick={() => addAnswer(questionIndex)}
                                className={`bg-red-500 rounded font-semibold text-white mr-2 h-8 w-48 px-2 ${!isCurrentQuestionValidForNewAnswer && 'opacity-50 cursor-not-allowed'}`}
                                disabled={!isCurrentQuestionValidForNewAnswer}
                              >
                                Add Answer
                              </button>
                              <div className='flex items-center justify-center ml-1 mr-1 h-8 w-10 text-slate-400 cursor-not-allowed'>
                                or
                              </div>
                              <button
                                className={`text-red-500  h-8 w-56 ${!isFormValid && 'opacity-50 cursor-not-allowed'}`}
                                onClick={addQuestion}
                                disabled={!isFormValid}
                              >
                                Add  Question ?
                              </button>
                              <div className='grid justify-items-end content-end w-full h-8'>
                                <div className='grid h-8 w-36 justify-items-end'>

                                </div>
                              </div>
                            </div>
                            <hr className='border-slate-500  h-3 mt-3 w-full '></hr>
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
                              className={`p-2 h-8 rounded w-24 text-slate-300 bg-slate-700 font-medium outline-none focus:outline-red-500 ${id && "cursor-not-allowed"}`}
                              placeholder="Reward"
                              disabled={Boolean(id)}
                            />
                            <img
                              src={CoinLogo}
                              alt="Casper Coin Logo"
                              className="ml-2 h-5 w-5"
                            />
                            <span className="ml-2 text-slate-400">CSPR each to</span>
                            <input
                              type="number"
                              id="participants"
                              value={plimit}
                              onChange={(e) => setPlimit(e.target.value)}
                              className={`p-2 h-8 ml-2 rounded w-20 text-slate-300 bg-slate-700 font-medium outline-none focus:outline-red-500 ${id && "cursor-not-allowed"}`}
                              placeholder="# of "
                              disabled={Boolean(id)}
                            />
                            <span className="ml-2 text-slate-400">People</span>
                          </div>
                          <div className="flex items-center justify-end">
                            <input
                              type="date"
                              id="endDate"
                              value={endDate}
                              onChange={(e) => setEndDate(e.target.value)}
                              className={`p-2 h-8 rounded text-slate-300 bg-slate-700 font-medium outline-none focus:outline-red-500`}
                            />
                          </div>
                        </div>
                        <div className="flex justify-between items-end">
                          <div className="flex items-center space-x-5 ">
                            <div className='flex flex-col space-y-1'>
                              <span className="ml-1 text-sm text-slate-400">Min. Balance</span>
                              <input
                                type="number"
                                id="minbalance"
                                value={pminbalance}
                                onChange={(e) => setPminBalance(e.target.value)}
                                className={`p-2 h-8 rounded w-24 text-slate-300 bg-slate-700 text-sm outline-none focus:outline-red-500`}
                                placeholder="Balance"
                              />

                            </div>
                            <div className='flex flex-col space-y-1'>
                              <span className="ml-1 text-sm text-slate-400">Min. Stake</span>
                              <input
                                type="number"
                                id="minstake"
                                value={pminstake}
                                onChange={(e) => setPminStake(e.target.value)}
                                className={`p-2 h-8 rounded w-20 text-slate-300 bg-slate-700 text-sm outline-none focus:outline-red-500`}
                                placeholder="Stake"
                              />

                            </div>
                            <div className='flex flex-col space-y-1'>
                              <span className="ml-1 text-sm text-slate-400">Account Age</span>
                              <input
                                type="number"
                                id="age"
                                value={paccage}
                                onChange={(e) => setPaccAge(e.target.value)}
                                className={`p-2 h-8 rounded w-24 text-slate-300 bg-slate-700 text-sm outline-none focus:outline-red-500`}
                                placeholder="Age" // in days
                              />

                            </div>
                            <div className='flex flex-col space-y-1'>
                              <span className="ml-1 text-sm text-slate-400">Validator Status</span>
                              <select
                                id="validator"
                                value={pvalidator}
                                onChange={(e) => setPValidator(e.target.value)}
                                className={`px-1 h-8 rounded w-28 text-slate-300 bg-slate-700 text-sm outline-none focus:outline-red-500`}
                              >
                                <option value="true">True</option>
                                <option value="false">False</option>
                              </select>
                            </div>
                          </div>
                          <div className='items-center'>
                            <button
                              type="submit"
                              className={`bg-red-500 h-8 px-3 place-items-center rounded flex items-center font-semibold text-white ${(!isFormValid || !areAllInputsFilled) &&
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
    </div>
  );
}

export default SurveyForm;