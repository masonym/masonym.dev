import AdvancedItemList from "./components/AdvancedItemList";

import React from 'react'

export const metadata = {
  title: "Cash Shop Directory | mason's maple matrix",
  description: "A tool to view upcoming Cash Shop sales, as well as current & past rotations.",
};

const page = () => {
  return (
    <AdvancedItemList/>
  )
}

export default page