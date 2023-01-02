import Head from 'next/head'
import PartnersList from '../components/PartnersList/PartnersList'
import { VerifiedPartner } from '../interfaces/VerifiedPartner'
import styles from '../styles/Home.module.css'
import Partners from '../clients/Partners'
import Services from '../components/Services/Services'

import React from 'react'
import { Container } from 'decentraland-ui/dist/components/Container/Container'
import { useIntl } from 'react-intl'
import BannerHeader from '../components/BannerHeader/BannerHeader'

export async function getStaticProps() {
  const partners = await Partners.get()
  return {
    props: {
      partners,
    },
  }
}

function Home({ partners }: { partners: VerifiedPartner[] }) {
  const intl = useIntl()
  const title = intl.formatMessage({ id: 'title' })
  return (
    <Container className={styles.container}>
      <Head>
        <title>Metaverse Studios</title>
        {/* <meta name="description" content="Verified Partners" /> */}
      </Head>

      <main className={styles.main}>
        {/* <Services /> */}
        <BannerHeader />
        <PartnersList partners={partners} />
      </main>
    </Container>
  )
}

export default Home
