import React, { useState } from 'react'
import ProjectCard from '../ProjectCard/ProjectCard'
import { PartnerProjectExtended } from '../../interfaces/PartnerProject'
import styles from './ProjectsList.module.css'


function ProjectsList({ projects }: { projects: PartnerProjectExtended[] }) {
    // const renderProjects = projects.sort((a,b) => new Date(b.date_updated || b.date_created).getTime()  - new Date(a.date_updated || a.date_created).getTime())
    const [limit, setLimit] = useState(18)

    const renderProjects = projects.slice(0, limit)

    return(
      <>
        <div className={styles.projects_grid}>
            {renderProjects.map((project) => <ProjectCard key={project.id} project={project} />)}
        </div>
        {projects.length >= limit && <div onClick={() => setLimit(current => current + 12)} className='button_primary center'>LOAD MORE</div>}
      </>
    )

}

export default ProjectsList