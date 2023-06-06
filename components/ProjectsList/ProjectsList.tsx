import React, { useEffect, useState } from 'react'
import ProjectCard from '../ProjectCard/ProjectCard'
import { PartnerProject } from '../../interfaces/PartnerProject'
import styles from './ProjectsList.module.css'


function ProjectsList({ projects }: { projects: PartnerProject[] }) {

  const [limit, setLimit] = useState(parseInt(globalThis?.sessionStorage?.projectsListLimit) || 18)
  const [projectsList, setProjectsList] = useState<PartnerProject[]>(projects)

  useEffect(() => {
    fetch('/api/get/projects')
      .then(res => res.ok && res.json())
      .then((data) => setProjectsList(data))
      .catch((err) => console.log(err))
  }, [])

    const renderProjects = projectsList.slice(0, limit)

    useEffect(() => {
      globalThis.sessionStorage.setItem('projectsListLimit', limit.toString());
    }, [limit])

    return(
      <>
        <div className={styles.projects_grid}>
            {renderProjects.map((project) => <ProjectCard key={project.id} project={project} />)}
        </div>
        {projectsList.length >= limit && <div onClick={() => setLimit(current => current + 12)} className='button_primary center'>LOAD MORE</div>}
      </>
    )

}

export default ProjectsList