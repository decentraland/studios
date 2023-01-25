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
        <meta property="og:title" content="Browse the latest projects on Decentraland and get new ideas for your brand" />
        <meta property="og:description" content="Hundreds of designers and studios around the world showcase their portfolio work on Metaverse Studios." />
        <meta property="og:image" content="/images/banner_projects.png" />
      </Head>
      <main className={styles.main}>
        <BannerProjects />
        <ProjectsList projects={projects}/>
      </main>
    </Container>

  )
}

export default ProjectsPage
