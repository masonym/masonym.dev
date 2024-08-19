import React from 'react'
import styles from './Section.module.css'

const Section = ({title, children}) => {
  return (
    <div className={styles.section}>
        <h2>{title}</h2>
        {children}
    </div>
  )
}

export default Section