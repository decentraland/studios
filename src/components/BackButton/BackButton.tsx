import React from 'react'
import styles from './BackButton.module.css'
import ArrowRight from '../Icons/ArrowRight'

interface Props {
  url: string
}

function BackButton({ url }: Props) {
  return (
    <a href={url} className={styles.arrowright} rel="noreferrer">
      <ArrowRight />
    </a>
  )
}

export default BackButton
