import React, { useEffect, useState } from 'react'

import styles from './UserVerify.module.css'
import { useRouter } from 'next/router'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'
import Link from 'next/link'
import SetPassword from '../SetPassword/SetPassword'

const VERIFY_ERROR = "We couldn't verify your account, please try again."
const SET_PASSWORD_ERROR = "Couldn't set your password, please try again."

type VerifyState = 'loading' | 'wrongLink' | 'expired' | 'failed' | 'needsPassword' | 'alreadyActive' | 'verified'

function UserVerify() {
  const [token, setToken] = useState<string | null>()
  const [verifyState, setVerifyState] = useState<VerifyState>('loading')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [verifyError, setVerifyError] = useState<string>()

  const router = useRouter()
  const { id } = router.query

  useEffect(() => {
    setToken(new URLSearchParams(window.location.hash.slice(1)).get('token'))
  }, [])

  // The link is checked without a password first, so an already verified account isn't shown the password form
  useEffect(() => {
    if (!id || token === undefined) return
    if (!token) {
      setVerifyState('wrongLink')
      return
    }

    let cancelled = false
    fetch(`/api/user/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: id, token })
    })
      .then(async (res) => {
        const body = res.status === 200 || res.status === 409 ? await res.json().catch(() => undefined) : await res.body?.cancel()
        if (cancelled) return
        if (res.status === 200 && body?.alreadyActive) setVerifyState('alreadyActive')
        else if (res.status === 409 && body?.needsPassword) setVerifyState('needsPassword')
        else if (res.status === 410) setVerifyState('expired')
        else setVerifyState(res.status === 400 ? 'wrongLink' : 'failed')
      })
      .catch(() => !cancelled && setVerifyState('failed'))

    return () => { cancelled = true }
  }, [id, token])

  const handleSubmit = async (password: string) => {
    if (isSubmitting) return

    setVerifyError(undefined)
    setIsSubmitting(true)

    try {
      const res = await fetch(`/api/user/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: id, token, password })
      })
      const body = res.status === 200 ? await res.json().catch(() => undefined) : await res.body?.cancel()
      // Activated from another tab meanwhile: the password chosen there is the one that was set, not this one
      if (res.status === 200 && body?.alreadyActive) setVerifyState('alreadyActive')
      else if (res.ok) setVerifyState('verified')
      // The link expired while the form was open
      else if (res.status === 410) setVerifyState('expired')
      // The link was already accepted: a failure here is retried from the form, it doesn't mean the link is wrong
      else setVerifyError(SET_PASSWORD_ERROR)
    } catch {
      setVerifyError(SET_PASSWORD_ERROR)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (verifyState === 'loading') return <Loader active>Loading...</Loader>

  if (verifyState === 'wrongLink') return <div className={styles.subtitle} style={{ margin: 'auto' }}>Wrong link</div>

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

  if (verifyState === 'needsPassword') {
    return <SetPassword stepDescription='Choose the password you will use to log in to Decentraland Studios.'
      isSubmitting={isSubmitting}
      error={verifyError}
      onSubmit={handleSubmit} />
  }

  if (verifyState === 'alreadyActive') {
    return <div className={styles.container}>
      <div className={styles.title}>
        Your account is already verified
      </div>
      <div className={styles.subtitle}>
        Log in with the password you chose when you verified it.
      </div>
      <Link href="/login"><span className={`button_primary mt-3r`}>LOG IN</span></Link>
    </div>
  }

  return <div className={styles.container}>
    <img className={styles.image} alt='Welcome to Decentraland Studios!' src="/images/done_circle.webp" />

    <div className={styles.title}>
    Welcome to Decentraland Studios!
    </div>
    <div className={styles.subtitle}>
      Your account is ready. Log in to head to your dashboard, start a project and collaborate with talented studios to bring your brand to Decentraland, or take a look at our list of <Link href="/studios">verified studios.</Link>
    </div>
    <Link href="/login"><span className={`button_primary mt-3r`}>LOG IN</span></Link>

  </div>
}

export default UserVerify
