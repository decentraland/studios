import Head from 'next/head'
import styles from '../../styles/Home.module.css'
import Partners from '../../clients/Partners'

import React from 'react'
import { Container } from 'decentraland-ui/dist/components/Container/Container'
import BannerProjects from '../../components/BannerProjects/BannerProjects'

import ProjectsList from '../../components/ProjectsList/ProjectsList'
import { PartnerProjectExtended } from '../../interfaces/PartnerProject'
import Projects from '../../clients/Projects'

export async function getStaticProps() {
  
  const projects = await Projects.get({basicData: true})
  
  const partners = await Partners.get({basicData: true})

  const filteredProjects = projects.filter(project => partners.some(partner => partner.id === project.profile))

  const projectsExtended = filteredProjects.map(project => {
    const partner = partners.find(partner => partner.id === project.profile)
    return {... project, partner_name: partner?.name, partner_slug: partner?.slug, partner_logo: partner?.logo}
  })

  return {
    props: {
      projects: projectsExtended, 
    },
  }
}

interface Props {
  projects: PartnerProjectExtended[]
}

function ProjectsPage({ projects }: Props) {
  return (
      
    <Container className={styles.container}>
      <Head>
        <title>Metaverse Studios</title>
      </Head>
      <main className={styles.main}>
        <BannerProjects />
        <ProjectsList projects={projects}/>
      </main>
    </Container>

  )
}

export default ProjectsPage
