import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { Service } from '../../interfaces/VerifiedPartner'
import { toSnakeCase } from '../utils'

import styles from './CategoryPill.module.css'

interface Props {
  type: Service
  showIcon?: boolean
}

function CategoryPill({ type, showIcon = false }: Props) {
  const service = toSnakeCase(type)
  const typeClass = `container--${service}`

  const intl = useIntl()
  const serviceName = intl.formatMessage({ id: `service.${toSnakeCase(service)}`})

  const tooltip = <div className={styles.tooltip_container}>
  <div className={styles.tooltip}>
    {intl.formatMessage({ id: `service.${toSnakeCase(service)}.description`})}
  </div>
</div>

  return (
    <span className={`${styles.container} ${styles[typeClass]}`}>
      {showIcon && <><img alt='' src={`/images/category_${serviceName.replace(' ', '')}.svg`} />&nbsp;</>}
      {serviceName}
      {tooltip}
    </span>
  )
}

export default CategoryPill
