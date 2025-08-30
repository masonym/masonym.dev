import React, { useEffect, useState } from 'react'
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
