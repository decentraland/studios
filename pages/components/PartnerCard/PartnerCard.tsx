import React from 'react'
import { Service, VerifiedPartner } from '../../interfaces/VerifiedPartner'
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
import Icon from './Icon'
import { FormattedMessage } from 'react-intl'
import DetailsList from './DetailsList'

interface Props {
  partner: VerifiedPartner
}

const DATA_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL

function PartnerCard({ partner }: Props) {
  const WEBSITE = partner.website || ''

  return (
    <div className={styles.PartnerCard}>
      <div
        className={styles.Image}
        style={{
          background: `url(${DATA_URL}/assets/${partner.logo})`,
        }}
      >
        <a href={WEBSITE} target="_blank" rel="noreferrer"></a>
      </div>
      <div className={styles.Container}>
        <h3 style={{ margin: '0', marginBottom: '0.2rem' }}>
          <a href={WEBSITE} target="_blank" rel="noreferrer">
            {partner.name}
          </a>
        </h3>
        <div className={styles.Meta}>
          <div className={styles.Pills}>
            {partner.services.map((service, i) => (
              <span key={`${service}-${i}`} className={styles.Services}>
                <CategoryPill type={service} />
              </span>
            ))}
          </div>
          <div>
            {partner.website && <Icon url={partner.website} icon={<Website />} />}
            {partner.marketplace && <Icon url={partner.marketplace} icon={<Marketplace />} />}
            {partner.email && <Icon url={partner.email} icon={<Email />} />}
            {partner.discord && <Icon url={partner.discord} icon={<Discord />} />}
            {partner.opensea && <Icon url={partner.opensea} icon={<Opensea />} />}
            {partner.twitter && <Icon url={partner.twitter} icon={<Twitter />} />}
            {partner.instagram && <Icon url={partner.instagram} icon={<Instagram />} />}
            {partner.linkedin && <Icon url={partner.linkedin} icon={<Linkedin />} />}
            {partner.youtube && <Icon url={partner.youtube} icon={<Youtube />} />}
          </div>
        </div>
        <input type="checkbox" id={`partner-${partner.id}`} className={styles.ReadMoreState} />
        <p className={styles.Description}>{partner.description}</p>
        <table className={styles.Details}>
          <tbody>
            <tr className="region" data-continent={partner.region}>
              <td>
                <FormattedMessage id="region" />
              </td>
              <td>{partner.region}</td>
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
        <label className={styles.ReadMoreTrigger} htmlFor={`partner-${partner.id}`}></label>
      </div>
    </div>
  )
}

export default PartnerCard
