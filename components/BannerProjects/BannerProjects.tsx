import React from 'react'
import styles from './BannerProjects.module.css'
import Link from 'next/link'

function BannerProjects() {
  return (
    <div className={styles.container}>
      <div className={styles.leftPanel}>
        <div className={styles.mainText}>Browse the best projects on Decentraland and get new ideas for your brand.</div>
        <div className={styles.smallText}><Link href={"/jobs/hire"} >Start your project</Link> with our verified studios and bring your brand to Decentraland.</div>
      </div>
      <img alt='Browse the latest projects on Decentraland and get new ideas for your brand' className={styles.image} src="/images/banner_projects.webp"></img>
    </div>
  )
}

export default BannerProjects