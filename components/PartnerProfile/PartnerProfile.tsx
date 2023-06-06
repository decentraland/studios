import React, { useEffect, useState } from 'react'
import { VerifiedPartner, Service } from '../../interfaces/VerifiedPartner'
import ServiceTag from '../ServiceTag/ServiceTag'
import Discord from '../Icons/Discord'
import Email from '../Icons/Email'
import Instagram from '../Icons/Instagram'
import Linkedin from '../Icons/Linkedin'
import Twitter from '../Icons/Twitter'
import Youtube from '../Icons/Youtube'
import Website from '../Icons/Website'
import BackButton from '../BackButton/BackButton'

// import 'decentraland-ui/lib/styles.css'
import styles from './PartnerProfile.module.css'
import Marketplace from '../Icons/Marketplace'
import Opensea from '../Icons/Opensea'
import Icon from '../Icon/Icon'
import { FormattedMessage } from 'react-intl'
import DetailsList from '../DetailsList/DetailsList'
import { PartnerProject } from '../../interfaces/PartnerProject'
import ProjectCard from '../ProjectCard/ProjectCard'
import Empty from '../Icons/Empty'

import { trackLink } from '../utils'
import MarkdownDescription from '../MarkdownDescription/MarkdownDescription'
import { PartnerReview } from '../../interfaces/PartnerReview'
import ReviewCard from '../ReviewCard/ReviewCard'

interface Props {
  partner: VerifiedPartner
  projects: PartnerProject[]
  reviews: PartnerReview[]
}

const DATA_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL
const SERVICES = Object.values(Service)

