import React from 'react'
import 'react-responsive-carousel/lib/styles/carousel.min.css'
import { Carousel } from 'react-responsive-carousel'

import styles from './ProjectCard.module.css'
import { PartnerProject } from '../../interfaces/PartnerProject'

interface Props {
  project: PartnerProject
}

const DATA_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL

function ProjectCard({ project }: Props) {
  const WEBSITE = `/project/${project.id}`

  const images = [project.image_1, project.image_2, project.image_3, project.image_4].filter((img) => img)

  return (
    <div className={styles.header}>
      {/* <Carousel autoPlay infiniteLoop showThumbs={false}>
        {images.map((image) => (
          <a href={WEBSITE} key={image}>
            <div
              className={styles.image}
              style={{
                background: `url(${DATA_URL}/assets/${image})`,
              }}
            />
          </a>
        ))}
      </Carousel> */}
      <a href={WEBSITE}>
        <img className={styles.image} src={`${DATA_URL}/assets/${project.image_1}`} />
      </a>
      <a href={WEBSITE}>
        <div className={styles.header_info}>
          {project.title}
          <div className={styles.header_arrow}>
            <i className={styles.arrow_right}></i>
          </div>
        </div>
      </a>
    </div>
  )
}

export default ProjectCard
