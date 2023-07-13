import React from 'react'

function IconEye({ ...otherProps }) {
    const style = { verticalAlign: 'text-bottom' }
  return (
    <svg fill="none" height="16" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg" style={style} { ...otherProps }>
        <g stroke="#000" stroke-linecap="round" stroke-linejoin="round">
            <path d="m.666992 8.0013s2.666668-5.33333 7.333338-5.33333 7.33337 5.33333 7.33337 5.33333-2.6667 5.3333-7.33337 5.3333-7.333338-5.3333-7.333338-5.3333z"/>
            <path d="m8 10c1.10457 0 2-.89543 2-2s-.89543-2-2-2-2 .89543-2 2 .89543 2 2 2z"/>
        </g>
    </svg>
  )
}

export default IconEye