function PartnerProfile({ partner, projects, reviews }: Props) {
  const [projectsLimit, setProjectsLimit] = useState(6)
  const [reviewsLimit, setReviewsLimit] = useState(4)
  const [partnerData, setPartnerData] = useState<VerifiedPartner>(partner)
  const [projectsData, setProjectsData] = useState<PartnerProject[]>(projects)
  const [reviewsData, setReviewsData] = useState<PartnerReview[]>(reviews)


  useEffect(() => {
		fetch(`/api/get/studio`,
    {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        slug: partner.slug,
        id: partner.id
       })
    }).then(res => res.ok && res.json())
		  .then((data) => {
        setPartnerData(data.studio)
        setProjectsData(data.projects)
        setReviewsData(data.reviews)
      })
		  .catch((err) => console.log(err))
	}, [])

  const WEBSITE = partnerData.website || ''
  const REPORT_URL = 'https://dclstudios.typeform.com/to/HQpD0z5S'

  const displayServices = partnerData.services || [].filter((service) => SERVICES.includes(service))

  const renderProjects = projectsData.slice(0, projectsLimit)
  
  const renderReviews = reviewsData.slice(0, reviewsLimit)

  return (
    <div className={styles.container}>
      <div className={styles.container__backButton}>
        <BackButton />
      </div>
      <div className={styles.container__content}>
        <div className={styles.info_panel}>
          <div className={styles.info_id}>
            <a
              href={WEBSITE}
              target="_blank"
              rel="noreferrer"
              onClick={() => trackLink('Open External Link', 'Profile Logo', WEBSITE)}
            >
              <div
                className={styles.image}
                style={{
                  background: `url(${DATA_URL}/assets/${partnerData.logo}?key=logo)`,
                }}
              />
            </a>
            <div className={styles.header_info}>
              <div className={styles.name}>{partnerData.name}</div>
              <div className={styles.meta}>
                <div>
                  {partnerData.website && (
                    <Icon
                      url={partnerData.website}
                      icon={<Website />}
                      onClick={() => trackLink('Open External Link', 'Click Website', partnerData.website as string)}
                    />
                  )}
                  {partnerData.marketplace && (
                    <Icon
                      url={partnerData.marketplace}
                      icon={<Marketplace />}
                      onClick={() =>
                        trackLink('Open External Link', 'Click Marketplace', partnerData.marketplace as string)
                      }
                    />
                  )}
                  {partnerData.email && (
                    <Icon
                      url={`mailto:${partnerData.email}?bcc=studios@decentraland.org&subject=Work Inquiry - Project in Decentraland&body=${
                        encodeURI(`Hello ${partnerData.name},
                      I am interested in hiring your services for an upcoming Decentraland project. I found your studio listed in the Decentraland Verified Partners Registry and wanted to inquire about a potential collaboration.
                      
                      If you are interested, please get back to me to discuss the details.
                      
                      Thank you!`)}`}
                      icon={<Email />}
                      onClick={() => trackLink('Open External Link', 'Click Email', partnerData.email as string)}
                    />
                  )}
                  {partnerData.discord && (
                    <Icon
                      url={partnerData.discord}
                      icon={<Discord />}
                      onClick={() => trackLink('Open External Link', 'Click Discord', partnerData.discord as string)}
                    />
                  )}
                  {partnerData.opensea && (
                    <Icon
                      url={partnerData.opensea}
                      icon={<Opensea />}
                      onClick={() => trackLink('Open External Link', 'Click Opensea', partnerData.opensea as string)}
                    />
                  )}
                  {partnerData.twitter && (
                    <Icon
                      url={partnerData.twitter}
                      icon={<Twitter />}
                      onClick={() => trackLink('Open External Link', 'Click Twitter', partnerData.twitter as string)}
                    />
                  )}
                  {partnerData.instagram && (
                    <Icon
                      url={partnerData.instagram}
                      icon={<Instagram />}
                      onClick={() => trackLink('Open External Link', 'Click Instagram', partnerData.instagram as string)}
                    />
                  )}
                  {partnerData.linkedin && (
                    <Icon
                      url={partnerData.linkedin}
                      icon={<Linkedin />}
                      onClick={() => trackLink('Open External Link', 'Click Linkedin', partnerData.linkedin as string)}
                    />
                  )}
                  {partnerData.youtube && (
                    <Icon
                      url={partnerData.youtube}
                      icon={<Youtube />}
                      onClick={() => trackLink('Open External Link', 'Click Youtube', partnerData.youtube as string)}
                    />
                  )}
                </div>
              </div>
              <div className={styles.meta}>
                <div className={styles.pills}>
                  {displayServices.map((service, i) => (
                    <span key={`${service}-${i}`} className={styles.services}>
                      <ServiceTag type={service} active />
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
            <MarkdownDescription className={styles.description} description={partnerData.description} />
          </div>
          <div className={styles.table_container}>
            <div className={styles.info_details}>
              <div>
                <div>
                  <FormattedMessage id="region" />
                </div>
                <div>
                  <p>{partnerData.region}</p>
                </div>
              </div>
              <div>
                <div>
                  <FormattedMessage id="country" />
                </div>
                <div>
                  <p>{partnerData.country}</p>
                </div>
              </div>
            </div>
            <div className={`${styles.info_details} ${styles['info_details--border']}`}>
              <div>
                <div>
                  <FormattedMessage id="team_size" />
                </div>
                <div>
                  <p>{partnerData.team_size}</p>
                </div>
              </div>
              <div>
                <div>
                  <FormattedMessage id="languages" />
                </div>
                <div>
                  <p>{!!partnerData.languages && <DetailsList list={partnerData.languages} />}</p>
                </div>
              </div>
            </div>
            <div className={`${styles.info_details} ${styles['info_details--border']}`}>
              <div>
                <div>
                  <FormattedMessage id="payment_methods" />
                </div>
                <div>
                  <p>{!!partnerData.payment_methods && <DetailsList list={partnerData.payment_methods} />}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className={`${styles.info_title} mt-3r`}>
            <FormattedMessage id="projects" />
          </div>
          {projectsData.length ? (
            <>
              <div className={styles.projects_grid}>
                {renderProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
              {renderProjects.length < projectsData.length && 
                <div className={styles.load_more_container}>
                  <div className={'button_primary--inverted'} onClick={() => setProjectsLimit(projectsLimit + 6)}>LOAD MORE</div>
                </div>}
            </>
          ) : (
            <div className={styles.empty}>
              <Empty />
              <FormattedMessage id="noProjects" />
            </div>
          )}
        </div>
        <div>
          <div className={`${styles.info_title} mt-3r`}>
            <FormattedMessage id="reviews" />
            <a className='button_basic' href={`/reviews/submit/${partnerData.slug}`} target="_blank" rel="noreferrer">LEAVE A REVIEW</a>
          </div>
          {reviewsData.length ? (
            <>
              <div className={styles.reviews_grid}>
                {renderReviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
              {renderReviews.length < reviewsData.length && 
                <div className={styles.load_more_container}>
                  <div className={'button_primary--inverted'} onClick={() => setReviewsLimit(reviewsLimit + 4)}>LOAD MORE</div>
                </div>}
            </>
          ) : (
            <div className={styles.empty}>
              <Empty />
              <FormattedMessage id="noReviews" />
            </div>
          )}
        </div>
          <a className={styles.report_link}
            href={REPORT_URL}
            target="_blank"
            rel="noreferrer"
            onClick={() => trackLink('Open External Link', 'Report Studio', REPORT_URL)}
          >
            Report this studio
          </a>
      </div>
    </div>
  )
}

export default PartnerProfile
