import React from 'react'
import 'react-responsive-carousel/lib/styles/carousel.min.css'

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
      <a href={WEBSITE}>
        <img className={styles.image} src={`${DATA_URL}/assets/${project.image_1}?key=thumb`} />
      </a>
      <a href={WEBSITE}>
        <div className={styles.header_info}>
          <div className={styles.project_title}>{project.title}</div>
          <div className={styles.header_arrow}>
            <i className={styles.arrow_right}></i>
          </div>
        </div>
      </a>
    </div>
  )
}

export default ProjectCard
