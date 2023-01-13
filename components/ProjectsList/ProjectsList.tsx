import React from 'react'
import ProjectCard from '../ProjectCard/ProjectCard'
import { PartnerProjectExtended } from '../../interfaces/PartnerProject'
import styles from './ProjectsList.module.css'


function ProjectsList({ projects }: { projects: PartnerProjectExtended[] }) {
    // const renderProjects = projects.sort((a,b) => new Date(b.date_updated || b.date_created).getTime()  - new Date(a.date_updated || a.date_created).getTime())

    return(
      <div className={styles.projects_grid}>
          {projects.map((project) => <ProjectCard key={project.id} project={project} />)}
      </div>
    )

}

export default ProjectsList