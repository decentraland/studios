import React, { useEffect, useState } from 'react'
import { VerifiedPartner } from '../../interfaces/VerifiedPartner'

import styles from './ReviewVerify.module.css'
import { FormattedMessage } from 'react-intl'
import { useRouter } from 'next/router'
import { PartnerReview } from '../../interfaces/PartnerReview'
import Link from 'next/link'
import ReviewCard from '../ReviewCard/ReviewCard'

function ReviewVerify() {
  const [data, setData] = useState(null)
  const [isLoading, setLoading] = useState(true)

  const router = useRouter()
  const { uuid } = router.query

  useEffect(() => {
    if (uuid){
      setLoading(true)
      fetch(`/api/reviews/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({uuid: uuid})
        })
        .then((res) => res.json())
        .then((data) => {
          setData(data)
          setLoading(false)
        })
    }
  
  }, [uuid])

  if (isLoading) return <div className={styles.title}>Loading</div>

  if (!data ) return <p>No profile data</p>

  const review = data['review'] as PartnerReview
  const partner = data['partner'] as VerifiedPartner

  return <div className={styles.container}>
    <ReviewCard review={review} />
      <div className={styles.title}>
        <FormattedMessage id="review.verify.title" />
      </div>
      <div className={styles.subtitle}>
        <FormattedMessage
          id="review.verify.subtitle"
          values={{
            a1: (chunk) => <Link className={styles.link}
                  href={`/profile/${partner.slug}`}>
                {partner.name}
                {chunk}
              </Link>
            ,
          }}
        />
      </div>
    </div>

  
}

export default ReviewVerify
