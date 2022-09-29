import React from 'react'
import { FormattedMessage } from 'react-intl'
import { Service } from '../../interfaces/VerifiedPartner'
import CategoryPill from '../CategoryPill/CategoryPill'

import styles from './Services.module.css'

const SERVICE_KEYS = Object.keys(Service).filter((key) => isNaN(Number(key))) as Array<keyof typeof Service>

function Services() {
  return (
    <>
      <h3>
        <FormattedMessage id="service.title" />
      </h3>
      <table className={styles.Table}>
        <tbody>
          {SERVICE_KEYS.map((key) => (
            <tr key={key}>
              <td className={styles.Service}>
                <CategoryPill type={key} />
              </td>
              <td className={styles.Description}>
                <FormattedMessage id={`service.${key}.description`} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}

export default Services
