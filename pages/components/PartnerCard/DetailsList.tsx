import React from 'react'

interface Props {
  list: string[]
}

function DetailsList({ list }: Props) {
  return (
    <>
      {list.map((item, i) => {
        return <span key={`${item}-${i}`}>{(i ? ', ' : '') + item}</span>
      })}
    </>
  )
}

export default DetailsList
