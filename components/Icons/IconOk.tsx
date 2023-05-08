import React from 'react'

function IconOk({ ...otherProps }) {
    const style = { verticalAlign: 'text-bottom' }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" style={style}>
        <circle cx="12" cy="12" r="12" fill="#A5D6A7"/>
        <path d="M16.6663 8.5L10.2497 14.9167L7.33301 12" stroke="#455453" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export default IconOk
