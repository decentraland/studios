import React from 'react'
import styles from './BannerJobs.module.css'

function BannerJobs() {
  return (
    <div className={styles.container}>
      <div className={styles.leftPanel}>
        <div className={styles.mainText}>Creative freelance projects in Decentraland</div>
        <div className={styles.smallText}>The project board is an exclusive resource for contract work. It’s perfect for agencies, and brands looking to take their first steps into Decentraland.</div>
      </div>
      <img alt='Creative freelance jobs in Decentraland' className={styles.image} src="/images/banner_jobs.webp"></img>
    </div>
  )
}

export default BannerJobs