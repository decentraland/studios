import React from 'react'
import styles from './BackButton.module.css'
import ArrowRight from '../Icons/ArrowRight'
import { useRouter } from 'next/router'

interface Props extends React.HTMLAttributes<HTMLOrSVGElement> {
  small?: boolean
}

function BackButton({ small, ...otherProps }: Props) {
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
  
  let classNames = [styles.arrowRight]
  if (small) classNames.push(styles['arrowRight--small'])

  return (
    <div onClick={onClickHandler} className={classNames.join(' ')} {...otherProps}>
      <ArrowRight />
    </div>
  )
}

export default BackButton
