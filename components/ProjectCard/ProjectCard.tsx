import React from 'react'

import styles from './ProjectCard.module.css'
import { PartnerProject } from '../../interfaces/PartnerProject'
import Link from 'next/link'
import Image from 'next/image'

interface Props {
  project: PartnerProject
}

const DATA_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL

function ProjectCard({ project }: Props) {
  const WEBSITE = `/project/${project.id}`
  const isNew = new Date().getTime() - new Date(project.date_created).getTime() <= 604800000
  
  return (
    <div>
      <div className={styles.header}>
        <Link href={WEBSITE}>
          <div className={styles.image_container}>
            <Image className={styles.image} fill unoptimized alt={project.title} src={`${DATA_URL}/assets/${project.image_1}?key=thumb`} />
          </div>
          {isNew ? <div className={styles.new_badge}>NEW</div> : null}
          <div className={styles.header_info}>
            <div className={styles.project_title}>{project.title}</div>
          </div>
        </Link>
      </div>
      {project.profile?.name ? <div className={styles.partner__data}>
        <Image className={styles.partner_logo} unoptimized width='16' height='16' alt={project.profile.name} src={`${DATA_URL}/assets/${project.profile.logo}?key=logo`}/>
        {project.profile.name}
      </div> : null}
    </div>
  )
}

export default ProjectCard
