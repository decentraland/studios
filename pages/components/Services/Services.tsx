import React from 'react'
import { FormattedMessage } from 'react-intl'
import { Service } from '../../interfaces/VerifiedPartner'
import CategoryPill from '../CategoryPill/CategoryPill'
import { toSnakeCase } from '../utils'

import styles from './Services.module.css'

const SERVICES = Object.values(Service)

function Services() {
  return (
    <>
      <h3>
        <FormattedMessage id="service.title" />
      </h3>
      <table className={styles.Table}>
        <tbody>
          {SERVICES.map((key) => (
            <tr key={key}>
              <td className={styles.Service}>
                <CategoryPill type={key} />
              </td>
              <td className={styles.Description}>
                <FormattedMessage id={`service.${toSnakeCase(key)}.description`} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}

export default Services
