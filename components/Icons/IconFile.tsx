import React from 'react'

interface Props extends React.HTMLAttributes<HTMLOrSVGElement> {
  gray?: boolean
  red?: boolean
}

function IconFile({ gray, red, ...otherProps }: Props) {
  const style = { verticalAlign: 'text-bottom' }
  let stroke = '#242129'
  if (gray) stroke = '#736E7D'
  if (red) stroke = '#FF2D55'

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" style={style} {...otherProps}>
        <path d="M9.33366 1.33331H4.00033C3.6467 1.33331 3.30756 1.47379 3.05752 1.72384C2.80747 1.97389 2.66699 2.31302 2.66699 2.66665V13.3333C2.66699 13.6869 2.80747 14.0261 3.05752 14.2761C3.30756 14.5262 3.6467 14.6666 4.00033 14.6666H12.0003C12.3539 14.6666 12.6931 14.5262 12.9431 14.2761C13.1932 14.0261 13.3337 13.6869 13.3337 13.3333V5.33331L9.33366 1.33331Z" stroke={stroke} strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M10.6663 11.3333H5.33301" stroke={stroke} strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M10.6663 8.66669H5.33301" stroke={stroke} strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6.66634 6H5.99967H5.33301" stroke={stroke} strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9.33301 1.33331V5.33331H13.333" stroke={stroke} strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export default IconFile
