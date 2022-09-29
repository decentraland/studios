import Head from 'next/head'
import PartnersList from './components/PartnersList'
import { VerifiedPartner } from './interfaces/VerifiedPartner'
import styles from '../styles/Home.module.css'
import Partners from './clients/Partners'

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
        <h1 className={styles.title}>Verified Partners</h1>
        <PartnersList partners={partners} />
      </main>
    </div>
  )
}

export default Home
