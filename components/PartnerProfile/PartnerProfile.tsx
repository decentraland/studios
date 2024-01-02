import React, { useEffect, useState } from 'react'
import { FormattedMessage } from 'react-intl'
import dynamic from 'next/dynamic'

import { VerifiedPartner, Service } from '../../interfaces/VerifiedPartner'
import ServiceTag from '../ServiceTag/ServiceTag'
import Discord from '../Icons/Discord'
import Email from '../Icons/Email'
import Instagram from '../Icons/Instagram'
import Linkedin from '../Icons/Linkedin'
import Twitter from '../Icons/Twitter'
import Youtube from '../Icons/Youtube'
import Website from '../Icons/Website'
import Marketplace from '../Icons/Marketplace'
import Opensea from '../Icons/Opensea'
import Empty from '../Icons/Empty'
import Icon from '../Icon/Icon'

import styles from './PartnerProfile.module.css'
import BackButton from '../BackButton/BackButton'
import DetailsList from '../DetailsList/DetailsList'
// import ProjectCard from '../ProjectCard/ProjectCard'
// import ReviewCard from '../ReviewCard/ReviewCard'
import MarkdownDescription from '../MarkdownDescription/MarkdownDescription'

import { trackLink } from '../utils'
import IconX from '../Icons/IconX'
import Form from '../Form/Form'
import IconInfo from '../Icons/IconInfo'
import { useUser } from '../../clients/Sessions'

const ProjectCard = dynamic(() => import('../ProjectCard/ProjectCard'), {
  ssr: false,
})

const ReviewCard = dynamic(() => import('../ReviewCard/ReviewCard'), {
  ssr: false,
})

interface Props {
  partner: VerifiedPartner
}

const DATA_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL
const SERVICES = Object.values(Service)
const REPORT_URL = process.env.NEXT_PUBLIC_REPORT_URL

