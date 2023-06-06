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

  return (
    <Container className={styles.container}>
      <Head>
        <meta property="og:title" content="Browse free and open source ideas to inspire you" />
        <meta property="og:description" content="Here you will find the building blocks to create engaging and interactive experiences in Decentraland. Any creator can customize these with complete creative freedom." />
        <meta property="og:image" content="https://studios.decentraland.org/images/banner_ideas.png" />
        <meta property="og:url" content="https://studios.decentraland.org/resources" />

        <meta property="twitter:url" content="https://studios.decentraland.org/resources" />
        <meta name="twitter:title" content="Browse free and open source ideas to inspire you" />
        <meta name="twitter:description" content="Here you will find the building blocks to create engaging and interactive experiences in Decentraland. Any creator can customize these with complete creative freedom." />
        <meta name="twitter:image" content="https://studios.decentraland.org/images/banner_ideas.png"/>
        
        <link rel="canonical" href="https://studios.decentraland.org/resources" />
      </Head>
      <main className={styles.main}>
        <BannerResources />
        <ResourcesList resources={resources} />
      </main>
    </Container>
  )
}

export default ResourcesPage
