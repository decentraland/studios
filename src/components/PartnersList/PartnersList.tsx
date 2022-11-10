import React, { useState } from 'react'
import { FormattedMessage } from 'react-intl'
import { VerifiedPartner } from '../../interfaces/VerifiedPartner'
import PartnerCard from '../PartnerCard/PartnerCard'

import styles from './PartnersList.module.css'
import Filters from '../Filters/Filters'
import Empty from '../Icons/Empty'
interface Props {
  partners: VerifiedPartner[]
}

function PartnersList({ partners }: Props) {
  const [filteredPartners, setFilteredPartners] = useState(partners)

  return (
    <>
      <div className={styles.container}>
        <h3>
          <FormattedMessage id="verified_partners" />
        </h3>
        <Filters partners={partners} setFilteredPartners={setFilteredPartners} />
      </div>
      {filteredPartners.length ? (
        filteredPartners.map((partner) => <PartnerCard key={partner.id} partner={partner} />)
      ) : (
        <div className={styles.empty}>
          <Empty />
          <br />
          <FormattedMessage id="filter.noResults" />
        </div>
      )}
      <div className={styles.footer_text_container}>
        <FormattedMessage
          id="footer_message"
          values={{
            i: (chunks) => <i>{chunks}</i>,
            a1: (chunks) => (
              <a className={styles.link} target={'_blank'} href="https://governance.decentraland.org/" rel="noreferrer">
                {chunks}
              </a>
            ),
            a2: (chunks) => (
              <a
                className={styles.link}
                target={'_blank'}
                href="https://dclstudios.typeform.com/to/L49y84qX"
                rel="noreferrer"
              >
                {chunks}
              </a>
            ),
          }}
        />
      </div>
    </>
  )
}

export default PartnersList
