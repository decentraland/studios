import React from 'react'
import { VerifiedPartner, Service } from '../../interfaces/VerifiedPartner'
import CategoryPill from '../CategoryPill/CategoryPill'
import Discord from '../Icons/Discord'
import Email from '../Icons/Email'
import Instagram from '../Icons/Instagram'
import Linkedin from '../Icons/Linkedin'
import Twitter from '../Icons/Twitter'
import Youtube from '../Icons/Youtube'
import Website from '../Icons/Website'

import styles from './PartnerProfile.module.css'
import Marketplace from '../Icons/Marketplace'
import Opensea from '../Icons/Opensea'
import Icon from '../Icon/Icon'
import { FormattedMessage } from 'react-intl'
import DetailsList from '../DetailsList/DetailsList'
import { PartnerProject } from '../../interfaces/PartnerProject'
import ProjectCard from '../ProjectCard/ProjectCard'

interface Props {
  partner: VerifiedPartner
  projects: PartnerProject[]
}

const DATA_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL

const SERVICES = Object.values(Service)

function PartnerProfile({ partner, projects }: Props) {
  const WEBSITE = partner.website || ''
  const displayServices = partner.services || [].filter((service) => SERVICES.includes(service))

  return (
    <div>
      <div className={styles.info_panel}>
        <div className={styles.info_id}>
          <a href={WEBSITE} target="_blank" rel="noreferrer">
            <div
              className={styles.image}
              style={{
                background: `url(${DATA_URL}/assets/${partner.logo})`,
              }}
            />
          </a>
          <div className={styles.header_info}>
            <div className={styles.name}>
              <a href={WEBSITE} target="_blank" rel="noreferrer">
                {partner.name}
              </a>
            </div>
            <div className={styles.meta}>
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
              <div className={styles.pills}>
                {displayServices.map((service, i) => (
                  <span key={`${service}-${i}`} className={styles.services}>
                    <CategoryPill type={service} />
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
        {/* contact button goes here */}
      </div>

      <div className={styles.info_panel}>
        <div className={styles.info_about}>
          <div className={styles.info_title}>
            <FormattedMessage id="about" />
          </div>
          <p className={styles.description}>{partner.description}</p>
        </div>
        <div>
          <div className={styles.info_details}>
            <div>
              <div>
                <FormattedMessage id="region" />
              </div>
              <div>{partner.region}</div>
            </div>
            <div>
              <div>
                <FormattedMessage id="country" />
              </div>
              <div>{partner.country}</div>
            </div>
          </div>
          <div className={`${styles.info_details} ${styles['info_details--border']}`}>
            <div>
              <div>
                <FormattedMessage id="team_size" />
              </div>
              <div>{partner.team_size}</div>
            </div>
            <div>
              <div>
                <FormattedMessage id="languages" />
              </div>
              <div>{!!partner.languages && <DetailsList list={partner.languages} />}</div>
            </div>
          </div>
          <div className={`${styles.info_details} ${styles['info_details--border']}`}>
            <div>
              <div>
                <FormattedMessage id="payment_methods" />
              </div>
              <div>{!!partner.payment_methods && <DetailsList list={partner.payment_methods} />}</div>
            </div>
          </div>
        </div>
      </div>

      {projects.length ? (
        <div>
          <div className={styles.info_title}>
            <FormattedMessage id="projects" />
          </div>
          <div className={styles.info_panel}>
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default PartnerProfile
