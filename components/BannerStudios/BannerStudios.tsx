import React from 'react'
import styles from './BannerStudios.module.css'

interface Props {
  studiosCount: number
  projectsCount: number
}

function BannerStudios({studiosCount, projectsCount}: Props) {
  
  const studiosNumber = 50 * Math.floor(studiosCount / 50)
  const projectsNumber = 50 * Math.floor(projectsCount / 50)

  return (
    <div className={styles.container}>
      <div className={styles.leftPanel}>
        <div className={styles.mainText}>Your brand belongs in the Metaverse. Let’s get you a team to build with.</div>
        <div className={styles.factsContainer}>
          <div className={styles.factContainer}>
            <div className={styles.bigText}>{studiosNumber}+</div>
            <div className={styles.smallText}>VERIFIED STUDIOS</div>
          </div>
          <div className={styles.factContainer}>
            <div className={styles.bigText}>{projectsNumber}+</div>
            <div className={styles.smallText}>PROJECTS COMPLETED</div>
          </div>
        </div>
      </div>
      <img alt='Let’s get you a team to build with' className={styles.image} src="/images/banner_studios.webp"></img>
    </div>
  )
}

export default BannerStudios
