import { Container } from 'postcss'
import React, { useState } from 'react'
import Optimizer from './Optimizer'
import CostCalc from './CostCalc'
import { InputGrid } from '../InputGrid/InputGrid'
// import styles from './CalcRoute.module.css'

const CalcRoute = ({ selectedClass, classDetails, skillLevels }) => {
  const [selected, setSelected] = useState(null)
  return (
    <div className="flex flex-col items-center gap-4">

      <h3 className="mt-4 text-[20px]">Select the calculator you'd like to use:</h3>
      <div className="flex flex-row flexBetween max-container mt-2 gap-4">

        <button className="text-primary-dark bg-primary rounded-lg px-8 py-4" onClick={() => { setSelected('costCalc') }}>Cost Calculator</button>
        <button className="text-primary-dark bg-primary rounded-lg px-8 py-4" onClick={() => { setSelected('optimizer') }}>Optimizer</button>

      </div>
      <div className="flex flex-col mb-4">
        {
          (selected == 'costCalc') ?
            <CostCalc
              selectedClass={selectedClass}
              classDetails={classDetails}
              skillLevels={skillLevels}
            >

            </CostCalc> : null
        }
        {
          (selected == 'optimizer') ? <Optimizer /> : null
        }
      </div>


    </div>
  )
}

export default CalcRoute