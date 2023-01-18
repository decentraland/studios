import styles from '../../styles/Home.module.css'

import React from 'react'
import Head from 'next/head'

import { Container } from 'decentraland-ui/dist/components/Container/Container'

import ResourceCard from '../../components/ResourceCard/ResourceCard'
import BannerResources from '../../components/BannerResources/BannerResources'
import Resources from '../../clients/Resources'
import { Resource } from '../../interfaces/Resource'


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
  return (
      
    <Container className={styles.container}>
      <Head>
        <title>Metaverse Studios</title>
      </Head>
      <main className={styles.main}>
        <BannerResources />
        <div>
          {resources.map((resource) => <ResourceCard key={resource.id} resource={resource} />)}
        </div>
      </main>
    </Container>

  )
}

export default ResourcesPage
