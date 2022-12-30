import React, { ReactElement } from 'react'

import styles from './ProjectProfile.module.css'
import { FormattedMessage } from 'react-intl'
import 'react-responsive-carousel/lib/styles/carousel.min.css'
import { Carousel } from 'react-responsive-carousel'
import { VerifiedPartner } from '../../interfaces/VerifiedPartner'
import { PartnerProject } from '../../interfaces/PartnerProject'
import ReactMarkdown from 'react-markdown'
import BackButton from '../BackButton/BackButton'
import { trackLink } from '../utils'
import Youtube from '../Icons/Youtube'

interface Props {
  project: PartnerProject
  partner: VerifiedPartner
}

const DATA_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL

function ProjectProfile({ project, partner }: Props) {
  const PROJECT_WEBSITE = project.link || ''
  const PARTNER_PROFILE_URL = `/profile/${partner.slug}`

  const images = [project.image_1, project.image_2, project.image_3, project.image_4, project.image_5]
    .filter((img) => img)
    .map((image) => (
      <img key={image} className={styles.image_img} src={`${DATA_URL}/assets/${image}?key=project-img`} />
    ))

  const videos = [project.video_1, project.video_2]
    .filter((vid) => vid)
    .map((video_url) => {
      const videoId = (video_url || '').match(/v=([\w-]*)/)
      const listId = (video_url || '').match(/list=([\w-]*)/)

      if (videoId) {
        return (
          <iframe
            key={`${videoId}`}
            height="450"
            src={`https://www.youtube.com/embed/${videoId[1]}`}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          ></iframe>
        )
      } else if (listId) {
        return (
          <iframe
            key={`${listId}`}
            height="450"
            src={`https://www.youtube.com/embed/videoseries?list=${listId[1]}`}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          ></iframe>
        )
      } else {
        return
      }
    })

  const carouselItems = [...images, ...videos] as ReactElement[]

  const renderThumbs = (elements: any) => {
    const thumbs = []
    for (const item of elements) {
      if (item.type === 'img') {
        thumbs.push(item)
      } else if (item.type === 'iframe') {
        thumbs.push(<Youtube key={item.key} />)
      }
    }
    return thumbs
  }

  const customComponents: object = {
    a({ href, children }: { href: string; children: string }) {
      return (
        <a
          href={href}
          target="_blank"
          onClick={() => trackLink('Open External Link', 'Description Link', href)}
          rel="noreferrer"
        >
          {children}
        </a>
      )
    },
  }

  return (
    <div className={styles.container}>
      <div>
        <BackButton url={PARTNER_PROFILE_URL} />
      </div>
      <div className={styles.container__content}>
        <div className={styles.info_panel}>
          <div className={styles.name}>{project.title}</div>
        </div>
        <div className={styles.info_panel}>
          <div className={styles.image_container}>
            <Carousel
              infiniteLoop
              showArrows={true}
              showThumbs={true}
              showStatus={false}
              showIndicators={false}
              renderThumbs={renderThumbs}
            >
              {carouselItems}
            </Carousel>
          </div>
          <div className={styles.info_about}>
            <div className={styles.project_description}>
              <div className={styles.info_title}>
                <FormattedMessage id="project.about" />
              </div>
              <ReactMarkdown className={styles.description} components={customComponents}>
                {project.description}
              </ReactMarkdown>
              {project.link && (
                <div className={styles.info_external_link}>
                  <a
                    href={PROJECT_WEBSITE}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => trackLink('Open External Link', 'Project Link', PROJECT_WEBSITE)}
                  >
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
                <a href={PARTNER_PROFILE_URL}>
                  <div
                    className={styles.partner_logo}
                    style={{
                      background: `url(${DATA_URL}/assets/${partner.logo}?key=logo)`,
                    }}
                  ></div>
                </a>

                <div className={styles.partner_name}>
                  <a href={PARTNER_PROFILE_URL}>{partner.name}</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectProfile
