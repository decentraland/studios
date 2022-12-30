import React from 'react'
import styles from './BackButton.module.css'
import ArrowRight from '../Icons/ArrowRight'
import Link from 'next/link'

interface Props {
  url: string
}

function BackButton({ url }: Props) {
  return (
    <Link href={url} className={styles.arrowright} rel="noreferrer">
      <ArrowRight />
    </Link>
  )
}

export default BackButton
