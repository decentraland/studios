import React from 'react'
import { FormattedMessage } from 'react-intl'
import { VerifiedPartner } from '../interfaces/VerifiedPartner'

interface Props {
  partners: VerifiedPartner[]
}

function PartnersList({ partners }: Props) {
  console.log(partners)
  
  return <FormattedMessage id='title' />
}

export default PartnersList
