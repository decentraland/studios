import Head from 'next/head'
import styles from '../../styles/Home.module.css'

import React from 'react'
import { Container } from 'decentraland-ui/dist/components/Container/Container'
import Login from '../../components/Login/Login'
import Signup from '../../components/SignupClient/SignupClient'


function SignupPage() {
  return (
    <Container className={styles.container}>
      <Head>
        <meta property="og:title" content="Let’s build the metaverse together" />
        <meta property="og:description" content="Find the Right Team for Your Project." />
        <meta property="og:image" content="https://studios.decentraland.org/images/banner_studios.png" />

        <meta property="og:url" content="https://studios.decentraland.org/login" />

        <meta property="twitter:url" content="https://studios.decentraland.org/login" />
        <meta name="twitter:title" content="Let’s build the metaverse together" />
        <meta name="twitter:description" content="Find the Right Team for Your Project." />
        <meta name="twitter:image" content="https://studios.decentraland.org/images/banner_studios.png"/>
      </Head>
      <main className={styles.main}>
        <Signup />
      </main>
    </Container>
  )
}

export default SignupPage
