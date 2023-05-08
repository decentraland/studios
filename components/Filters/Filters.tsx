import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { useRouter } from 'next/router'
import { FormattedMessage, useIntl } from 'react-intl'
import { CheckboxProps } from 'semantic-ui-react/dist/commonjs/modules/Checkbox'
import { PaymentMethod, Region, Service, TeamSize, VerifiedPartner } from '../../interfaces/VerifiedPartner'

import styles from './Filters.module.css'
import { hideIntercom, showIntercom, toSnakeCase } from '../utils'
import IconX from '../Icons/IconX'
import ServiceTag from '../ServiceTag/ServiceTag'

interface Props {
  partners: VerifiedPartner[]
  setFilteredPartners: React.Dispatch<React.SetStateAction<VerifiedPartner[]>>
  onClose(event: React.MouseEvent<HTMLElement>): void
  showMobileFilters: boolean
  setFiltersCount: any
}

enum FilterType {
  Services = 'services',
  Region = 'region',
  TeamSize = 'team_size',
  PaymentMethod = 'payment_methods',
  Language = 'languages',
}

type Filters = Record<FilterType, string[]>
type CheckBoxStates = Record<string, boolean>
const EMPTY_FILTER = {} as Filters

const dropdownContent = [
  {
    key: FilterType.Services,
    title: <FormattedMessage id={FilterType.Services} />,
    options: Service,
  },
  {
    key: FilterType.Region,
    title: <FormattedMessage id={FilterType.Region} />,
    options: Region,
  },
  {
    key: FilterType.TeamSize,
    title: <FormattedMessage id={FilterType.TeamSize} />,
    options: TeamSize,
  },
  {
    key: FilterType.PaymentMethod,
    title: <FormattedMessage id={FilterType.PaymentMethod} />,
    options: PaymentMethod,
  },
]

function getCheckboxKey(filter: FilterType, value: string): string {
  return `${filter}#${value}`
}

