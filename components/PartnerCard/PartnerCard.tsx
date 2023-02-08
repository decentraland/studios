import React from 'react'
import Link from 'next/link'

import { VerifiedPartner, Service } from '../../interfaces/VerifiedPartner'
import CategoryPill from '../CategoryPill/CategoryPill'
import styles from './PartnerCard.module.css'
import { FormattedMessage, useIntl } from 'react-intl'
import MarkdownDescription from '../MarkdownDescription/MarkdownDescription'
import Image from 'next/image'
import { toSnakeCase } from '../utils'

interface Props {
  partner: VerifiedPartner
}

const DATA_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL

const SERVICES = Object.values(Service)

function PartnerCard({ partner }: Props) {
  const PROFILE_WEBSITE = `/profile/${partner.slug}`

  const displayServices = (partner.services || []).filter((service) => SERVICES.includes(service))
  
  const intl = useIntl()

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
                  <img alt='' title={intl.formatMessage({ id: `service.${toSnakeCase(service)}`})} src={`/images/category_${service.replace(' ', '')}.svg`} />
                </span>
              ))}
            </div>
          </div>
          <div className={styles.description_container}>
            <MarkdownDescription className={styles.description} description={partner.description} inPartnersList />
            <div className={styles.read_more_trigger}>
              <FormattedMessage id="show_more" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default PartnerCard
