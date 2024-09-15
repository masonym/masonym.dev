import React, { useEffect, useState } from 'react'
import Optimizer from './Optimizer'
import CostCalc from './CostCalc'

const CalcRoute = ({ selectedClass, classDetails, skillLevels }) => {
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    const savedCalculator = localStorage.getItem(`selectedCalculator_${selectedClass}`)
    if (savedCalculator) {
      setSelected(savedCalculator)
    }
  }, [])

  const handleSelectCalculator = (calculator) => {
    setSelected(calculator)
    localStorage.setItem(`selectedCalculator_${selectedClass}`, calculator)
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <h3 className="mt-4 text-[20px] text-center">Select the calculator you'd like to use:</h3>
      <div className="flex flex-col md:flex-row flexBetween max-container mt-2 gap-4 text-nowrap">
        <button
          className="flex-1 text-[24px] text-primary bg-primary-dark border-primary-dim border-[1px] hover:bg-primary-dim transition-all duration-300 rounded-lg px-8 py-4"
          onClick={() => { handleSelectCalculator('costCalc') }}>
          Cost Calculator
        </button>
        <button className="flex-1 text-[24px] text-primary bg-primary-dark border-primary-dim border-[1px] hover:bg-primary-dim transition-all duration-300 rounded-lg px-8 py-4"
          onClick={() => { handleSelectCalculator('optimizer') }}>
          Level Priority
        </button>
      </div>
      <div className="flex flex-col mb-4">
        {selected === 'costCalc' && (
          <CostCalc
            selectedClass={selectedClass}
            classDetails={classDetails}
            skillLevels={skillLevels}
          />
        )}
        {selected === 'optimizer' && (
          <Optimizer
            selectedClass={selectedClass}
            classDetails={classDetails}
            skillLevels={skillLevels}
          />
        )}
      </div>
    </div>
  )
}

export default CalcRoute