import React from 'react'
import styles from './BannerProjects.module.css'

function BannerProjects() {
  return (
    <div className={styles.container}>
      <div className={styles.leftPanel}>
        <div className={styles.mainText}>Browse the latest projects on Decentraland and get new ideas for your brand.</div>
        <div className={styles.smallText}>Hundreds of designers and studios around the world showcase their portfolio work on Metaverse Studios.</div>
      </div>
      <img alt='Browse the latest projects on Decentraland and get new ideas for your brand' className={styles.image} src="/images/atari_shoes.webp"></img>
    </div>
  )
}

export default BannerProjects