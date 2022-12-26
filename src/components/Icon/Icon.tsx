import React from 'react'
import styles from './Icon.module.css'

interface Props {
  url: string
  icon: React.ReactNode
  onClick(event: React.MouseEvent<HTMLAnchorElement>): void
}

function Icon({ url, icon, onClick }: Props) {
  return (
    <a href={url} className={styles.icon} target="_blank" rel="noreferrer" onClick={onClick}>
      {icon}
    </a>
  )
}

export default Icon
