import React from 'react'
import Head from 'next/head'

import { Container } from 'decentraland-ui/dist/components/Container/Container'

import styles from '../../styles/Home.module.css'
import Search from '../../components/Search/Search'


export default function SearchPage () {
    return (<Container className={styles.container}>
      <Head>
        <meta property="og:title" content="Let’s build the metaverse together" />
        <meta property="og:description" content="Find the Right Team for Your Project." />
        <meta property="og:image" content="https://studios.decentraland.org/images/banner_studios.png" />

        <meta property="og:url" content="https://studios.decentraland.org/search" />

        <meta property="twitter:url" content="https://studios.decentraland.org/search" />
        <meta name="twitter:title" content="Let’s build the metaverse together" />
        <meta name="twitter:description" content="Find the Right Team for Your Project." />
        <meta name="twitter:image" content="https://studios.decentraland.org/images/banner_studios.png"/>
      </Head>
      <main className={styles.main}>
          <Search />
      </main>
    </Container>)
}