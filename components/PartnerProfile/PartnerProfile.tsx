import React, { useState } from 'react'
import { VerifiedPartner, Service } from '../../interfaces/VerifiedPartner'
import CategoryPill from '../CategoryPill/CategoryPill'
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

  const WEBSITE = partner.website || ''
  const REPORT_URL = 'https://dclstudios.typeform.com/to/HQpD0z5S'

  const displayServices = partner.services || [].filter((service) => SERVICES.includes(service))

  const renderProjects = projects.slice(0, projectsLimit)
  
  const renderReviews = reviews.slice(0, reviewsLimit)

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
                  background: `url(${DATA_URL}/assets/${partner.logo}?key=logo)`,
                }}
              />
            </a>
            <div className={styles.header_info}>
              <div className={styles.name}>{partner.name}</div>
              <div className={styles.meta}>
                <div>
                  {partner.website && (
                    <Icon
                      url={partner.website}
                      icon={<Website />}
                      onClick={() => trackLink('Open External Link', 'Click Website', partner.website as string)}
                    />
                  )}
                  {partner.marketplace && (
                    <Icon
                      url={partner.marketplace}
                      icon={<Marketplace />}
                      onClick={() =>
                        trackLink('Open External Link', 'Click Marketplace', partner.marketplace as string)
                      }
                    />
                  )}
                  {partner.email && (
                    <Icon
                      url={`mailto:${partner.email}?bcc=metaverse.studios@decentraland.org&subject=Work Inquiry - Project in Decentraland&body=${
                        encodeURI(`Hello ${partner.name},
                      I am interested in hiring your services for an upcoming Decentraland project. I found your studio listed in the Decentraland Verified Partners Registry and wanted to inquire about a potential collaboration.
                      
                      If you are interested, please get back to me to discuss the details.
                      
                      Thank you!`)}`}
                      icon={<Email />}
                      onClick={() => trackLink('Open External Link', 'Click Email', partner.email as string)}
                    />
                  )}
                  {partner.discord && (
                    <Icon
                      url={partner.discord}
                      icon={<Discord />}
                      onClick={() => trackLink('Open External Link', 'Click Discord', partner.discord as string)}
                    />
                  )}
                  {partner.opensea && (
                    <Icon
                      url={partner.opensea}
                      icon={<Opensea />}
                      onClick={() => trackLink('Open External Link', 'Click Opensea', partner.opensea as string)}
                    />
                  )}
                  {partner.twitter && (
                    <Icon
                      url={partner.twitter}
                      icon={<Twitter />}
                      onClick={() => trackLink('Open External Link', 'Click Twitter', partner.twitter as string)}
                    />
                  )}
                  {partner.instagram && (
                    <Icon
                      url={partner.instagram}
                      icon={<Instagram />}
                      onClick={() => trackLink('Open External Link', 'Click Instagram', partner.instagram as string)}
                    />
                  )}
                  {partner.linkedin && (
                    <Icon
                      url={partner.linkedin}
                      icon={<Linkedin />}
                      onClick={() => trackLink('Open External Link', 'Click Linkedin', partner.linkedin as string)}
                    />
                  )}
                  {partner.youtube && (
                    <Icon
                      url={partner.youtube}
                      icon={<Youtube />}
                      onClick={() => trackLink('Open External Link', 'Click Youtube', partner.youtube as string)}
                    />
                  )}
                </div>
              </div>
              <div className={styles.meta}>
                <div className={styles.pills}>
                  {displayServices.map((service, i) => (
                    <span key={`${service}-${i}`} className={styles.services}>
                      <CategoryPill showIcon type={service} />
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
            <MarkdownDescription className={styles.description} description={partner.description} />
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
            <>
              <div className={styles.projects_grid}>
                {renderProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
              {renderProjects.length < projects.length && 
                <div className={styles.load_more_container}>
                  <div className={'button_primary--inverted'} onClick={() => setProjectsLimit(projects.length)}>LOAD MORE</div>
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
          <div className={styles.info_title}>
            <FormattedMessage id="reviews" />
            <a className='button_basic' href={`/reviews/submit/${partner.slug}`} target="_blank" rel="noreferrer">LEAVE A REVIEW</a>
          </div>
          {reviews.length ? (
            <>
              <div className={styles.reviews_grid}>
                {renderReviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
              {renderReviews.length < reviews.length && 
                <div className={styles.load_more_container}>
                  <div className={'button_primary--inverted'} onClick={() => setReviewsLimit(reviews.length)}>LOAD MORE</div>
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
