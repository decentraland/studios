import React from 'react'
import styles from './BannerHeader.module.css'

function BackButton() {
  return (
    <div className={styles.container}>
      <div className={styles.leftPanel}>
        <div className={styles.mainText}>Your brand belongs in the Metaverse. Let’s get you a team to build with.</div>
        <div className={styles.factsContainer}>
          <div className={styles.factContainer}>
            <div className={styles.bigText}>180+</div>
            <div className={styles.smallText}>VERFIED STUDIOS</div>
          </div>
          <div className={styles.factContainer}>
            <div className={styles.bigText}>200+</div>
            <div className={styles.smallText}>PROJECTS COMPLETED</div>
          </div>
        </div>
      </div>
      <img alt='Let’s get you a team to build with' className={styles.image} src="/images/computer.webp"></img>
    </div>
  )
}

export default BackButton
