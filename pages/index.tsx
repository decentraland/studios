import Head from 'next/head'
import PartnersList from '../components/PartnersList/PartnersList'
import { VerifiedPartner } from '../interfaces/VerifiedPartner'
import styles from '../styles/Home.module.css'
import Partners from '../clients/Partners'

import React from 'react'
import { Container } from 'decentraland-ui/dist/components/Container/Container'
import BannerHeader from '../components/BannerHeader/BannerHeader'

import { Tabs } from 'decentraland-ui/dist/components/Tabs/Tabs'
import { useRouter } from 'next/router'
import Link from 'next/link'

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
  const router = useRouter()
  return (
      
    <Container className={styles.container}>
      <Head>
        <title>Metaverse Studios</title>
      </Head>
      <Tabs>
        <Tabs.Left>
          <Tabs.Tab active>Studios</Tabs.Tab>
          <Link href='/projects' legacyBehavior>
            <Tabs.Tab>Projects</Tabs.Tab>
          </Link>
        </Tabs.Left>
      </Tabs>
      <main className={styles.main}>
        <BannerHeader />
        <PartnersList partners={partners} />
      </main>
    </Container>

  )
}

export default Home
