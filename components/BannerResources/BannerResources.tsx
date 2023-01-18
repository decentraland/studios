import React from 'react'
import styles from './BannerResources.module.css'

function BannerResources() {
  return (
    <div className={styles.container}>
      <div className={styles.leftPanel}>
        <div className={styles.mainText}>Browse free and open source ideas to inspire you.</div>
        <div className={styles.smallText}>Here you will find the building blocks to create engaging and interactive experiences in Decentraland. Any creator can customize these with complete creative freedom.</div>
      </div>
      <img alt='Browse free and open source ideas to inspire you.' className={styles.image} src="/images/banner_ideas.webp"></img>
    </div>
  )
}

export default BannerResources