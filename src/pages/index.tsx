import Head from 'next/head'
import PartnersList from '../components/PartnersList'
import { VerifiedPartner } from '../interfaces/VerifiedPartner'
import styles from '../styles/Home.module.css'
import Partners from '../clients/Partners'
import Services from '../components/Services/Services'

import React from 'react'
import { Container } from 'decentraland-ui/dist/components/Container/Container'

export async function getServerSideProps() {
  const partners = await Partners.get()
  return {
    props: {
      partners: partners,
    },
  }
}

function Home({ partners }: { partners: VerifiedPartner[] }) {
  return (
    <Container>
      <Head>
        <title>Verified Partners</title>
        <meta name="description" content="Verified Partners" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <Services />
        <PartnersList partners={partners} />
      </main>
    </Container>
  )
}

export default Home
