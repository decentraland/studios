import styles from '../../styles/Home.module.css'

import React, { useState } from 'react'
import Head from 'next/head'

import { Container } from 'decentraland-ui/dist/components/Container/Container'

import BannerResources from '../../components/BannerResources/BannerResources'
import Resources from '../../clients/Resources'
import { Resource } from '../../interfaces/Resource'
import ResourcesList from '../../components/ResourcesList/ResourcesList'


export async function getStaticProps() {
  
  const resources = await Resources.get()

  return {
    props: {
      resources: resources, 
    },
  }
}

interface Props {
  resources: Resource[]
}

function ResourcesPage({ resources }: Props) {
  const [limit, setLimit] = useState(5)

  const renderResources = resources.slice(0, limit)

  return (
      
    <Container className={styles.container}>
      <Head>
        <meta property="og:title" content="Browse free and open source ideas to inspire you" />
        <meta property="og:description" content="Here you will find the building blocks to create engaging and interactive experiences in Decentraland. Any creator can customize these with complete creative freedom." />
        <meta property="og:image" content="/images/banner_ideas.png" />
      </Head>
      <main className={styles.main}>
        <BannerResources />
        <ResourcesList resources={resources} />
      </main>
    </Container>

  )
}

export default ResourcesPage
