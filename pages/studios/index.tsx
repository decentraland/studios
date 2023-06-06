import Head from 'next/head'
import PartnersList from '../../components/PartnersList/PartnersList'
import { VerifiedPartner } from '../../interfaces/VerifiedPartner'
import styles from '../../styles/Home.module.css'
import Partners from '../../clients/Partners'

import React from 'react'
import { Container } from 'decentraland-ui/dist/components/Container/Container'
import BannerStudios from '../../components/BannerStudios/BannerStudios'
import Projects from '../../clients/Projects'


export async function getStaticProps() {
  const partners = await Partners.get({basicData: true})

  const projects = await Projects.get({basicData: true})

  return {
    props: {
      partners: partners,
      projectsCount: projects.length,
    },
  }
} 

interface Props {
  partners: VerifiedPartner[]
  projectsCount: number
}

function Home({ partners, projectsCount }: Props) {

  return (
    <Container className={styles.container}>
      <Head>
        <meta property="og:title" content="Let’s build the metaverse together" />
        <meta property="og:description" content="Find the Right Team for Your Project." />
        <meta property="og:image" content="https://studios.decentraland.org/images/banner_studios.png" />
        <meta property="og:url" content="https://studios.decentraland.org/" />

        <meta property="twitter:url" content="https://studios.decentraland.org/" />
        <meta name="twitter:title" content="Let’s build the metaverse together" />
        <meta name="twitter:description" content="Find the Right Team for Your Project." />
        <meta name="twitter:image" content="https://studios.decentraland.org/images/banner_studios.png"/>

        <link rel="canonical" href="https://studios.decentraland.org/studios
        " />
      </Head>
      <main className={styles.main}>
        <BannerStudios studiosCount={partners.length} projectsCount={projectsCount}/>
        <PartnersList partners={partners} />
      </main>
    </Container>
  )
}

export default Home
