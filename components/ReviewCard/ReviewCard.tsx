import React from "react"
import { PartnerReview } from "../../interfaces/PartnerReview"
import styles from './ReviewCard.module.css'

interface Props {
    review: PartnerReview
  }

function ReviewCard({review}: Props) {
    return <div className={styles.reviewCard}>
      <div className={styles.review_name}>{review.name}</div>
      <div>{review.company}</div>
      <div className={styles.review_reviewText}>{review.review}</div>
    </div>
  }


  export default ReviewCard