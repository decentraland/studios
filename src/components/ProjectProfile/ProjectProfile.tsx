import React from 'react'

import styles from './ProjectProfile.module.css'
import { FormattedMessage } from 'react-intl'
import 'react-responsive-carousel/lib/styles/carousel.min.css'
import { Carousel } from 'react-responsive-carousel'
import { VerifiedPartner } from '../../interfaces/VerifiedPartner'
import { PartnerProject } from '../../interfaces/PartnerProject'
import ReactMarkdown from 'react-markdown'

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
    <div>
      <div className={styles.info_panel}>
        <div onClick={() => window.history.back()}>
          <div className={styles.header_arrow}>
            <i className={styles.arrow_left}></i>
          </div>
        </div>
        <div className={styles.name}>{project.title}</div>
      </div>
      <div className={styles.info_panel}>
        <div className={styles.image_container}>
          <Carousel autoPlay infiniteLoop showThumbs={true} showStatus={false} showIndicators={false}>
            {images.map((image) => (
              <img key={image} className={styles.image_img} src={`${DATA_URL}/assets/${image}`} />
            ))}
          </Carousel>
        </div>
        <div className={styles.info_about}>
          <ReactMarkdown className={styles.description}>{project.description}</ReactMarkdown>
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
            <a href={PARTNER_WEBSITE}>
              <div
                className={styles.partner_logo}
                style={{
                  background: `url(${DATA_URL}/assets/${partner.logo})`,
                }}
              ></div>
            </a>

            <div className={styles.partner_name}>
              <a href={PARTNER_WEBSITE}>{partner.name}</a>
            </div>
            <a href={PARTNER_WEBSITE}>
              <div className={styles.header_arrow}>
                <i className={styles.arrow_right}></i>
              </div>
            </a>
          </div>

          {/* <a href={PARTNERT_WEBSITE}>
            <div className={styles.contact}>
              <FormattedMessage id={'contact_author'} />
            </div>
          </a> */}
        </div>
      </div>
    </div>
  )
}

export default ProjectProfile
