import React, { useCallback, useEffect, useState } from 'react'

import styles from './JobVerify.module.css'
import { useRouter } from 'next/router'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'
import { budgetToRanges, openIntercom } from '../utils'
import { Job } from '../../interfaces/Job'
import IconFile from '../Icons/IconFile'
import MarkdownDescription from '../MarkdownDescription/MarkdownDescription'
import IconExternal from '../Icons/IconExternal'
import Link from 'next/link'
import SetPassword from '../SetPassword/SetPassword'

const DB_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL
const VERIFY_ERROR = "We couldn't publish your project, please try again."
const SET_PASSWORD_ERROR = "Couldn't set your password, please try again."

const DECLINE_ERROR = "We couldn't remove it, please try again."

type VerifyState = 'wrongLink' | 'expired' | 'failed' | 'needsPassword' | 'verified'

function JobVerify() {
  const [verifyState, setVerifyState] = useState<VerifyState>()
  const [isLoading, setLoading] = useState(true)
  const [jobData, setJobData] = useState<Job>({} as Job)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [verifyError, setVerifyError] = useState<string>()
  // The password sent with the form wasn't set, because the account had been activated already (e.g. from another tab)
  const [alreadyActive, setAlreadyActive] = useState(false)
  const [declineState, setDeclineState] = useState<'confirming' | 'declining' | 'declined'>()
  const [declineError, setDeclineError] = useState<string>()

  const router = useRouter()
  const { id } = router.query

  // The owner of a job created along with their account sets their password before the job is published
  const verify = useCallback(async (password?: string): Promise<VerifyState> => {
    const token = new URLSearchParams(window.location.hash.slice(1)).get('token')
    const res = await fetch(`/api/jobs/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: id, token, password })
    })

    if (res.ok) {
      const { alreadyActive, ...job } = await res.json()
      setJobData(job)
      setAlreadyActive(!!alreadyActive)
      return 'verified'
    }
    if (res.status === 410) {
      await res.body?.cancel()
      return 'expired'
    }
    if (res.status === 409) {
      const body = await res.json().catch(() => undefined)
      if (body?.needsPassword) {
        setJobData(body.job || {})
        return 'needsPassword'
      }
      return 'failed'
    }
    await res.body?.cancel()
    return res.status === 400 ? 'wrongLink' : 'failed'
  }, [id])

  useEffect(() => {
    if (id) {
      setLoading(true)
      verify()
        .then(setVerifyState)
        .catch(() => setVerifyState('failed'))
        .finally(() => setLoading(false))
    }
  }, [id, verify])

  // The link was already accepted: a failure here is retried from the form, it doesn't mean the link is wrong
  const handleSetPassword = (password: string) => {
    if (isSubmitting) return

    setVerifyError(undefined)
    setIsSubmitting(true)
    verify(password)
      .then(state => state === 'verified' || state === 'expired' ? setVerifyState(state) : setVerifyError(SET_PASSWORD_ERROR))
      .catch(() => setVerifyError(SET_PASSWORD_ERROR))
      .finally(() => setIsSubmitting(false))
  }

  // "This wasn't me": removes the job and the pending account created with this email
  const handleDecline = async () => {
    if (declineState === 'declining') return

    setDeclineError(undefined)
    setDeclineState('declining')

    try {
      const token = new URLSearchParams(window.location.hash.slice(1)).get('token')
      const res = await fetch(`/api/jobs/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: id, token, decline: true })
      })
      await res.body?.cancel()

      if (res.ok) {
        setDeclineState('declined')
        return
      }
      if (res.status === 410) {
        setVerifyState('expired')
        return
      }
      setDeclineError(DECLINE_ERROR)
      setDeclineState('confirming')
    } catch {
      setDeclineError(DECLINE_ERROR)
      setDeclineState('confirming')
    }
  }

  const shareUrl = `/jobs/share?id=${id}`
  const projectUrl = `/dashboard?id=${id}`

  const reach_out_link = <a className={styles.link} href=""
    rel="noreferrer"
    onClick={(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
      e.preventDefault()
      openIntercom()
    }}>reach out</a>


  const jobPreview = <div className={styles.jobContainer}>
    <div className={styles.jobAuthor}>Project created by <b>{jobData.author_name}</b>{jobData.company && <> from <b>{jobData.company}</b></>}</div>
    <div className={styles.jobTitle}>{jobData.title}</div>
    <div className={styles.jobSectionTitle}>SHORT DESCRIPTION</div>
    <div className={styles.jobText}>{jobData.short_description}</div>
    <div className={styles.jobSectionTitle}>FULL DESCRIPTION</div>
    <MarkdownDescription className={styles.jobText} description={jobData.long_description} />
    {jobData.brief_file && <>
      <div className={styles.jobSectionTitle}>BRIEF FILE</div>
      <div className={styles.jobText}><a className={styles.link} href={`${DB_URL}/assets/${jobData.brief_file.id}`} rel="noreferrer" target='_blank'><IconFile red /> {jobData.brief_file.filename_download}</a></div>
    </>}
    <div className={styles.jobSectionTitle}>BUDGET</div>
    <div className={styles.jobText}>{budgetToRanges(jobData.budget)}</div>
    {jobData.deadline_date && <>
      <div className={styles.jobSectionTitle}>DEADLINE FOR THIS PROJECT</div>
      <div className={styles.jobText}>{jobData.deadline_date}</div>
    </>}
  </div>

  if (isLoading) return <Loader active>Loading...</Loader>

  if (declineState === 'declined') {
    return <div className={styles.container}>
      <div className={styles.title}>
        Done, we removed it.
      </div>
    </div>
  }

  // The owner sees the project they're about to publish before choosing a password
  if (verifyState === 'needsPassword') {
    return <div className={styles.container}>
      <div className={styles.title}>
        Set a password to publish this project
      </div>
      {jobPreview}
      <SetPassword stepDescription='Choose the password you will use to log in to Decentraland Studios. Your project will be published right after.'
        isSubmitting={isSubmitting}
        error={verifyError}
        onSubmit={handleSetPassword} />
      <div className={styles.decline}>
        {!declineState && <a className={styles.link} href="" onClick={(e) => {
          e.preventDefault()
          setDeclineState('confirming')
        }}>I didn&apos;t request this. Delete this project and my email.</a>}
        {declineState && <>
          This removes the project and the account created with your email.{' '}
          <button type="button" className={styles.declineButton} disabled={declineState === 'declining'} onClick={handleDecline}>Delete them</button>
          {' '}
          <button type="button" className={styles.declineButton} disabled={declineState === 'declining'} onClick={() => {
            setDeclineError(undefined)
            setDeclineState(undefined)
          }}>Cancel</button>
          {declineError && <div className={styles.declineError} role="alert">{declineError}</div>}
        </>}
      </div>
    </div>
  }

  if (verifyState === 'expired') {
    return <div className={styles.container}>
      <div className={styles.title}>
        This link has expired
      </div>
      <div className={styles.subtitle}>
        Request a new one with the &quot;Resend verification email&quot; link on the <Link href="/signup">sign up page</Link>, after entering your email.
      </div>
    </div>
  }

  if (verifyState === 'failed') return <div className={styles.subtitle} style={{ margin: 'auto' }}>{VERIFY_ERROR}</div>

  if (verifyState !== 'verified') return <div className={styles.subtitle} style={{ margin: 'auto' }}>Wrong link</div>

  return <div className={styles.container}>
    <img className={styles.image} alt='Your job post is live' src="/images/item_ok.png" />

    <div className={styles.title}>
      You published a new project!
    </div>
    <div className={styles.subtitle}>
      Your project is now visible to all Decentraland Studios.
    </div>
    {alreadyActive && <div className={styles.subtitle}>
      Your account was already activated. <Link href="/login">Log in</Link> with the password you set earlier.
    </div>}
    <Link href={`/dashboard?id=${jobData.id}`}><div className='button_primary'>MANAGE YOUR PROJECT</div></Link>
    <div className={styles.factsContainer}>
      <div className={styles.factCard}>
        <img className={styles.factIcon} alt='calendar' src="/images/iconCalendar.png" />
        <div className={styles.factText}>
          <b>Your project will be available for 30 days after you publish it.</b> If you need to remove it sooner, you can close it on your <Link href={projectUrl} className={styles.link}>project profile</Link>.
        </div>
      </div>
      <div className={styles.factCard}>
        <img className={styles.factIcon} alt='calendar' src="/images/iconCard.png" />
        <div className={styles.factText}>
          <b>You will receive email notifications</b> when studios apply to your project. Talk to them through <Link href="/dashboard" className={styles.link}>your dashboard.</Link>
        </div>
      </div>
    </div>
    {/* <div className={styles.previewText}>
      <span>Here&apos;s a preview of your project</span>
      <Link href={shareUrl} ><span className={styles.liveText}>See it live</span><IconExternal red /></Link>
    </div>
    <div className={styles.jobContainer}>
      <div className={styles.jobAuthor}>Project created by <b>{jobData.author_name}</b>{jobData.company && <> from <b>{jobData.company}</b></>}</div>
      <div className={styles.jobTitle}>{jobData.title}</div>
      <div className={styles.jobSectionTitle}>SHORT DESCRIPTION</div>
      <div className={styles.jobText}>{jobData.short_description}</div>
      <div className={styles.jobSectionTitle}>FULL DESCRIPTION</div>
      <MarkdownDescription className={styles.jobText} description={jobData.long_description} />
      {jobData.brief_file && <>
        <div className={styles.jobSectionTitle}>BRIEF FILE</div>
        <div className={styles.jobText}><a className={styles.link} href={`${DB_URL}/assets/${jobData.brief_file.id}`} rel="noreferrer" target='_blank'><IconFile red /> {jobData.brief_file.filename_download}</a></div>
      </>}
      <div className={styles.jobSectionTitle}>BUDGET</div>
      <div className={styles.jobText}>{budgetToRanges(jobData.budget)}</div>
      {jobData.deadline_date && <>
        <div className={styles.jobSectionTitle}>DEADLINE FOR THIS PROJECT</div>
        <div className={styles.jobText}>{jobData.deadline_date}</div>
      </>}
    </div>
    <div style={{ textAlign: 'center' }} className={styles.jobAuthor}>
      If you have any questions or need help regarding your listing, don’t hesitate to {reach_out_link}.
    </div> */}
  </div>
}

export default JobVerify