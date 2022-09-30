import Head from 'next/head'
import PartnersList from './components/PartnersList'
import { VerifiedPartner } from './interfaces/VerifiedPartner'
import styles from '../styles/Home.module.css'
import Partners from './clients/Partners'
import Services from './components/Services/Services'

export async function getStaticProps() {
  const partners = await Partners.get()
  return {
    props: {
      partners: partners,
    }, // will be passed to the page component as props
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
