import React, { useEffect, useMemo, useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import Form from 'semantic-ui-react/dist/commonjs/collections/Form'
import Menu from 'semantic-ui-react/dist/commonjs/collections/Menu'
import Button from 'semantic-ui-react/dist/commonjs/elements/Button'
import Accordion from 'semantic-ui-react/dist/commonjs/modules/Accordion/Accordion'
import { AccordionTitleProps } from 'semantic-ui-react/dist/commonjs/modules/Accordion/AccordionTitle'
import { CheckboxProps } from 'semantic-ui-react/dist/commonjs/modules/Checkbox'
import Dropdown from 'semantic-ui-react/dist/commonjs/modules/Dropdown'
import { PaymentMethod, Region, Service, TeamSize, VerifiedPartner } from '../../interfaces/VerifiedPartner'

import styles from './Filters.module.css'

interface Props {
  partners: VerifiedPartner[]
  setFilteredPartners: React.Dispatch<React.SetStateAction<VerifiedPartner[]>>
}

enum FilterType {
  Services = 'services',
  Region = 'region',
  TeamSize = 'team_size',
  PaymentMethod = 'payment_methods',
  Language = 'languages',
}

type Filters = Record<FilterType, string[]>
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

function Filters({ partners, setFilteredPartners }: Props) {
  const [currentFilterCategory, setCurrentFilterCategory] = useState(0)
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTER)
  const [checkBoxState, setCheckBoxState] = useState<Record<string, boolean>>({})
  const intl = useIntl()
  const filterText = intl.formatMessage({ id: 'filter' })

  const languages = useMemo(() => {
    let uniqueLanguages = new Set<string>()
    partners.map((partner) => (uniqueLanguages = new Set([...uniqueLanguages, ...partner.languages])))
    return Array.from(uniqueLanguages).sort((a, b) => a.localeCompare(b))
  }, [partners])

  useEffect(() => {
    for (const category of dropdownContent) {
      for (const item of Object.values(category.options)) {
        setCheckBoxState((prev) => ({ ...prev, [`${category.key}#${item}`]: false }))
      }
    }

    for (const language of languages) {
      setCheckBoxState((prev) => ({ ...prev, [`${FilterType.Language}#${language}`]: false }))
    }
  }, [languages])

  const handleAccordionTitleClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    titleProps: AccordionTitleProps
  ) => {
    e.stopPropagation()
    const { index } = titleProps
    const idxNumber = Number(index)
    if (currentFilterCategory === idxNumber) {
      setCurrentFilterCategory(-1)
    } else {
      setCurrentFilterCategory(idxNumber)
    }
  }

  const handleAccordionItemClick = (event: React.MouseEvent<HTMLInputElement, MouseEvent>, itemData: CheckboxProps) => {
    event.stopPropagation()
    const { checked, name, value } = itemData
    const filterType = name as FilterType

    setCheckBoxState((prevState) => ({ ...prevState, [`${name}#${value}`]: !!checked }))

    if (checked) {
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

  const handleApplyFilters = () => {
    const selectedPartners = partners.filter((partner) =>
      Object.entries(filters).every(([type, filters]) => {
        const filterKey = type as `${FilterType}`
        return filters.some((filter) => partner[filterKey] === filter || partner[filterKey].includes(filter as never))
      })
    )

    if (Object.keys(selectedPartners).length === 0 && Object.keys(filters).length === 0) {
      setFilteredPartners(partners)
    } else {
      setFilteredPartners(selectedPartners)
    }
  }

  const handleClearFilters = () => {
    setFilters(EMPTY_FILTER)
    setFilteredPartners(partners)
    for (const key of Object.keys(checkBoxState)) {
      setCheckBoxState((prevState) => ({ ...prevState, [key]: false }))
    }
  }

  return (
    <Dropdown text={filterText} closeOnBlur={false}>
      <Dropdown.Menu>
        <Accordion>
          {dropdownContent.map((item, index) => {
            return (
              <Menu.Item key={item.key}>
                <Accordion.Title
                  active={currentFilterCategory === index}
                  content={item.title}
                  index={index}
                  onClick={handleAccordionTitleClick}
                />
                <Accordion.Content
                  active={currentFilterCategory === index}
                  content={
                    <Form>
                      <Form.Group grouped>
                        {Object.entries(item.options).map(([key, value]) => (
                          <Form.Checkbox
                            label={value}
                            name={item.key}
                            value={value}
                            key={key}
                            onClick={handleAccordionItemClick}
                            checked={checkBoxState[`${item.key}#${value}`]}
                            className={styles.checkbox}
                          />
                        ))}
                      </Form.Group>
                    </Form>
                  }
                />
              </Menu.Item>
            )
          })}
          <Menu.Item>
            <Accordion.Title
              active={currentFilterCategory === dropdownContent.length + 1}
              content={<FormattedMessage id="languages" />}
              index={dropdownContent.length + 1}
              onClick={handleAccordionTitleClick}
            />
            <Accordion.Content
              active={currentFilterCategory === dropdownContent.length + 1}
              content={
                <Form>
                  <Form.Group grouped>
                    {languages.map((language) => (
                      <Form.Checkbox
                        label={language}
                        name={FilterType.Language}
                        value={language}
                        key={language}
                        onClick={handleAccordionItemClick}
                        checked={checkBoxState[`${FilterType.Language}#${language}`]}
                        className={styles.checkbox}
                      />
                    ))}
                  </Form.Group>
                </Form>
              }
            />
          </Menu.Item>
        </Accordion>
        <div className={styles.buttons_container}>
          <Button onClick={handleClearFilters} basic secondary>
            <FormattedMessage id="clear" />
          </Button>
          <Button onClick={handleApplyFilters} basic primary>
            <FormattedMessage id="apply" />
          </Button>
        </div>
      </Dropdown.Menu>
    </Dropdown>
  )
}

export default Filters
