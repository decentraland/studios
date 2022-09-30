import React from 'react'
import { FormattedMessage } from 'react-intl'
import { PaymentMethod, Region, Service, Status, TeamSize, VerifiedPartner } from '../interfaces/VerifiedPartner'
import PartnerCard from './PartnerCard/PartnerCard'

interface Props {
  partners: VerifiedPartner[]
}

function PartnersList({ partners }: Props) {
  
  return <>
    {
      partners.map((partner, i) => <PartnerCard key={partner.id} partner={partner} />)
    }
  </>
}

export default PartnersList
