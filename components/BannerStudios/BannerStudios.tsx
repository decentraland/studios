import React from 'react'
import styles from './BannerStudios.module.css'
import { trackLink } from '../utils'
import Link from 'next/link'

const JOIN_REGISTRY_URL = 'https://dclstudios.typeform.com/to/NfzmbzXi'

function BannerStudios() {

  return (
    <div className={styles.container}>
      <div className={styles.leftPanel}>
        <div className={styles.mainText}>Your brand belongs in the Metaverse. Let’s get you a team to build with.</div>
      </div>
        <div className={styles.factsContainer}>
          <Link href="/jobs/hire" legacyBehavior>
            <a className={styles.button}>START A PROJECT</a>
          </Link>
          <div className={styles.creators}>
            Are you a creator?&nbsp;
            <a className={styles.link_join}
              target={'_blank'}
              href={JOIN_REGISTRY_URL}
              rel="noreferrer"
              onClick={() => trackLink('Open External Link', 'Join Registry', JOIN_REGISTRY_URL)}>
              Join our registry.
            </a>
          </div>
        </div>
      <img alt='Let’s get you a team to build with' className={styles.image} src="/images/banner_studios.webp"></img>
    </div>
  )
}

export default BannerStudios
