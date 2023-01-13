import React from 'react'
import 'react-responsive-carousel/lib/styles/carousel.min.css'

import styles from './ProjectCard.module.css'
import { PartnerProjectExtended } from '../../interfaces/PartnerProject'
import Link from 'next/link'
import Image from 'next/image'

interface Props {
  project: PartnerProjectExtended
}

const DATA_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL

function ProjectCard({ project }: Props) {
  const WEBSITE = `/project/${project.id}`
  return (
    <div>
    <div className={styles.header}>
      <Link href={WEBSITE}>
        <div className={styles.image_container}>
          <Image className={styles.image} fill unoptimized alt={project.title} src={`${DATA_URL}/assets/${project.image_1}?key=thumb`} />
        </div>
        <div className={styles.header_info}>
          <div className={styles.project_title}>{project.title}</div>
        </div>
      </Link>
    </div>
    {project.partner_name ? <div className={styles.partner__data}>
      <Image className={styles.partner_logo} unoptimized width='16' height='16' alt={project.partner_name} src={`${DATA_URL}/assets/${project.partner_logo}?key=logo`}/>
      {project.partner_name}
    </div> : null}
    </div>
  )
}

export default ProjectCard
