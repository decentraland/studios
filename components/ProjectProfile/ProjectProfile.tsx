import React, { ReactElement, useEffect, useState } from 'react'

import { FormattedMessage } from 'react-intl'
import styles from './ProjectProfile.module.css'
import { PartnerProject } from '../../interfaces/PartnerProject'
import BackButton from '../BackButton/BackButton'
import { trackLink } from '../utils'
import MarkdownDescription from '../MarkdownDescription/MarkdownDescription'
import ServiceTag from '../ServiceTag/ServiceTag'
import Link from 'next/link'

interface Props {
  project: PartnerProject
}

const DATA_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL

const getVideoId = (video_url: any) => video_url.match(/v=([\w-]*)/)
const getListId = (video_url: any) => video_url.match(/list=([\w-]*)/)


function ProjectProfile({ project }: Props) {

  const [ projectData, setProjectData ] = useState<PartnerProject>(project)

  useEffect(() => {
		fetch(`/api/get/project`,
    {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id: project.id })
    }).then(res => res.ok && res.json())
		  .then((data) => setProjectData(data))
		  .catch((err) => console.log(err))
	}, [])

  const PROJECT_WEBSITE = projectData.link || ''
  const PARTNER_PROFILE_URL = `/profile/${projectData.profile?.slug}`

  const images = [ projectData.image_1, projectData.image_2, projectData.image_3, projectData.image_4, projectData.image_5 ]
    .filter((img) => img)
    .map((image, i) => ( <div className={styles.image_container} key={image}>
        <img className={styles.image} src={`${DATA_URL}/assets/${image}?key=project-img`} alt="Project image" loading={i === 0 ? "eager" : "lazy"}/>
        </div>
    ))

  const videos = [projectData.video_1, projectData.video_2]
    .filter((video_url) => video_url && (getVideoId(video_url) || getListId(video_url)))
    .map((video_url, i) => {
      const videoId = getVideoId(video_url)
      const listId = getListId(video_url)

      if (videoId) {
        return (
          <iframe
            key={`${videoId}`}
            className={styles.video}
            loading={i === 0 ? "eager" : "lazy"}
            src={`https://www.youtube.com/embed/${videoId[1]}`}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          ></iframe>
        )
      } else if (listId) {
        return (
          <iframe
            key={`${listId}`}
            loading={i === 0 ? "eager" : "lazy"}
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

  return (
    <div className={styles.container}>
      <div>
        <BackButton />
      </div>
      <div className={styles.container__content}>
        <div className={styles.title}>{projectData.title}</div>

        {carouselItems[0]}

        <div className={styles.info_panel}>
          <div className={styles.info_about}>
            <div className={styles.project_description}>
              <div className={styles.info_title}>
                <FormattedMessage id="project.about" />
              </div>
              <MarkdownDescription className={styles.description} description={projectData.description} />
              {projectData.link && (
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
              {projectData.service_tags ? <>
                <div className={styles.services_panel}>
                  <FormattedMessage id={'services'} />
                </div>
                <div className={styles.pills}>
                  {projectData.service_tags.map(service => 
                        <Link key={`${service}`} className={styles.services} href={`/projects?service_tags=${service}`}>
                        <ServiceTag type={service} active/>
                        </Link>
                  )}
                </div>
              </> : null}
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
                      background: `url(${DATA_URL}/assets/${projectData.profile.logo}?key=logo)`,
                    }}
                  ></div>
                </a>

                <div className={styles.partner_name}>
                  <a href={PARTNER_PROFILE_URL}>{projectData.profile.name}</a>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {carouselItems.slice(1)}
      
      </div>
    </div>
  )
}

export default ProjectProfile
