import React from 'react'
import styles from './BackButton.module.css'
import ArrowRight from '../Icons/ArrowRight'

interface Props {
  url: string
  icon: React.ReactNode
}

function BackButton() {
  return (
    <a href="../" className={styles.arrowright} rel="noreferrer">
      <ArrowRight />
    </a>
  )
}

export default BackButton
