import React, { useState, useEffect, useMemo } from 'react'
import { FormattedMessage } from 'react-intl'
import { PaymentMethod, Region, Service, TeamSize, VerifiedPartner } from '../../interfaces/VerifiedPartner'
import PartnerCard from '../PartnerCard/PartnerCard'
import { Dropdown, AccordionTitleProps, Accordion, Form, Menu } from 'semantic-ui-react'
interface Props {
  partners: VerifiedPartner[]
}

const dropdownContent = [
  {
    title: <FormattedMessage id="services" key="services" />,
    options: Service,
  },
  {
    title: <FormattedMessage id="region" key="region" />,
    options: Region,
  },
  {
    title: <FormattedMessage id="team_size" key="team_size" />,
    options: TeamSize,
  },
  {
    title: <FormattedMessage id="payment_methods" key="payment_methods" />,
    options: PaymentMethod,
  },
]

function PartnersList({ partners }: Props) {
  const [idx, setIdx] = useState(0)

  const handleClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, titleProps: AccordionTitleProps) => {
    e.stopPropagation()
    const { index } = titleProps
    setIdx(Number(index))
    console.log(idx)
  }

  const languages = useMemo(() => {
    let uniqueLanguages = new Set<string>()
    partners.map((partner) => (uniqueLanguages = new Set([...uniqueLanguages, ...partner.languages])))
    return Array.from(uniqueLanguages).sort((a, b) => a.localeCompare(b))
  }, [partners])

  return (
    <>
      <h3>
        <FormattedMessage id="verified_partners" />
      </h3>
      <Dropdown text="Filter" closeOnBlur={false}>
        <Dropdown.Menu>
          <Accordion>
            {dropdownContent.map((item, index) => {
              return (
                <Menu.Item key={item.title.key}>
                  <Accordion.Title active={idx === index} content={item.title} index={index} onClick={handleClick} />
                  <Accordion.Content
                    active={idx === index}
                    content={
                      <Form>
                        <Form.Group grouped>
                          {Object.entries(item.options).map(([key, value]) => (
                            <Form.Checkbox
                              label={value}
                              name={key}
                              value={key}
                              key={key}
                              onClick={(e) => e.stopPropagation()}
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
                active={idx === dropdownContent.length + 1}
                content={<FormattedMessage id="languages" />}
                index={dropdownContent.length + 1}
                onClick={handleClick}
              />
              <Accordion.Content
                active={idx === dropdownContent.length + 1}
                content={
                  <Form>
                    <Form.Group grouped>
                      {languages.map((language) => (
                        <Form.Checkbox
                          label={language}
                          name={language}
                          value={language}
                          key={language}
                          onClick={(e) => e.stopPropagation()}
                        />
                      ))}
                    </Form.Group>
                  </Form>
                }
              />
            </Menu.Item>
          </Accordion>
        </Dropdown.Menu>
      </Dropdown>
      {partners.map((partner) => (
        <PartnerCard key={partner.id} partner={partner} />
      ))}
    </>
  )
}

export default PartnersList
