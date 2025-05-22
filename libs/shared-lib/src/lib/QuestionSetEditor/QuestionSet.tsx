import React from 'react';
import dynamic from 'next/dynamic';

const QuestionSetEditor = dynamic(() => import('@collection'), {
  ssr: false,
});

export const QuestionSet = () => {
  return <QuestionSetEditor />;
};

export default QuestionSet;
