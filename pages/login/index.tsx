import Head from 'next/head'
import styles from '../../styles/Home.module.css'

import React from 'react'
import { Container } from 'decentraland-ui/dist/components/Container/Container'
import Login from '../../components/Login/Login'


function LoginPage() {
  return (
    <Container className={styles.container}>
      <Head>
        <meta property="og:title" content="Let’s build the metaverse together" />
        <meta property="og:description" content="Find the Right Team for Your Project." />
        <meta property="og:image" content="/images/banner_studios.png" />
      </Head>
      <main className={styles.main}>
        <Login />
      </main>
    </Container>
  )
}

export default LoginPage
