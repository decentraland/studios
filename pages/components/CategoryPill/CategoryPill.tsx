import React from 'react'
import { FormattedMessage } from 'react-intl'
import { Service } from '../../interfaces/VerifiedPartner'
import { toSnakeCase } from '../utils'

import styles from './CategoryPill.module.css'

interface Props {
  type: Service
}

function CategoryPill({ type }: Props) {
  const service = toSnakeCase(type)
  const typeCalss = `CategoryPill--${service}`
  return (
    <span className={`${styles.CategoryPill} ${styles[typeCalss]}`}>
      <FormattedMessage id={`service.${service}`} />
    </span>
  )
}

export default CategoryPill
