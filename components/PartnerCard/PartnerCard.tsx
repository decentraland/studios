import React from 'react'
import Link from 'next/link'

import { VerifiedPartner, Service } from '../../interfaces/VerifiedPartner'
import ServiceTag from '../ServiceTag/ServiceTag'
import styles from './PartnerCard.module.css'
import MarkdownDescription from '../MarkdownDescription/MarkdownDescription'
import Image from 'next/image'

interface Props {
  partner: VerifiedPartner
}

const DATA_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL

const SERVICES = Object.values(Service)

function PartnerCard({ partner }: Props) {
  const PROFILE_WEBSITE = `/profile/${partner.slug}`

  const displayServices = (partner.services || []).filter((service) => SERVICES.includes(service))

  return (
    <Link href={PROFILE_WEBSITE} passHref legacyBehavior>
      <div className={styles.container}>
        <a href={PROFILE_WEBSITE}>
          <div className={styles.image}><Image alt='' src={`${DATA_URL}/assets/${partner.logo}?key=logo`} fill unoptimized/></div>
        </a>
        <div className={styles.info_container}>
          <h3 className={styles.name}>
            <a href={PROFILE_WEBSITE}>{partner.name}</a>
          </h3>
          <div className={styles.meta}>
            <div className={styles.pills}>
              {displayServices.map((service, i) => (
                <span key={`${service}-${i}`} className={styles.services}>
                  <ServiceTag type={service} active hideText hideTooltip />
                </span>
              ))}
            </div>
          </div>
          <div className={styles.description_container}>
            <MarkdownDescription className={styles.description} description={partner.description} inPartnersList />
          </div>
        </div>
      </div>
    </Link>
  )
}

export default PartnerCard
