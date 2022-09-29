import React from 'react'
import { FormattedMessage } from 'react-intl'
import { Service } from '../../interfaces/VerifiedPartner'

import styles from './CategoryPill.module.css'

interface Props {
  type: `${keyof typeof Service}`
}

function CategoryPill({ type }: Props) {
  const typeCalss = `CategoryPill--${type}`
  return (
    <span className={`${styles.CategoryPill} ${styles[typeCalss]}`}>
      <FormattedMessage id={`service.${type}`} />
    </span>
  )
}

export default CategoryPill
