import React from 'react'
import styles from './BackButton.module.css'
import ArrowRight from '../Icons/ArrowRight'
import { useRouter } from 'next/router'

function BackButton() {
  const router = useRouter()
  return (
    <div onClick={() => router.back()} className={styles.arrowright}>
      <ArrowRight />
    </div>
  )
}

export default BackButton
