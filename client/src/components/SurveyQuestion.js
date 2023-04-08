import React from 'react';

function SurveyQuestion({ question, onChange }) {
  const handleInputChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <div className="flex flex-col space-y-4">
      <h3>{question.text}</h3>
      {question.answers.map((answer, index) => (
        <div className="flex items-center mb-4" key={`answer-${index}`}>
          <input
            type="radio"
            id={`answer-${question._id}-${index}`}
            name={`question-${question._id}`}
            value={answer.text}
            className=" w-4 h-4 text-emerald-500 bg-gray-100 border-gray-300 focus:ring-emerald-500 focus:ring-2"
            onChange={handleInputChange}
          />
          <label for="default-radio-1" className="ml-2 text-sm font-medium text-white dark:text-gray-300" htmlFor={`answer-${question._id}-${index}`}>{answer.text}</label>
          
        </div>
      ))}
    </div>
  );
}

export default SurveyQuestion;