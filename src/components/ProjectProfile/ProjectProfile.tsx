import React from 'react'

import styles from './ProjectProfile.module.css'
import { FormattedMessage } from 'react-intl'
import 'react-responsive-carousel/lib/styles/carousel.min.css'
import { Carousel } from 'react-responsive-carousel'
import { VerifiedPartner } from '../../interfaces/VerifiedPartner'
import { PartnerProject } from '../../interfaces/PartnerProject'

interface Props {
  project: PartnerProject
  partner: VerifiedPartner
}

const DATA_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL

function ProjectProfile({ project, partner }: Props) {
  const WEBSITE = project.link || ''
  const PARTNERT_WEBSITE = `/profile/${partner.slug}`

  const images = [project.image_1, project.image_2, project.image_3, project.image_4].filter((img) => img)

  return (
    <div>
      <div className={styles.name}>{project.title}</div>
      <div className={styles.info_panel}>
        <div className={styles.image_container}>
          <Carousel autoPlay infiniteLoop showThumbs={false}>
            {images.map((image) => (
              // <img key={image} className={styles.image} src={`${DATA_URL}/assets/${image}`} />
              <div
                key={image}
                className={styles.image}
                style={{
                  background: `url(${DATA_URL}/assets/${image})`,
                }}
              />
            ))}
          </Carousel>
        </div>
        <div className={styles.info_about}>
          <div className={styles.description}>{project.description}</div>
          {project.link && (
            <div className={styles.info_details}>
              <a href={WEBSITE} target="_blank" rel="noreferrer">
                <FormattedMessage id={'external_link'} />
                &nbsp; &gt;
              </a>
            </div>
          )}
          <div className={styles.info_title}>
            <FormattedMessage id={'author'} />
          </div>
          <div className={styles.partner_info}>
            <a href={PARTNERT_WEBSITE}>
              <div
                className={styles.partner_logo}
                style={{
                  background: `url(${DATA_URL}/assets/${partner.logo})`,
                }}
              ></div>
            </a>

            <div className={styles.partner_name}>
              <a href={PARTNERT_WEBSITE}>{partner.name}</a>
            </div>
            <a href={PARTNERT_WEBSITE}>
              <div className={styles.header_arrow}>
                <i className={styles.arrow_right}></i>
              </div>
            </a>
          </div>

          <a href={PARTNERT_WEBSITE}>
            <div className={styles.contact}>
              <FormattedMessage id={'contact_author'} />
            </div>
          </a>
        </div>
      </div>
    </div>
  )
}

export default ProjectProfile
