import React from 'react'
import CalculatorSelector from './components/CalculatorSelector/CalculatorSelector'

export const metadata = {
    title: "Hexa Calculator | mason's maple matrix",
    description: "A tool for tracking progress for 6th Job.",
};

const page = () => {
    return (
        <>
            <CalculatorSelector />
        </>
    )
}

export default page