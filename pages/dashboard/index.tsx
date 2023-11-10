import React from 'react'
import Head from 'next/head'

import styles from '../../styles/Home.module.css'
import { Container } from 'decentraland-ui/dist/components/Container/Container'
import MessagesDashboard from '../../components/DashboardMessages/DashboardMessages'

function DashboardPage() {
  return (
    <Container className={styles.container}>
      <Head>
        <meta property="og:title" content="Creative freelance jobs in Decentraland" />
        <meta property="og:description" content="The project board is an exclusive resource for contract work. It’s perfect for agencies, and brands looking to take their first steps into Decentraland." />
        <meta property="og:image" content="/images/banner_jobs.png" />
      </Head>
      <main className={styles.main}>
        <MessagesDashboard />
      </main>
    </Container>
  )
}

export default DashboardPage