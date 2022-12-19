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
import Empty from '../Icons/Empty'
import ReactMarkdown from 'react-markdown'

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
            <div className={styles.name}>{partner.name}</div>
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
            </div>
            <div className={styles.meta}>
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
      </div>

      <div className={styles.info_panel}>
        <div className={styles.info_about}>
          <div className={styles.info_title}>
            <FormattedMessage id="about" />
          </div>
          <ReactMarkdown className={styles.description}>{partner.description}</ReactMarkdown>
        </div>
        <div className={styles.table_container}>
          <div className={styles.info_details}>
            <div>
              <div>
                <FormattedMessage id="region" />
              </div>
              <div>
                <p>{partner.region}</p>
              </div>
            </div>
            <div>
              <div>
                <FormattedMessage id="country" />
              </div>
              <div>
                <p>{partner.country}</p>
              </div>
            </div>
          </div>
          <div className={`${styles.info_details} ${styles['info_details--border']}`}>
            <div>
              <div>
                <FormattedMessage id="team_size" />
              </div>
              <div>
                <p>{partner.team_size}</p>
              </div>
            </div>
            <div>
              <div>
                <FormattedMessage id="languages" />
              </div>
              <div>
                <p>{!!partner.languages && <DetailsList list={partner.languages} />}</p>
              </div>
            </div>
          </div>
          <div className={`${styles.info_details} ${styles['info_details--border']}`}>
            <div>
              <div>
                <FormattedMessage id="payment_methods" />
              </div>
              <div>
                <p>{!!partner.payment_methods && <DetailsList list={partner.payment_methods} />}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className={styles.info_title}>
          <FormattedMessage id="projects" />
        </div>
        {projects.length ? (
          <div className={styles.projects_grid}>
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <Empty />
            <FormattedMessage id="noProjects" />
          </div>
        )}
      </div>
      <a href="https://dclstudios.typeform.com/to/HQpD0z5S" target="_blank" rel="noreferrer">
        Report this studio
      </a>
    </div>
  )
}

export default PartnerProfile
