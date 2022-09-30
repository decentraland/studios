import React from 'react'
import styles from './Icon.module.css'

interface Props {
  url: string
  icon: React.ReactNode
}

function Icon({ url, icon }: Props) {
  return (
    <a href={url} className={styles.Icon}>
      {icon}
    </a>
  )
}

export default Icon