function Filters({ partners, setFilteredPartners, showMobileFilters, onClose, setFiltersCount }: Props) {
  const [currentFilterCategory, setCurrentFilterCategory] = useState(0)
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTER)
  const [checkBoxState, setCheckBoxState] = useState<CheckBoxStates>({})
  const router = useRouter()
  const intl = useIntl()

  const languages = useMemo(() => {
    let uniqueLanguages = new Set<string>()
    partners.map((partner) => (uniqueLanguages = new Set([...uniqueLanguages, ...partner.languages])))
    return Array.from(uniqueLanguages).sort((a, b) => a.localeCompare(b))
  }, [partners])

  const getUrlFilters = useCallback(() => {
    const filters = { ...EMPTY_FILTER }

    // const { query } = router
    // Reading query from router.asPath because router.query was slower getting populated
    const urlSearchParams = new URLSearchParams(router.asPath.slice(1))
    const query = Object.fromEntries(urlSearchParams.entries())

    for (const key of Object.keys(query)) {
      const filterKey = key as keyof Filters
      if (Object.values(FilterType).includes(filterKey)) {
        const value = query[key]
        filters[filterKey] = typeof value === 'string' ? [value] : [...(value || [])]
      }
    }

    return filters
  }, [router])

  useEffect(() => {
    const initialCheckBoxState: CheckBoxStates = {}
    for (const category of dropdownContent) {
      for (const item of Object.values(category.options)) {
        initialCheckBoxState[getCheckboxKey(category.key, item)] = false
      }
    }

    for (const language of languages) {
      initialCheckBoxState[getCheckboxKey(FilterType.Language, language)] = false
    }

    const urlFilters = getUrlFilters()
    if (Object.keys(urlFilters).length > 0) {
      setFilters(urlFilters)
      for (const [key, values] of Object.entries(urlFilters)) {
        for (const value of values) {
          const checkboxKey = getCheckboxKey(key as FilterType, value)
          if (checkboxKey in initialCheckBoxState) {
            initialCheckBoxState[checkboxKey] = true
          }
        }
      }
    }

    setCheckBoxState(initialCheckBoxState)
  }, [languages])

  useEffect(() => {
    handleApplyFilters()
  }, [checkBoxState])

  const handleItemClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, itemData: CheckboxProps) => {
    event.stopPropagation()

    const { checked, name, value } = itemData
    const filterType = name as FilterType

    setCheckBoxState((prevState) => ({ ...prevState, [getCheckboxKey(filterType, `${value}`)]: !checked }))

    if (!checked) {
      setFilters((prev) => ({ ...prev, [filterType]: [...(prev[filterType] || []), value] }))
    } else {
      const newFilters = filters[filterType].filter((item) => item !== value)
      if (newFilters.length === 0) {
        setFilters((prev) => {
          const filterRemoved = { ...prev }
          delete filterRemoved[filterType]
          return filterRemoved
        })
      } else {
        setFilters((prev) => ({ ...prev, [filterType]: newFilters }))
      }
    }
  }

  useEffect(() => {
    setFiltersCount(Object.entries(filters).length)
  }, [filters])

  const setUrlFilters = (filters: Filters) => {
    router.replace(
      {
        query: { ...filters },
      },
      undefined,
      { shallow: true }
    )
  }

  const handleApplyFilters = (customFilters?: Filters) => {
    const appliedFilters = customFilters || filters

    const selectedPartners = partners.filter((partner) =>
      Object.entries(appliedFilters).every(([type, filters]) => {
        const filterKey = type as `${FilterType}`
        return filters.every(
          (filter) =>
            partner[filterKey] === filter || (partner[filterKey] && partner[filterKey].includes(filter as never))
        )
      })
    )

    if (Object.keys(selectedPartners).length === 0 && Object.keys(appliedFilters).length === 0) {
      setFilteredPartners(partners)
      setUrlFilters(EMPTY_FILTER)
    } else {
      setFilteredPartners(selectedPartners)
      setUrlFilters(appliedFilters)
    }
  }

  const handleClearFilters = () => {
    setFilters(EMPTY_FILTER)
    setUrlFilters(EMPTY_FILTER)
    setFilteredPartners(partners)
    for (const key of Object.keys(checkBoxState)) {
      setCheckBoxState((prevState) => ({ ...prevState, [key]: false }))
    }
  }

  useEffect(() => {
    if (showMobileFilters){
      hideIntercom()
    } else {
      showIntercom()
    }
  }, [showMobileFilters])
  
  return (
    <div className={styles.filtersContainer} style={{display: showMobileFilters ? 'block' : 'none'}}>
    <div className={styles.filtersMobile_title}>Filter studios<IconX onClick={onClose} /></div>
      <div className={styles.filtersMobile_container}>
        {dropdownContent.map((item, index) => {
          return (
            <div key={item.key} className={styles.filter_container}>
              <div className={styles.filter_name}>{item.title}</div>
              <div>
                {Object.entries(item.options).map(([key, value]) => {
                  const itemData: CheckboxProps = {
                    checked: checkBoxState[getCheckboxKey(item.key, value)],
                    value: value,
                    name: item.key,
                  }
                  console.log(itemData)
                  console.log(key)

                  const notService = itemData.name !== 'services'

                  return (
                    <div
                      key={key}
                      onClick={(e) => handleItemClick(e, itemData)}
                      className={`${styles.tag_container} ${notService && styles['tag_container--hover']} ${notService && itemData.checked ? styles.check : ''}`}
                    >
                      {notService ? 
                        intl.formatMessage({ id: `service.${toSnakeCase(value)}`, defaultMessage: value })
                      :
                        <ServiceTag type={value} active={itemData.checked} hover/>
                      }
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
      <div className={styles.filtersMobile_buttons}>
          <span className='button_basic' onClick={handleClearFilters}>CLEAR FILTERS</span>
          <span className='button_primary' onClick={onClose}>APPLY FILTERS</span>
      </div>
    </div>
  )
}

export default Filters
