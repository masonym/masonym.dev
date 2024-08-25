import React from 'react';

const Section = ({ title, children }) => {
  return (
    <div className="border border-primary-dim rounded-md w-[65%] mt-8 text-left p-5">
      <h2 className="m-2 mb-6 text-xl">{title}</h2>
      {children}
    </div>
  );
};

export default Section;