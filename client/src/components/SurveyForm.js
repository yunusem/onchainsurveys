import React, { useState, useEffect, useRef } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { createSurvey, fetchSurvey, updateSurvey } from '../api';
import NavigationBar from './NavigationBar';
import CoinLogo from "../assets/caspercoin-logo.svg";


function SurveyForm() {
  const { id } = useParams();
  const history = useHistory();
  const isWalletConnected = Boolean(localStorage.getItem('active_public_key'));
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [isFormValid, setIsFormValid] = useState(false);
  const [isCurrentQuestionValidForNewAnswer, setIsCurrentQuestionValidForNewAnswer] = useState(false);
  const [areAllInputsFilled, setAreAllInputsFilled] = useState(false);
  const [timer, setTimer] = useState(null);
  const [showSummary, setShowSummary] = useState(false);



  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState([{ text: '', answers: [{ text: '' }, { text: '' }] }]);
  const [startDate, setStartDate] = useState(formatDateToDateTimeLocal(new Date()));
  const [endDate, setEndDate] = useState('');
  const [reward, setReward] = useState(0);
  const [plimit, setPlimit] = useState(0);
  const [pminbalance, setPminBalance] = useState(10);
  const [pminstake, setPminStake] = useState(500);
  const [paccage, setPaccAge] = useState(1);
  const [pvalidator, setPValidator] = useState(false);


  function removeItems() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('active_public_key');
    localStorage.removeItem('user_already_signed');
    localStorage.removeItem('x_casper_provided_signature');
    localStorage.removeItem('user_is_activated');
  }

  function formatDateToDateTimeLocal(date) {
    const pad = (num) => num.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  useEffect(() => {
    const loadSurvey = async () => {
      if (!id) {
        setTitle('');
        setQuestions([{ text: '', answers: [{ text: '' }, { text: '' }] }]);
        setStartDate(formatDateToDateTimeLocal(new Date()));
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
        setEndDate(new Date(data.endDate).toISOString().slice(0, 16));
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
    (reward && reward < 1) && setReward(1);
    (plimit && plimit < 1) && setPlimit(1);
    (pminbalance && pminbalance < 1) && setPminBalance(1);
    (pminstake && pminstake < 500) && setPminStake(500);
    (paccage && paccage < 1) && setPaccAge(1);

    setAreAllInputsFilled(Boolean(reward) && Boolean(plimit) && Boolean(endDate) && Boolean(pminbalance) && Boolean(pminstake) && Boolean(paccage));
  }, [endDate, reward, plimit, pminbalance, pminstake, paccage, pvalidator]);

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
  const titleRef = useRef(null);
  const questionRef = useRef(null);
  const answerRefs = useRef([]);
  const endDateRef = useRef(null);
  const rewardRef = useRef(null);
  const plimitRef = useRef(null);


  const focusFirstEmptyInput = () => {
    if (document.activeElement === document.body) {
      const emptyInputs = [
        title ? null : titleRef,
        questions[activeQuestionIndex].text ? null : questionRef,
      ];

      questions[activeQuestionIndex].answers.forEach((answer, index) => {
        if (answer.text === '') {
          emptyInputs.push({ current: answerRefs.current[`question-${activeQuestionIndex}-answer-${index}`] });
        }
      });

      emptyInputs.push(
        reward ? null : rewardRef,
        plimit ? null : plimitRef,
        endDate ? null : endDateRef
      );

      for (const inputRef of emptyInputs) {
        if (inputRef && inputRef.current) {
          inputRef.current.focus();
          break;
        }
      }
    }
  };

  const handleInput = () => {
    if (timer) {
      clearTimeout(timer);
      setTimer(null);
    }
  };

  const handleBlur = () => {
    const newTimer = setTimeout(() => {
      focusFirstEmptyInput();
    }, 5000); // 5 seconds
    timer && clearTimeout(timer);
    setTimer(newTimer);
  };

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

  const forwardReceipt = async (e) => {
    e.preventDefault();

    setShowSummary(true);
  };

  const handleEndDateChange = (date) => {
    const selectedDate = new Date(date);
    const now = new Date();
    const minEndDate = new Date(now.getTime() + 12 * 60 * 60 * 1000);
    if (selectedDate.getTime() < minEndDate.getTime()) {
      setEndDate(formatDateToDateTimeLocal(minEndDate));
    } else {
      setEndDate(date);
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
    setQuestions([...questions, { text: '', answers: [{ text: '' }, { text: '' }] }]);
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
  const renderPreview = () => {
    return questions.map((question, index) => (
      <div key={index} className="rounded w-full">
        <p className="font-semibold break-word text-slate-200">
          {question.text}
        </p>
        <div className="mt-2  text-slate-300">
          {question.answers.map((answer) => (
            (answer.text !== undefined && answer.text !== '') && (
              <div
                key={answer._id || `answer-${new Date().getTime()}-${Math.random()}`}
                className="relative  mb-3 rounded flex justify-between items-center bg-slate-600"
              >
                <div className="relative w-full flex justify-between items-center">
                  <div className="p-2 break-word text-sm text-slate-300">
                    {answer.text !== '' && answer.text}
                  </div>
                </div>
              </div>)
          ))}
        </div>
      </div>
    ));
  };

  return (
    <div className="select-none flex bg-slate-800 h-screen w-full text-white">
      <div className="h-full w-full overflow-y-auto">
        <div className="mt-24 flex flex-col w-full items-center justify-start ">
          <div className="w-3/4 flex flex-col text-white ">
            <div className="w-1/3">
              <h1 className="text-3xl font-bold text-white text-left">
                {id ? 'Edit Survey' : 'Create Survey'}
              </h1>
              <p className='text-slate-300 text-sm mt-2'>
                You can create surveys where the organizers will distribute rewards to participants using
                {" "}
                <a href="https://cspr.live/" target="_blank" rel="noopener noreferrer">
                  <span className='text-red-500'>Casper</span>
                </a> Blockchain Technology.
              </p>
            </div>
          </div>
          <div className="mt-7 flex w-3/4 h-max-[720px]">
            <div className="min-w-[50%] pr-3 ">
              <div className="flex justify-center h-full ">
                <div className="text-white justify-center w-full">
                  <form onSubmit={forwardReceipt} className={`w-full transition-all ease-in-out duration-300 ${showSummary === true ? "opacity-20 pointer-events-none" : ""}`}>

                    <div className="flex justify-between items-center">
                      <div >
                        <label htmlFor="title" className="font-medium">
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
                        className="p-2 h-10 rounded  mt-1 w-full text-white bg-slate-700 font-medium transition-all duration-200 ease-in-out  outline-none focus:outline-red-500 focus:scale-105 "
                        placeholder='A relevant title of the survey'
                        onInput={handleInput}
                        onBlur={handleBlur}
                        ref={titleRef}
                      />
                    </div>
                    <hr className='border-slate-500 mt-4 h-3 w-full '></hr>
                    {questions.map((question, questionIndex) => (
                      questionIndex === activeQuestionIndex && (
                        <div key={questionIndex} className=" relative ">
                          <div className="flex flex-col  ">
                            <div className='flex items-center space-x-3 mb-2'>
                              <div >
                                <label htmlFor={`question-${questionIndex}`} className="font-medium flex w-28">
                                  Question {questionIndex + 1}
                                </label>
                              </div>
                              <div className="flex space-x-2">
                                {activeQuestionIndex > 0 && (
                                  <button
                                    onClick={goToPreviousQuestion}
                                    className="w-6 h-6 flex rounded   bg-red-500 text-white items-start justify-center"
                                  >
                                    <div className="flex h-4 items-center justify-center mt-[3px] font-semibold">{`<`}</div>
                                  </button>
                                )}
                                {questions.length > 0 && activeQuestionIndex !== questions.length - 1 && (
                                  <button
                                    onClick={goToNextQuestion}
                                    className="w-6 h-6 flex rounded   bg-red-500 text-white items-start justify-center"
                                  >
                                    <div className="flex h-4 items-center justify-center mt-[3px] font-semibold">{`>`}</div>
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
                                className="p-2 h-10 bg-slate-700 rounded   mb-3 text-white font-medium flex flex-grow transition-all duration-200 ease-in-out  outline-none focus:outline-red-500 focus:scale-105 "
                                placeholder='Which one is your favorite?'
                                onInput={handleInput}
                                onBlur={handleBlur}
                                ref={questionRef}
                              />
                              {questionIndex > 0 && (
                                <button
                                  type="button"
                                  onClick={() => removeQuestion(questionIndex)}
                                  className="absolute right-0 top-9 ml-2 bg-slate-700 px-2 text-slate-300 rounded text-xl"
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
                                  className="p-2 h-8 bg-slate-600 rounded   mt-1 text-slate-200 font-normal flex flex-grow transition-all duration-200 ease-in-out  outline-none focus:outline-red-500 focus:scale-105 "
                                  onInput={handleInput}
                                  onBlur={handleBlur}
                                  ref={(el) => (answerRefs.current[`question-${questionIndex}-answer-${answerIndex}`] = el)}
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
                          <div className="flex items-center mt-2 h-8">
                            <button
                              type="button"
                              onClick={() => addAnswer(questionIndex)}
                              className={`bg-red-500 h-8 rounded   font-semibold whitespace-nowrap text-white mr-2 px-3 ${!isCurrentQuestionValidForNewAnswer && 'opacity-30 cursor-not-allowed'}`}
                              disabled={!isCurrentQuestionValidForNewAnswer}
                            >
                              Add Answer
                            </button>
                            <div className='flex items-center justify-center ml-1 mr-1 h-8 w-10 text-slate-400 cursor-not-allowed'>
                              or
                            </div>
                            <button
                              className={`text-red-500  h-8 whitespace-nowrap ${!isFormValid && 'opacity-30 cursor-not-allowed'}`}
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
                            className={`p-2 h-8 rounded   w-24 text-slate-300 bg-slate-700 font-medium transition-all duration-200 ease-in-out  outline-none focus:outline-red-500 ${id && "cursor-not-allowed"}`}
                            placeholder="Reward"
                            disabled={Boolean(id)}
                            onInput={handleInput}
                            onBlur={handleBlur}
                            ref={rewardRef}
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
                            className={`p-2 h-8 ml-2 rounded  w-20 text-slate-300 bg-slate-700 font-medium transition-all duration-200 ease-in-out  outline-none focus:outline-red-500 ${id && "cursor-not-allowed"}`}
                            placeholder="# of "
                            disabled={Boolean(id)}
                            onInput={handleInput}
                            onBlur={handleBlur}
                            ref={plimitRef}
                          />
                          <span className="ml-2 text-slate-400">People</span>
                        </div>
                        <div className="flex items-center justify-end">
                          <input
                            type="datetime-local"
                            id="endDate"
                            value={endDate}
                            min={formatDateToDateTimeLocal(new Date())}
                            onChange={(e) => handleEndDateChange(e.target.value)}
                            className={`py-2 px-1 right-2 h-8 w-40 rounded  text-slate-300 bg-slate-700 font-normal text-sm transition-all duration-200 ease-in-out  outline-none focus:outline-red-500`}
                            onInput={handleInput}
                            onBlur={handleBlur}
                            ref={endDateRef}
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
                              className={`p-2 h-8 rounded  w-24 text-slate-300 bg-slate-700 text-sm transition-all duration-200 ease-in-out outline-none focus:outline-red-500`}
                              placeholder="Balance"
                              onBlur={handleBlur}
                            />

                          </div>
                          <div className='flex flex-col space-y-1'>
                            <span className="ml-1 text-sm text-slate-400">Min. Stake</span>
                            <input
                              type="number"
                              id="minstake"
                              value={pminstake}
                              onChange={(e) => setPminStake(e.target.value)}
                              className={`p-2 h-8 rounded  w-20 text-slate-300 bg-slate-700 text-sm transition-all duration-200 ease-in-out  outline-none focus:outline-red-500`}
                              placeholder="Stake"
                              onBlur={handleBlur}
                            />

                          </div>
                          <div className='flex flex-col space-y-1'>
                            <span className="ml-1 text-sm text-slate-400">Account Age</span>
                            <input
                              type="number"
                              id="age"
                              value={paccage}
                              onChange={(e) => setPaccAge(e.target.value)}
                              className={`p-2 h-8 rounded  w-24 text-slate-300 bg-slate-700 text-sm transition-all duration-200 ease-in-out  outline-none focus:outline-red-500`}
                              placeholder="Age" // in days
                              onBlur={handleBlur}
                            />

                          </div>
                          <div className='flex flex-col space-y-1'>
                            <span className="ml-1 text-sm text-slate-400">Validator Status</span>
                            <select
                              id="validator"
                              value={pvalidator}
                              onChange={(e) => setPValidator(e.target.value)}
                              className={`px-1 h-8 rounded  w-20 text-slate-300 bg-slate-700 text-sm transition-all duration-200 ease-in-out outline-none focus:outline-red-500`}
                              onBlur={handleBlur}
                            >
                              <option value="true">True</option>
                              <option value="false">False</option>
                            </select>
                          </div>
                        </div>
                        <div className='items-center'>
                          <button
                            type="submit"
                            className={`bg-red-500 h-8 px-3 place-items-center rounded  flex items-center font-semibold text-white transition-all duration-300 ease-in-out ${showSummary === true ? "opacity-0" : ""}  ${(!isFormValid || !areAllInputsFilled) &&
                              "opacity-30 cursor-not-allowed"
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
            <div className="ml-8 relative flex w-[90%] max-w-[90%]">
              <div className={`absolute w-full transition-all ease-in-out duration-300 opacity-50  ${showSummary === true ? "blur-lg " : ""}`}>
                <div className="flex justify-between break-word">
                  <h3 className={` text-xl font-medium text-red-500 `}>
                    {title}
                  </h3>
                </div>
                {renderPreview()}
              </div>
              <div className={`absolute px-6 left-36 top-3 transition-all ease-in-out duration-300 w-72 space-y-4 ${showSummary === true ? "opacity-100" : "opacity-0 pointer-events-none "}`}  >
                <div className=" ring-2 ring-slate-600 rounded p-4 ">
                  <div className=" space-y-6 ">
                    <ul className="space-y-5 text-sm text-slate-500">
                      <div className="flex items-start justify-between ">
                        <div className="flex flex-col">
                          <div className="text-white">Storage</div>
                          <p className='text-xs '> Fee x Per question</p>
                        </div>
                        <div>
                          <div className="font-medium text-white text-end">{questions.length * 10}</div>
                          <p className='text-xs text-end'> CSPR</p>
                        </div>
                      </div>
                      <div className="flex items-start justify-between ">
                        <div className="flex flex-col">
                          <div className="text-white">Transfer</div>
                          <p className='text-xs'> (Gas + Reward) x Per person</p>
                        </div>
                        <div>
                          <div className="font-medium text-white text-end">{plimit * (3.5 + Number(reward))}</div>
                          <p className='text-xs text-end'> CSPR</p>
                        </div>
                      </div>
                      <div className="flex items-start justify-between">
                        <div className="flex flex-col">
                          <div className="text-white">Publication</div>
                          <p className='text-xs'> The Cost of Deployment</p>
                        </div>
                        <div>
                          <div className="font-medium text-white text-end">{5}</div>
                          <p className='text-xs text-end'> CSPR</p>
                        </div>
                      </div>
                      <div className="flex items-start justify-between ">
                        <div className="flex flex-col">
                          <div className="text-white">Service</div>
                          <p className='text-xs'> The Cost of Our Services</p>
                        </div>
                        <div>
                          <div className="font-medium text-white text-end">{5}</div>
                          <p className='text-xs text-end'> CSPR</p>
                        </div>
                      </div>
                    </ul>
                    <hr className='border-slate-500'></hr>
                    <div className="flex items-start justify-between">
                      <div className="flex flex-col ">
                        <div className="text-white font-bold">Total</div>
                      </div>
                      <div>
                        <div className="font-bold text-white text-end">{5 + 5 + (questions.length * 10) + (plimit * (3.5 + Number(reward)))}</div>
                        <p className='text-xs text-slate-500 text-end'> CSPR</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 justify-between  ">
                  <div className='group rounded w-16 '>
                    <button onClick={() => setShowSummary(false)}>
                      <svg
                        className="w-full h-full p-2 transition-all ease-in-out duration-300 text-slate-500 group-hover:text-white group-hover:scale-[1.4]"
                        viewBox="0 0 256 256"
                        fill="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2">
                        <rect
                          x="36.21"
                          y="99.07"
                          width="187.7"
                          height="76.1"
                          rx="8.78"
                          ry="8.78"
                          transform="translate(-58.87 132.13) rotate(-45)"
                        />
                        <rect
                          x="198.82"
                          y="11.64"
                          width="37.35"
                          height="76.1"
                          rx="8.78"
                          ry="8.78"
                          transform="translate(28.56 168.35) rotate(-45)"
                        />
                        <path
                          d="M59.79,207.41l24,24c2.24,2.24,1.22,6.07-1.85,6.89l-32.78,8.78-32.78,8.78c-3.06,.82-5.86-1.98-5.04-5.04l8.78-32.78,8.78-32.78c.82-3.06,4.65-4.09,6.89-1.85l24,24Z"
                        />
                      </svg>
                    </button>
                  </div>
                  <button
                    onClick={handleSubmit}
                    type="submit"
                    className="w-full rounded-md border border-transparent bg-slate-700 px-4 py-3 text-base font-medium text-white shadow-sm transition-all ease-in-out duration-300 hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-50"
                  >
                    Checkout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <NavigationBar />
    </div>
  );
}

export default SurveyForm;