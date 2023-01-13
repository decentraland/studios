import Head from 'next/head'
import styles from '../../styles/Home.module.css'
import Partners from '../../clients/Partners'

import React from 'react'
import { Container } from 'decentraland-ui/dist/components/Container/Container'
import BannerProjects from '../../components/BannerProjects/BannerProjects'

import { Tabs } from 'decentraland-ui/dist/components/Tabs/Tabs'
import ProjectsList from '../../components/ProjectsList/ProjectsList'
import { PartnerProjectExtended } from '../../interfaces/PartnerProject'
import Projects from '../../clients/Projects'
import { useRouter } from 'next/router'
import Link from 'next/link'

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
  const router = useRouter()
  return (
      
    <Container className={styles.container}>
      <Head>
        <title>Metaverse Studios</title>
      </Head>
      <Tabs>
        <Tabs.Left>
          <Link href='/' legacyBehavior>
            <Tabs.Tab>Studios</Tabs.Tab>
          </Link>
          <Tabs.Tab active>Projects</Tabs.Tab>
        </Tabs.Left>
      </Tabs>
      <main className={styles.main}>
        <BannerProjects />
        <ProjectsList projects={projects}/>
      </main>
    </Container>

  )
}

export default ProjectsPage
