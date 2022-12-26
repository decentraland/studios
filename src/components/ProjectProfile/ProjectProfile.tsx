import React from 'react'

import styles from './ProjectProfile.module.css'
import { FormattedMessage } from 'react-intl'
import 'react-responsive-carousel/lib/styles/carousel.min.css'
import { Carousel } from 'react-responsive-carousel'
import { VerifiedPartner } from '../../interfaces/VerifiedPartner'
import { PartnerProject } from '../../interfaces/PartnerProject'
import ReactMarkdown from 'react-markdown'
import BackButton from '../BackButton/BackButton'

interface Props {
  project: PartnerProject
  partner: VerifiedPartner
}

const DATA_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL

function ProjectProfile({ project, partner }: Props) {
  const WEBSITE = project.link || ''
  const PARTNER_WEBSITE = `/profile/${partner.slug}`

  const images = [project.image_1, project.image_2, project.image_3, project.image_4, project.image_5].filter(
    (img) => img
  )

  return (
    <div className={styles.container}>
      <div>
        <BackButton url={PARTNER_WEBSITE} />
      </div>
      <div className={styles.container__content}>
        <div className={styles.info_panel}>
          <div className={styles.name}>{project.title}</div>
        </div>
        <div className={styles.info_panel}>
          <div className={styles.image_container}>
            <Carousel
              autoPlay
              infiniteLoop
              showArrows={true}
              showThumbs={true}
              showStatus={false}
              showIndicators={false}
            >
              {images.map((image) => (
                <img key={image} className={styles.image_img} src={`${DATA_URL}/assets/${image}?key=project-img`} />
              ))}
            </Carousel>
          </div>
          <div className={styles.info_about}>
            <div className={styles.project_description}>
              <div className={styles.info_title}>
                <FormattedMessage id="about this project" />
              </div>
              <ReactMarkdown className={styles.description}>{project.description}</ReactMarkdown>
              {project.link && (
                <div className={styles.info_external_link}>
                  <a href={WEBSITE} target="_blank" rel="noreferrer">
                    <FormattedMessage id={'external_link'} />
                    &nbsp; &gt;
                  </a>
                </div>
              )}
            </div>
            <div className={styles.info_author}>
              <div className={styles.info_title}>
                <FormattedMessage id={'author'} />
              </div>
              <div className={styles.partner_info}>
                <a href={PARTNER_WEBSITE}>
                  <div
                    className={styles.partner_logo}
                    style={{
                      background: `url(${DATA_URL}/assets/${partner.logo}?key=logo)`,
                    }}
                  ></div>
                </a>

                <div className={styles.partner_name}>
                  <a href={PARTNER_WEBSITE}>{partner.name}</a>
                </div>
              </div>

              {/* <a href={PARTNERT_WEBSITE}>
                <div className={styles.contact}>
                  <FormattedMessage id={'contact_author'} />
                </div>
              </a> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectProfile
