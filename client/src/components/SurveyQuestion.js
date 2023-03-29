import React from 'react';

function SurveyQuestion({ question, onChange }) {
  const handleInputChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <div className="flex flex-col space-y-4">
      <h3>{question.text}</h3>
      {question.answers.map((answer, index) => (
        <div key={`answer-${index}`}>
          <input
            type="radio"
            id={`answer-${question._id}-${index}`}
            name={`question-${question._id}`}
            value={answer.text}
            onChange={handleInputChange}
          />
          <label htmlFor={`answer-${question._id}-${index}`}>{answer.text}</label>
        </div>
      ))}
    </div>
  );
}

export default SurveyQuestion;