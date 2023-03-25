import React, { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import { createSurvey } from "../api";
import Logo from "../assets/images/casper-logo.svg";
import { Link } from "react-router-dom";
function SurveyForm() {
  const { id } = useParams();
  const history = useHistory();
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState([
    { text: "", answers: [{ text: "" }] },
  ]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

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

    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (!token || !userId) {
      console.error("Please log in again.");
      return;
    }

    if (!id) {
      try {
        await createSurvey(
          { title, questions, startDate, endDate, createdBy: userId },
          token
        );
        history.push("/surveys");
      } catch (error) {
        console.error("Failed to create survey:", error);
      }
    } else {
      const url = `/api/surveys/${id}`;
      const method = "PUT";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, questions, startDate, endDate }),
      });

      if (response.ok) {
        history.push("/surveys");
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
    setQuestions([...questions, { text: "", answers: [""] }]);
  };

  const addAnswer = (questionIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].answers.push({ text: "" });
    setQuestions(updatedQuestions);
  };

  return (
    <div className="bg-gray-700  h-full min-h-screen w-screen text-white flex items-center flex flex-col  justify-center ">
   <Link to="/">
        <img src={Logo} alt="logo" width="72px" />
      </Link>

      <h2 className="text-2xl font-semibold mt-4">
        {id ? "Edit Survey" : "Create Survey"}
      </h2>
      <form onSubmit={handleSubmit} className="w-72">
        <div className="flex flex-col items-start mt-3">
          <label htmlFor="title" className="font-medium">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            placeholder="Title"
            className="p-2 w-full h-11 rounded-lg rounded-lg mt-1 text-black font-medium outline-none"
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {questions.map((question, questionIndex) => (
          <div key={questionIndex}>
            <div className="flex flex-col items-start my-3">
              <label
                htmlFor={`question-${questionIndex}`}
                className="font-medium"
              >
                Question {questionIndex + 1}
              </label>
              <input
                type="text"
                id={`question-${questionIndex}`}
                value={question.text}
                placeholder={`Question ${questionIndex + 1}`}
                className="p-2 w-full h-11 rounded-lg rounded-lg mt-1 text-black font-medium outline-none"
                onChange={(e) =>
                  handleQuestionChange(questionIndex, e.target.value)
                }
              />
            </div>

            {question.answers.map((answer, answerIndex) => (
              <div key={answerIndex} className="flex flex-col items-start mt-3">
                <label
                  htmlFor={`question-${questionIndex}-answer-${answerIndex}`}
                  className="font-medium"
                >
                  Answer {answerIndex + 1}
                </label>
                <input
                  type="text"
                  id={`question-${questionIndex}-answer-${answerIndex}`}
                  value={answer.text}
                  placeholder={`Answer ${answerIndex + 1}`}
                  className="p-2 h-11 w-full rounded-lg rounded-lg mt-1 text-black font-medium outline-none"
                  onChange={(e) =>
                    handleAnswerChange(
                      questionIndex,
                      answerIndex,
                      e.target.value
                    )
                  }
                />
              </div>
            ))}
            <button
              className="mt-4  bg-red-500  px-6 py-3 rounded-lg font-medium w-full"
              type="button"
              onClick={() => addAnswer(questionIndex)}
            >
              Add Answer
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addQuestion}
          className="w-full mt-4  bg-red-500 font-semibold  border-red-500 px-6 py-3 rounded-lg font-medium"
        >
          Add Question
        </button>
        <div className="mt-4">
        <label htmlFor="startDate" className="font-medium">
          Start Date
        </label>
        <input
          type="date"
          id="startDate"
          value={startDate}
          className="p-2 h-11 w-full rounded-lg rounded-lg mt-1 text-black font-medium outline-none"
          onChange={(e) => setStartDate(e.target.value)}
        />
        </div>

        <div className="mt-4">
        <label htmlFor="endDate" className="font-medium">
          End Date
        </label>
        <input
          type="date"
          id="endDate"
          value={endDate}
          className="p-2 h-11 w-full rounded-lg rounded-lg mt-1 text-black font-medium outline-none"
          onChange={(e) => setEndDate(e.target.value)}
        />
        </div>
        
       
        <br />
        <button           className="w-full   bg-green-500 font-semibold  border-red-500 px-6 py-3 rounded-lg font-medium"
 type="submit">{id ? "Update" : "Create"}</button>
      </form>
    </div>
  );
}

export default SurveyForm;
