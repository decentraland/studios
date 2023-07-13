import React, { useEffect, useState } from 'react'

import styles from './JobSharing.module.css'
import { useRouter } from 'next/router'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'
import { trackLink } from '../utils'
import { Job } from '../../interfaces/Job'
import MarkdownDescription from '../MarkdownDescription/MarkdownDescription'
import Link from 'next/link'
import Empty from '../Icons/Empty'
import IconEye from '../Icons/IconEye'

const JOIN_REGISTRY_URL = 'https://dclstudios.typeform.com/to/NfzmbzXi'


function JobSharing() {
  const [projectOk, setProjectOk] = useState(false)
  const [isLoading, setLoading] = useState(true)
  const [jobData, setJobData] = useState<Job>({} as Job)
  
  const router = useRouter()
  const { id } = router.query
  
  useEffect(() => {
    if (id) {
      setLoading(true)
      fetch(`/api/jobs/view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: id })
      })
      .then((res) => {
        setProjectOk(res.ok)
        setLoading(false)
        return res.json()
      })
      .then((data) => {
        setJobData(data)
      })
    } else {
      setProjectOk(false)
      setLoading(false)
    }
  }, [id])
  
  const join_link = <a target={'_blank'}
    href={JOIN_REGISTRY_URL}
    rel="noreferrer"
    onClick={() => trackLink('Open External Link', 'Join Registry', JOIN_REGISTRY_URL)}>Sign up instead.</a>

  const ctaHighlight = () => {
    const ctaContainer = document.getElementById('preview_message');
    ctaContainer && ctaContainer.classList.add(styles.previewMessage_Highlight)

    setTimeout(() => {
        ctaContainer && ctaContainer.classList.remove(styles.previewMessage_Highlight);
      }, 3000);
}

  if (isLoading) return <Loader active>Loading...</Loader>

  if (!projectOk) return <div className={styles.subtitle} style={{ margin: 'auto' }}>
      <Empty />
      <br/>
      Sorry, we can&apos;t find this project.<br /> This could be due to an old link.
    </div>

  return <div className={styles.container}>
    
    <div className={styles.jobContainer}>
      <div className={styles.jobAuthor}>Project created by <span className={styles.blurText} onClick={ctaHighlight}>Undisclosed</span>{jobData.company && <> from <span className={styles.blurText} onClick={ctaHighlight}>Undisclosed</span></>}</div>
      <div className={styles.jobTitle}>{jobData.title}</div>
      <div className={styles.jobSectionTitle}>SHORT DESCRIPTION</div>
      <div className={styles.jobText}>{jobData.short_description}</div>
      <div className={styles.jobSectionTitle}>FULL DESCRIPTION</div>
      <MarkdownDescription className={styles.jobText} description={jobData.long_description} />
      <div className={styles.jobSectionTitle}>BUDGET</div>
      <div className={styles.jobText}><span className={styles.blurText} onClick={ctaHighlight}>$0000 to $0000</span></div>
      {jobData.deadline_date && <>
        <div className={styles.jobSectionTitle}>DEADLINE FOR THIS PROJECT</div>
        <div className={styles.jobText}>{jobData.deadline_date}</div>
      </>}
      <div className={styles.previewMessage} id="preview_message">
        <div className={styles.previewTitle}><IconEye /> You&apos;re reading a preview of his project</div>
        <div className={styles.previewText}>
          This opportunity is exclusive to Decentraland Studios.
          Sign in to read all details and apply for this project.
        </div>
        <div className={styles.previewButtons}>
        <Link prefetch={false} href={'/jobs/list'} legacyBehavior ><div className='button_primary--inverted'>SIGN IN</div></Link> <div className={styles.previewButtonsText}>Not a Decentraland Studio? {join_link}</div>
        </div>
      </div>
    </div>
  </div>
}

export default JobSharing