function PartnerProfile({ partner }: Props) {
  const [currentTab, setCurrentTab] = useState('work')
  const [projectsLimit, setProjectsLimit] = useState(6)
  const [reviewsLimit, setReviewsLimit] = useState(4)
  const [partnerData, setPartnerData] = useState<VerifiedPartner>(partner)
  const [showContactModal, setShowContactModal] = useState(false)

  const { user } = useUser()

  useEffect(() => {
    fetch(`/api/get/studio`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          slug: partner.slug
        })
      }).then(res => res.ok && res.json())
      .then((data) => {
        setPartnerData(data)
      })
      .catch((err) => console.log(err))
  }, [])

  const displayServices = partnerData.services || [].filter((service) => SERVICES.includes(service))

  const renderProjects = partnerData.projects?.slice(0, projectsLimit)

  const renderReviews = partnerData.reviews?.slice(0, reviewsLimit)

  const ContactModal = () => {
    const [email, setEmail] = useState('')
    const [message, setMessage] = useState('')
    const [step, setStep] = useState(0)

    const disabled = !user && !email || !message

    const closeModal = () => {
      setShowContactModal(false)
      setEmail('')
      setMessage('')
      setStep(0)
    }

    const handleSubmit = async () => {

      const senderEmail = user ? user.email : email

      setEmail(senderEmail)

      await fetch(`/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          partnerEmail: partnerData.email,
          senderEmail,
          message: message
        })
      }).then(res => res.ok && setStep(1))
    }

    return <>
      {step === 0 && <><div className={styles.modalOverlay} onClick={closeModal} />
        <div className={styles.modalContainer}>
          <div className={styles.modalTitle}>Contact {partnerData.name}<IconX gray onClick={closeModal} /></div>
          <div>Write a message for {partnerData.name} detailing what you’re looking for. When they reply, you will receive an email notification.</div>
          {!user && <div>
            <div className={styles.modalSubtitle}>Your email</div>
            <Form.InputText type="email" placeholder="example@email.com" value={email} onChange={(e) => setEmail(e.currentTarget.value)} />
            <Form.FieldMessage message={`Your email will be shared with ${partnerData.name}`} icon="info" />
          </div>}
          <div>
            <div className={styles.modalSubtitle}>Message</div>
            <textarea
              className={styles.input_long}
              required
              maxLength={400}
              id="message"
              value={message}
              onChange={(e) => setMessage(e.currentTarget.value)}
              placeholder="Example message"
            />
            <Form.ButtonSubmit value="SEND" disabled={disabled} onClick={handleSubmit} />
          </div>
        </div></>}

      {step === 1 && <><div className={styles.modalOverlay} onClick={closeModal} />
        <div className={styles.modalContainer}>
          <div className={styles.modalTitle}><span></span><IconX gray onClick={closeModal} /></div>
          <div className={styles.modalSucces}>
            <img className={styles.modalImage} alt='Welcome to Decentraland Studios!' src="/images/done_circle.webp" />
            <div className={styles.modalSubtitle}>Message sent!</div>
            You will receive an email notification to <b>{email}</b> when {partnerData.name} reply.
          </div>
        </div></>}
    </>
  }

  const profileHeader = partnerData.profile_header ? {
    backgroundImage: `url(${DATA_URL}/assets/${partnerData.profile_header})`
  } : {
    ackgroundPosition: 'right',
    backgroundSize: 'cover',
    backgroundImage: `url(/images/header_profiles.webp)`
  }

  return (
    <div className={styles.container}>
      <div className={styles.container__backButton}>
        <BackButton />
      </div>
      <div className={styles.container__content}>
        {showContactModal && <ContactModal />}

        <div className={styles.header_panel}>

          <div className={styles.header_up} style={profileHeader}></div>
          <div className={styles.header_down}>
            <div className={styles.header_info}>
              <div
                className={styles.image}
                style={{
                  background: `url(${DATA_URL}/assets/${partnerData.logo}?key=logo) #FFFFFF`,
                }}
              />
              <div className={styles.name}>{partnerData.name}</div>
              <div className={styles.meta}>
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
                    url={`mailto:${partnerData.email}?bcc=studios@decentraland.org&subject=Work Inquiry - Project in Decentraland&body=${encodeURI(`Hello ${partnerData.name},
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
                <div className='button_primary button_primary--small' onClick={() => setShowContactModal(true)}>CONTACT</div>
              </div>

            </div>
          </div>
          <div className={styles.header_navigation}>
            <div onClick={() => setCurrentTab('work')}
              className={`${styles.navigation_badge} ${currentTab === 'work' ? styles['navigation_badge--active'] : ''}`}>
              Work
            </div>
            <div onClick={() => setCurrentTab('about')}
              className={`${styles.navigation_badge} ${currentTab === 'about' ? styles['navigation_badge--active'] : ''}`}>About</div>
            <div onClick={() => setCurrentTab('reviews')}
              className={`${styles.navigation_badge} ${currentTab === 'reviews' ? styles['navigation_badge--active'] : ''}`}>
              Reviews
            </div>
          </div>
        </div>
        {currentTab === 'about' &&
          <div className={styles.info_panel}>
            <div className={styles.info_about}>
              <div className={styles.info_title}>
                <FormattedMessage id="about" /> {partnerData?.name?.toUpperCase()}
              </div>
              <MarkdownDescription className={styles.description} description={partnerData.description} />

            </div>
            <div className={styles.table_container}>
              <div className={styles.pills}>
                <div className={styles.info_title}>
                  Services provided
                </div>
                {displayServices.map((service, i) => (
                  <span key={`${service}-${i}`} className={styles.services}>
                    <ServiceTag type={service} active />

                  </span>
                ))}
              </div>
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
              <a className={styles.report_link}
                href={REPORT_URL}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackLink('Open External Link', 'Report Studio', `${REPORT_URL}`)}
              >
                Report this studio
              </a>
            </div>
          </div>
        }
        {currentTab === 'work' &&
          <div>
            {partnerData.projects?.length ? (
              <>
                <div className={styles.projects_grid}>
                  {renderProjects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
                {renderProjects.length < partnerData.projects.length &&
                  <div className={styles.load_more_container}>
                    <div className={'button_primary--inverted'} onClick={() => setProjectsLimit(projectsLimit + 6)}>LOAD MORE</div>
                  </div>}
              </>
            ) : (
              <div className={styles.empty}>
                <Empty gray />
                <FormattedMessage id="noProjects" />
              </div>
            )}
          </div>
        }
        {currentTab === 'reviews' &&
          <div>
            <div className={`${styles.info_title} mt-3r`}>
            </div>
            {partnerData.reviews?.length ? (
              <>
                <div className={styles.reviews_grid}>
                  {renderReviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
                {renderReviews.length < partnerData.reviews.length &&
                  <div className={styles.load_more_container}>
                    <div className={'button_primary--inverted'} onClick={() => setReviewsLimit(reviewsLimit + 4)}>LOAD MORE</div>
                  </div>}
                <a className={`button_basic ${styles.leave_review}`} href={`/reviews/submit/${partnerData.slug}`} target="_blank" rel="noreferrer">LEAVE A REVIEW</a>

              </>
            ) : (
              <div className={styles.empty}>
                This studio hasn’t received a review yet.<br />
                Have you worked with them?&nbsp;<a href={`/reviews/submit/${partnerData.slug}`} target="_blank" rel="noreferrer">Leave a review.</a>
              </div>
            )}
          </div>
        }

      </div>

    </div>
  )
}

export default PartnerProfile
