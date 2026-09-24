import React, { useState } from 'react'
import CostCalc from './CostCalc'

const CalcRoute = ({ selectedClass, classDetails, skillLevels }) => {
  // Only ever mounted on the client (ClassSelector renders nothing until it is
  // hydrated), so the saved choice can be read straight into the initial state.
  const [selected, setSelected] = useState(
    () => localStorage.getItem(`selectedCalculator_${selectedClass}`) || null
  )

  const handleSelectCalculator = (calculator) => {
    setSelected(calculator)
    localStorage.setItem(`selectedCalculator_${selectedClass}`, calculator)
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-col mb-4">

        <CostCalc
          selectedClass={selectedClass}
          classDetails={classDetails}
          skillLevels={skillLevels}
        />
      </div>
    </div>
  )
}

export default CalcRoute
