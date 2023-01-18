import React from 'react'

import styles from './ResourceCard.module.css'
import { Resource } from '../../interfaces/Resource'
import Image from 'next/image'

interface Props {
  resource: Resource
}

const DATA_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL

function ResourceCard({ resource }: Props) {

  return (
    <div className={styles.container}>
          {resource.video_1 ? <video className={styles.video} autoPlay loop muted playsInline>
            <source src={`${DATA_URL}/assets/${resource.video_1}`} type="video/mp4" />
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
            {resource.play_link && <a className='button_primary' href={resource.play_link} target='_blank' rel="noreferrer">TRY IT NOW</a>}
            {resource.github_link && <a className='button_secondary' href={resource.github_link} target='_blank' rel="noreferrer">READ MORE</a>}
          </div>
        </div>
    </div>
  )
}

export default ResourceCard
