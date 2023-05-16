import Head from 'next/head'
import styles from '../../styles/Home.module.css'

import React from 'react'
import { Container } from 'decentraland-ui/dist/components/Container/Container'
import BannerProjects from '../../components/BannerProjects/BannerProjects'

import ProjectsList from '../../components/ProjectsList/ProjectsList'
import { PartnerProject } from '../../interfaces/PartnerProject'
import Projects from '../../clients/Projects'

export async function getStaticProps() {
  
  const projects = await Projects.get({basicData: true})
  
  return {
    props: {
      projects: projects.filter(project => project.profile), 
    },
  }
}

interface Props {
  projects: PartnerProject[]
}

function ProjectsPage({ projects }: Props) {
  return (
      
    <Container className={styles.container}>
      <Head>
        <meta property="og:title" content="Browse the latest projects on Decentraland and get new ideas for your brand" />
        <meta property="og:description" content="Hundreds of designers and studios around the world showcase their portfolio work on Metaverse Studios." />
        <meta property="og:image" content="https://studios.decentraland.org/images/banner_projects.png" />

        <meta property="og:url" content="https://studios.decentraland.org/projects" />

        <meta property="twitter:url" content="https://studios.decentraland.org/projects" />
        <meta name="twitter:title" content="Browse the latest projects on Decentraland and get new ideas for your brand" />
        <meta name="twitter:description" content="Hundreds of designers and studios around the world showcase their portfolio work on Metaverse Studios." />
        <meta name="twitter:image" content="https://studios.decentraland.org/images/banner_projects.png"/>
      </Head>
      <main className={styles.main}>
        <BannerProjects />
        <ProjectsList projects={projects}/>
      </main>
    </Container>

  )
}

export default ProjectsPage
