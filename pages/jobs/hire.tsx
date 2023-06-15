import Head from 'next/head'
import styles from '../../styles/Home.module.css'

import React from 'react'
import { Container } from 'decentraland-ui/dist/components/Container/Container'
import JobSubmitForm from '../../components/JobSubmitForm/JobSubmitForm'

function JobSubmitPage() {
  return (
    <Container className={styles.container}>
      <Head>
        <meta property="og:title" content="Creative freelance jobs in Decentraland" />
        <meta property="og:description" content="Find the Right Team for Your Project." />
        <meta property="og:image" content="/images/banner_jobs.png" />

        <meta property="og:url" content="https://studios.decentraland.org/jobs/hire" />

        <meta property="twitter:url" content="https://studios.decentraland.org/jobs/hire" />
        <meta name="twitter:title" content="Creative freelance jobs in Decentraland" />
        <meta name="twitter:description" content="Find the Right Team for Your Project." />
        <meta name="twitter:image" content="/images/banner_jobs.png"/>
      </Head>
      <main className={styles.main}>
        <JobSubmitForm />
      </main>
    </Container>
  )
}

export default JobSubmitPage
