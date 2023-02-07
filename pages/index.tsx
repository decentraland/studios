import Head from 'next/head'
import PartnersList from '../components/PartnersList/PartnersList'
import { VerifiedPartner } from '../interfaces/VerifiedPartner'
import styles from '../styles/Home.module.css'
import Partners from '../clients/Partners'

import React from 'react'
import { Container } from 'decentraland-ui/dist/components/Container/Container'
import BannerHeader from '../components/BannerHeader/BannerHeader'


export async function getStaticProps() {
  const partners = await Partners.get({basicData: true})

  return {
    props: {
      partners: partners,
    },
  }
} 

interface Props {
  partners: VerifiedPartner[]
}

function Home({ partners }: Props) {
  return (
    <Container className={styles.container}>
      <Head>
        <meta property="og:title" content="Let’s build the metaverse together" />
        <meta property="og:description" content="Find the Right Team for Your Project." />
        <meta property="og:image" content="/images/banner_studios.png" />
      </Head>
      <main className={styles.main}>
        <BannerHeader />
        <PartnersList partners={partners} />
      </main>
    </Container>
  )
}

export default Home
