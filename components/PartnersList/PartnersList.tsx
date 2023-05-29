import React, { useEffect, useState } from 'react'
import { FormattedMessage } from 'react-intl'
import { VerifiedPartner } from '../../interfaces/VerifiedPartner'
import PartnerCard from '../PartnerCard/PartnerCard'

import styles from './PartnersList.module.css'
import Empty from '../Icons/Empty'
import { trackLink } from '../utils'
import LayoutFilteredList from '../LayoutFilteredList/LayoutFilteredList'
import { Filter, FilterGroup } from '../../interfaces/Filters'
import { useRouter } from 'next/router'

interface Props {
  partners: VerifiedPartner[]
}

const isDevelopment = process.env.NODE_ENV === 'development'

const services: Filter[] = [
  {
    key: 'services',
    value: '3D Modeling'
  },
  {
    key: 'services',
    value: 'Advertisement'
  },
  {
    key: 'services',
    value: 'Creative Director'
  },
  {
    key: 'services',
    value: 'Emote Design'
  },
  {
    key: 'services',
    value: 'Entertainment'
  },
  {
    key: 'services',
    value: 'Land Rental'
  },
  {
    key: 'services',
    value: 'Linked Wearables'
  },
  {
    key: 'services',
    value: 'Programming'
  },
  {
    key: 'services',
    value: 'Venue Rental'
  },
  {
    key: 'services',
    value: 'Wearable Design'
  }
]

const payment_methods = [
	{
    key: 'payment_methods',
    value: 'Wire Transfer'
  },
  {
    key: 'payment_methods',
    value: 'Credit Card'
  },
  {
    key: 'payment_methods',
    value: 'Crypto'
  }
]

const region = [
	{
    key: 'region',
    value: 'North America'
  },
  {
    key: 'region',
    value: 'Europe'
  },
  {
    key: 'region',
    value: 'Latin America'
  },
  {
    key: 'region',
    value: 'Asia'
  },
  {
    key: 'region',
    value: 'Oceania'
  },
  {
    key: 'region',
    value: 'Africa'
  }
]

const team_size = [
  {
    key: 'team_size',
    value: 'Individual'
  },
  {
    key: 'team_size',
    value: 'Small Studio'
  },
  {
    key: 'team_size',
    value: 'Medium Studio'
  },
  {
    key: 'team_size',
    value: 'Large Studio'
  }
]

const avilableFilters: FilterGroup[] = [
	{
		title: 'SERVICES',
		options: services
	},
  {
    title: 'REGION',
    options: region
  },
  {
    title: 'TEAM SIZE',
    options: team_size
  },
	{
		title: 'PAYMENT METHODS',
		options: payment_methods
	}
]

const randomizePartners = (filteredPartners: VerifiedPartner[]) =>
  [...filteredPartners]
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value)

const sortAlphabeticPartners = (filteredPartners: VerifiedPartner[]) =>
  [...filteredPartners].sort((p1: VerifiedPartner, p2: VerifiedPartner) => p1.slug.localeCompare(p2.slug))

const sortByServicesCount = (partners: VerifiedPartner[]) =>
  partners.sort((p1: VerifiedPartner, p2: VerifiedPartner) => (p2.services || []).length - (p1.services || []).length)

const filterItem = (partner: any, filter: Filter) => {
  if (['services', 'payment_methods'].includes(filter.key)){
    return partner[filter.key]?.includes(filter.value)
  }
  return  partner[filter.key] === filter.value
}

const JOIN_REGISTRY_URL = 'https://dclstudios.typeform.com/to/NfzmbzXi'

function PartnersList({ partners }: Props) {

  const router = useRouter()
	const urlSearchParams = new URLSearchParams(router.asPath.replace('/studios', ''))
	const urlFilters = [...urlSearchParams].map(([keyName, val]) => ({key: keyName, value: val}))

	const [filters, setFilters] = useState<Filter[]>(urlFilters.length ? urlFilters : [])
  const [limit, setLimit] = useState(parseInt(globalThis?.sessionStorage?.studiosListLimit) || 10)
  const [filteredList, setFilteredList] = useState(sortByServicesCount(sortAlphabeticPartners(partners)))


  useEffect(() => {
    setFilteredList(sortByServicesCount(randomizePartners(partners)))
  }, [])
  
  useEffect(() => {
    let newList = partners.filter(partner => filters.every(filter => filterItem(partner, filter)))
    newList = sortByServicesCount(randomizePartners(newList))
    setFilteredList(newList)
  }, [filters.length])
  
  let renderList = filteredList.slice( 0, limit )

  if (!isDevelopment){
    //prevent dev studios from showing in production
    const restrictedIds = [353, 358]
    renderList = renderList.filter(partner => !restrictedIds.includes(partner.id))
  }

  useEffect(() => {
    let newQuery: any = {}
    filters.forEach(filter => newQuery[filter.key] = [ ...(newQuery[filter.key] || []), filter.value])
		
    router.replace(
			{
			  query: newQuery
			},
			undefined,
	  		{ shallow: true }
		  )
	}, [filters])

  useEffect(() => {
    globalThis.sessionStorage.setItem('studiosListLimit', limit.toString());
  }, [limit])

  const joinButton = <a
    className={styles.link_join}
    target={'_blank'}
    href={JOIN_REGISTRY_URL}
    rel="noreferrer"
    onClick={() => trackLink('Open External Link', 'Join Registry', JOIN_REGISTRY_URL)}
  />

  const headerBar = <>{filteredList.length} Verified studio{filteredList.length !== 1 ? 's' : ''}</>

  const emptyPanel = <div className={styles.empty}>
    <Empty />
    <br />
    <FormattedMessage id="filter.noResults" />
  </div>

  const listPanel = <>
    {renderList.map((partner) => <PartnerCard key={partner.id} partner={partner} />)}
    {filteredList.length >= limit && <div className={styles.load_more_container}><div className={'button_primary'} onClick={() => setLimit(current => current + 10)}>LOAD MORE</div></div>}
  </>

  return (
    <>
      <div className={styles.container}>
        
        <LayoutFilteredList activeFilters={filters} setActiveFilters={setFilters}
          filtersList={avilableFilters}
          headerButton={joinButton}
          headerBar={headerBar}
          listPanel={renderList.length ? listPanel : emptyPanel}
        />

      </div>
      
      <div className={styles.footer_text_container}>
        <FormattedMessage
          id="footer_message"
          values={{
            i: (chunks) => <i>{chunks}</i>,
            a1: (chunks) => (
              <a
                className={styles.link}
                target={'_blank'}
                href="https://governance.decentraland.org/"
                rel="noreferrer"
                onClick={() =>
                  trackLink('Open External Link', 'Governance Footer', 'https://governance.decentraland.org/')
                }
              >
                {chunks}
              </a>
            ),
            a2: (chunks) => (
              <a
                className={styles.link}
                target={'_blank'}
                href={JOIN_REGISTRY_URL}
                rel="noreferrer"
                onClick={() => trackLink('Open External Link', 'Join Registry', JOIN_REGISTRY_URL)}
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
