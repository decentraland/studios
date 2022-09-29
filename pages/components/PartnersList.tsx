import React from 'react'
import { VerifiedPartner } from '../interfaces/VerifiedPartner'

interface Props {
  partners: VerifiedPartner[]
}

function PartnersList({ partners }: Props) {
  console.log(partners)
  
  return <div>Partners</div>
}

export default PartnersList
