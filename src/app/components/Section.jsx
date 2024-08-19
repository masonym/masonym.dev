import React from 'react'
import styles from './Section.module.css'

const Section = ({title, children}) => {
  return (
    <div className={styles.section}>
        <h4>{title}</h4>
        {children}
    </div>
  )
}

export default Section