import Head from 'next/head'
import PartnersList from '../components/PartnersList/PartnersList'
import { VerifiedPartner } from '../interfaces/VerifiedPartner'
import styles from '../styles/Home.module.css'
import Partners from '../clients/Partners'
import Services from '../components/Services/Services'
import 'semantic-ui-css/semantic.min.css'

import React from 'react'

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
    <div className={styles.container}>
      <Head>
        <title>Verified Partners</title>
        <meta name="description" content="Verified Partners" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <Services />
        <PartnersList partners={partners} />
      </main>
    </div>
  )
}

export default Home
