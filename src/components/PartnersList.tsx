import React, { useState } from 'react'
import { FormattedMessage } from 'react-intl'
import { VerifiedPartner } from '../interfaces/VerifiedPartner'
import PartnerCard from './PartnerCard/PartnerCard'
import { Dropdown, AccordionTitleProps, Accordion, Form, Menu } from 'semantic-ui-react'
interface Props {
  partners: VerifiedPartner[]
}

const ColorForm = (
  <Form>
    <Form.Group grouped>
      <Form.Checkbox label="Red" name="color" value="red" />
      <Form.Checkbox label="Orange" name="color" value="orange" />
      <Form.Checkbox label="Green" name="color" value="green" />
      <Form.Checkbox label="Blue" name="color" value="blue" />
    </Form.Group>
  </Form>
)

const SizeForm = (
  <Form>
    <Form.Group grouped>
      <Form.Radio label="Small" name="size" type="radio" value="small" />
      <Form.Radio label="Medium" name="size" type="radio" value="medium" />
      <Form.Radio label="Large" name="size" type="radio" value="large" />
      <Form.Radio label="X-Large" name="size" type="radio" value="x-large" />
    </Form.Group>
  </Form>
)

function PartnersList({ partners }: Props) {
  const [idx, setIdx] = useState(0)

  const handleClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, titleProps: AccordionTitleProps) => {
    const { index } = titleProps
    setIdx(Number(index))
    console.log(idx)
  }

  return (
    <>
      <h3>
        <FormattedMessage id="verified_partners" />
      </h3>
      <Dropdown text="Filter" open>
        <Dropdown.Menu>
          <Accordion>
            <Menu.Item>
              <Accordion.Title active={idx === 0} content="Size" index={0} onClick={handleClick} />
              <Accordion.Content active={idx === 0} content={SizeForm} />
            </Menu.Item>

            <Menu.Item>
              <Accordion.Title active={idx === 1} content="Colors" index={1} onClick={handleClick} />
              <Accordion.Content active={idx === 1} content={ColorForm} />
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
