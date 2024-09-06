import React from 'react'
import ClassSelector from './components/ClassSelector/ClassSelector'

export const metadata = {
    title: "Hexa Calculator | mason's maple matrix",
    description: "A tool for tracking progress & optimizing (soon) 6th Job.",
};

const page = () => {
    return (
        <>
            <ClassSelector />
        </>
    )
}

export default page