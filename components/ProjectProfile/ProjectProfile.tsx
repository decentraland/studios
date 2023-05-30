import React, { ReactElement } from 'react'

import 'react-responsive-carousel/lib/styles/carousel.min.css'
import styles from './ProjectProfile.module.css'
import { FormattedMessage } from 'react-intl'
import { Carousel } from 'react-responsive-carousel'
import { PartnerProject } from '../../interfaces/PartnerProject'
import BackButton from '../BackButton/BackButton'
import { trackLink } from '../utils'
import Youtube from '../Icons/Youtube'
import MarkdownDescription from '../MarkdownDescription/MarkdownDescription'

interface Props {
  project: PartnerProject
}

const DATA_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL

const getVideoId = (video_url: any) => video_url.match(/v=([\w-]*)/)
const getListId = (video_url: any) => video_url.match(/list=([\w-]*)/)


function ProjectProfile({ project }: Props) {
  const PROJECT_WEBSITE = project.link || ''
  const PARTNER_PROFILE_URL = `/profile/${project.profile?.slug}`

  const images = [project.image_1, project.image_2, project.image_3, project.image_4, project.image_5]
    .filter((img) => img)
    .map((image) => (
      <img key={image} className={styles.image_img} src={`${DATA_URL}/assets/${image}?key=project-img`} />
    ))

  const videos = [project.video_1, project.video_2]
    .filter((video_url) => video_url && (getVideoId(video_url) || getListId(video_url)))
    .map((video_url) => {
      const videoId = getVideoId(video_url)
      const listId = getListId(video_url)

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

  const carouselItems = [...videos, ...images] as ReactElement[]

  const renderThumbs = (elements: any) => {
    const thumbs = []
    for (const item of elements) {
      if (item.type === 'img') {
        thumbs.push(item)
      } else if (item.type === 'iframe') {
        const vidId= item.key.split(',')[1]
        
        thumbs.push(
          <div key={item.key} className={styles.youtubeThumb_container}>
            <img alt='Youtube video' src={`https://img.youtube.com/vi/${vidId}/0.jpg`} />
            <div className={styles.youtubeThumb_play}><Youtube color={'red'} /></div>
          </div>)
      }
    }
    return thumbs
  }

  return (
    <div className={styles.container}>
      <div>
        <BackButton />
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
              <MarkdownDescription className={styles.description} description={project.description} />
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
                      background: `url(${DATA_URL}/assets/${project.profile.logo}?key=logo)`,
                    }}
                  ></div>
                </a>

                <div className={styles.partner_name}>
                  <a href={PARTNER_PROFILE_URL}>{project.profile.name}</a>
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
