import React, { useState } from 'react'
import { VerifiedPartner, Service } from '../../interfaces/VerifiedPartner'
import CategoryPill from '../CategoryPill/CategoryPill'
import Discord from '../Icons/Discord'
import Email from '../Icons/Email'
import Instagram from '../Icons/Instagram'
import Linkedin from '../Icons/Linkedin'
import Twitter from '../Icons/Twitter'
import Youtube from '../Icons/Youtube'
import Website from '../Icons/Website'

import styles from './PartnerCard.module.css'
import Marketplace from '../Icons/Marketplace'
import Opensea from '../Icons/Opensea'
import Icon from '../Icon/Icon'
import { FormattedMessage } from 'react-intl'
import DetailsList from '../DetailsList/DetailsList'

interface Props {
  partner: VerifiedPartner
}

const DATA_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL

const SERVICES = Object.values(Service)

function PartnerCard({ partner }: Props) {
  const WEBSITE = `/partner/${partner.slug}`

  const displayServices = (partner.services || []).filter((service) => SERVICES.includes(service))
  const [showMore, setShowMore] = useState(false)

  return (
    <div className={styles.container}>
      <a href={WEBSITE}>
        <div
          className={styles.image}
          style={{
            background: `url(${DATA_URL}/assets/${partner.logo})`,
          }}
        ></div>
      </a>
      <div className={styles.info_container}>
        <h3 className={styles.name}>
          <a href={WEBSITE}>{partner.name}</a>
        </h3>
        <div className={styles.meta}>
          <div className={styles.pills}>
            {displayServices.map((service, i) => (
              <span key={`${service}-${i}`} className={styles.services}>
                <CategoryPill type={service} />
              </span>
            ))}
          </div>
          <div>
            {partner.website && <Icon url={partner.website} icon={<Website />} />}
            {partner.marketplace && <Icon url={partner.marketplace} icon={<Marketplace />} />}
            {partner.email && <Icon url={`mailto:${partner.email}`} icon={<Email />} />}
            {partner.discord && <Icon url={partner.discord} icon={<Discord />} />}
            {partner.opensea && <Icon url={partner.opensea} icon={<Opensea />} />}
            {partner.twitter && <Icon url={partner.twitter} icon={<Twitter />} />}
            {partner.instagram && <Icon url={partner.instagram} icon={<Instagram />} />}
            {partner.linkedin && <Icon url={partner.linkedin} icon={<Linkedin />} />}
            {partner.youtube && <Icon url={partner.youtube} icon={<Youtube />} />}
          </div>
        </div>
        <input
          type="checkbox"
          id={`partner-${partner.id}`}
          className={styles.read_more_state}
          onClick={() => setShowMore((prev) => !prev)}
        />
        <p className={styles.description}>{partner.description}</p>
        <table className={styles.details}>
          <tbody>
            <tr>
              <td>
                <FormattedMessage id="region" />
              </td>
              <td>{partner.region}</td>
            </tr>
            <tr>
              <td>
                <FormattedMessage id="country" />
              </td>
              <td>{partner.country}</td>
            </tr>
            <tr>
              <td>
                <FormattedMessage id="team_size" />
              </td>
              <td>{partner.team_size}</td>
            </tr>
            <tr>
              <td>
                <FormattedMessage id="languages" />
              </td>
              <td>{!!partner.languages && <DetailsList list={partner.languages} />}</td>
            </tr>
            <tr>
              <td>
                <FormattedMessage id="payment_methods" />
              </td>
              <td>{!!partner.payment_methods && <DetailsList list={partner.payment_methods} />}</td>
            </tr>
          </tbody>
        </table>
        <label className={styles.read_more_trigger} htmlFor={`partner-${partner.id}`}>
          {showMore ? <FormattedMessage id="show_less" /> : <FormattedMessage id="show_more" />}
        </label>
      </div>
    </div>
  )
}

export default PartnerCard
