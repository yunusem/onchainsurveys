import React, { useState } from 'react';

function SurveyQuestion({ question, onChange }) {
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState(null);

  const handleInputChange = (e, index) => {
    setSelectedAnswerIndex(index);
    onChange(e.target.value);
  };

  return (
    <div className="flex flex-col space-y-4">
      <h1 className="text-xl font-bold break-word">{question.text}</h1>
      {question.answers.map((answer, index) => (
        <div className='flex  items-center break-word'>
          <label
          htmlFor={`answer-${question._id}-${index}`}
          key={`answer-${index}`}
          className={`flex rounded  items-center w-full cursor-pointer ${selectedAnswerIndex === index ? 'bg-red-400' : 'bg-slate-800'}`}
        >
          <input
            type="radio"
            id={`answer-${question._id}-${index}`}
            name={`question-${question._id}`}
            value={answer.text}
            className="hidden"
            onChange={(e) => handleInputChange(e, index)}
          />
          <div className={`m-2 ${selectedAnswerIndex === index ? 'text-slate-900 font-medium' : 'text-slate-300' }`}>
            {answer.text}
          </div>
        </label>
        </div>
      ))}
    </div>
  );
}

export default SurveyQuestion;
