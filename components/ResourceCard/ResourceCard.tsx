import React from 'react'

import styles from './ResourceCard.module.css'
import { Resource } from '../../interfaces/Resource'
import Image from 'next/image'

interface Props {
  resource: Resource
}

const DATA_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL

function ResourceCard({ resource }: Props) {

  const playVideo = (e: any) => {
    if(resource.video_1){
      e.currentTarget.children[0].play()
    }
  }
  
  const pauseVideo = (e: any) => {
    if(resource.video_1){
      e.currentTarget.children[0].pause()
      e.currentTarget.children[0].currentTime = 0
    }
  }

  return (
    <div className={styles.container} 
      onMouseEnter={playVideo}  
      onMouseLeave={pauseVideo} >
          {resource.video_1 ?
          <video className={styles.video} loop muted playsInline preload='metadata'>
            <source src={`${DATA_URL}/assets/${resource.video_1}#t=0.001`} type="video/mp4" />
          </video> 
          : 
          <div className={styles.image_container}>
            <Image className={styles.image} fill unoptimized alt={resource.title} src={`${DATA_URL}/assets/${resource.image_1}?key=thumb`} />
          </div>
          }
        <div className={styles.info}>
          <div className={styles.title}>{resource.title}</div>
          <div className={styles.description}>{resource.description}</div>
          <div className={styles.tags}>{(resource.tags || []).map((tag, i) => <div key={i} className={styles.tag}>{tag}</div> )}</div>
          <div className={styles.buttons}>
            {resource.play_link && <a className='button_primary--inverted' href={resource.play_link} target='_blank' rel="noreferrer">TRY IT NOW</a>}
            {resource.github_link && <a className='button_basic' href={resource.github_link} target='_blank' rel="noreferrer">VIEW CODE</a>}
          </div>
        </div>
    </div>
  )
}

export default ResourceCard
