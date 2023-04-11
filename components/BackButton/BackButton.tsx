import React from 'react'
import styles from './BackButton.module.css'
import ArrowRight from '../Icons/ArrowRight'
import { useRouter } from 'next/router'

function BackButton({ ...otherProps }) {
  const router = useRouter()

  const onClickHandler = () => {
    let navHist = JSON.parse(globalThis.sessionStorage.navHist || '[]')

    if(navHist.length > 1){ 
      navHist.pop()
      globalThis.sessionStorage.setItem('navHist', JSON.stringify(navHist));

      router.back()
    } else {
      router.push('/')
    }
  }
  
  return (
    <div onClick={onClickHandler} className={styles.arrowright} {...otherProps}>
      <ArrowRight />
    </div>
  )
}

export default BackButton
