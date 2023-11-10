import React, { useState } from 'react'
import { VerifiedPartner } from '../../interfaces/VerifiedPartner'

import styles from './ReviewSubmitForm.module.css'
import { FormattedMessage } from 'react-intl'

interface Props {
  partner: VerifiedPartner
}

const DATA_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL
const REVIEW_MAX_LENGTH = 400

function ReviewSubmitForm({ partner }: Props) {
  const initData = {
    profile: partner.id,
    name: '',
    company: '',
    email: '',
    review: '',
  }

  const [formData, setFormData] = useState(initData)
  const [verifyMail, setVerifyMail] = useState('')

  const remainCharsText = `${formData.review.length}/${REVIEW_MAX_LENGTH}`

  const emptyFields = !Object.values(formData).every((val) => val)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const verification = await fetch(`/api/reviews/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ review: formData }),
    })
    if (verification.ok) {
      const respData = await verification.json()
      setVerifyMail(respData.email)

    } else {
      console.log(verification)
    }
  }

  const handleInput = (e: React.FormEvent) => {
    const element = e.currentTarget as HTMLInputElement

    setFormData({
      ...formData,
      [element.id]: element.value,
    })
  }

  if (verifyMail) {
    return <div className={styles.confirm_container}>
      <img alt='Check your email' src="/images/check_mail.png" />
      <div className={styles.confirm_title}>
        <FormattedMessage id="review.submit.confirm_title" />
      </div>
      <div className={styles.confirm_text}>
        <FormattedMessage id="review.submit.confirm_text" />
        <b>{verifyMail}</b>
      </div>
    </div>
  }

  return <div className={styles.container}>
    <div className={styles.image}
      style={{
        background: `url(${DATA_URL}/assets/${partner.logo}?key=logo)`,
      }}
    />
    <div className={styles.title}>
      <FormattedMessage id="review.submit.form_title" />
      {partner.name}
    </div>
    <div className={styles.description}>
      <FormattedMessage
        id="review.submit.form_header"
        values={{
          name: () => partner.name,
          a1: (chunks) => (
            <a
              className={styles.link}
              target={'_blank'}
              href={`/profile/${partner.slug}`}
              rel="noreferrer"
            >
              {chunks}
            </a>
          ),
        }}
      />
    </div>
    <form onSubmit={handleSubmit}>
      <label className={styles.label}>Your name</label>
      <input className={styles.input} type="text" required id="name" value={formData.name} onChange={handleInput} />
      <label className={styles.label}>Your company</label>
      <input
        className={styles.input}
        type="text"
        required
        id="company"
        value={formData.company}
        onChange={handleInput}
      />
      <label className={styles.label}>Your email</label>
      <input
        className={styles.input}
        type="email"
        required
        id="email"
        value={formData.email}
        onChange={handleInput}
      />
      <div className={styles.text_secondary}>Your email will not be shared publicly</div>
      <label className={styles.label}>Review</label>
      <div className={styles.text}>
        Use this review to mention their expertise, the quality of their work, their communication skills and
        professionalism. Feel free to mention if you would work with them again.
      </div>
      <textarea
        className={styles.input_long}
        required
        maxLength={REVIEW_MAX_LENGTH}
        id="review"
        value={formData.review}
        onChange={handleInput}
        placeholder="Your comments go here"
      />
      <div className={styles.text_secondary}>{remainCharsText}</div>
      <input
        className={`${styles.submit_btn} ${emptyFields ? styles.submit_btn_disabled : ''}`}
        disabled={emptyFields}
        type="submit"
        value="SUBMIT REVIEW"
      />
    </form>
  </div>

}

export default ReviewSubmitForm
