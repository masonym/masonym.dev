import React from 'react';

const Section = ({ title, children }) => {
  return (
    <div className="border border-primary-dim rounded-md w-[65%] mt-8 text-left px-5">
      <h2>{title}</h2>
      {children}
    </div>
  );
};

export default Section;