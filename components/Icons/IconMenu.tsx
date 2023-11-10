import React from 'react'

interface Props extends React.HTMLAttributes<HTMLOrSVGElement> {
    red?: boolean
    small?: boolean
}

function IconMenu({ red, small, ...otherProps }: Props) {

    let fill = "#736E7D"
    if (red) fill = "#FF2D55"
    
    let size = "24"
    if (small) {
        return <svg xmlns="http://www.w3.org/2000/svg" width="10" height="11" viewBox="0 0 10 11" fill="none" style={{verticalAlign: "text-bottom"}}>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M2.08333 6.33329C2.54357 6.33329 2.91667 5.9602 2.91667 5.49996C2.91667 5.03972 2.54357 4.66663 2.08333 4.66663C1.6231 4.66663 1.25 5.03972 1.25 5.49996C1.25 5.9602 1.6231 6.33329 2.08333 6.33329ZM5 6.33329C5.46024 6.33329 5.83333 5.9602 5.83333 5.49996C5.83333 5.03972 5.46024 4.66663 5 4.66663C4.53976 4.66663 4.16667 5.03972 4.16667 5.49996C4.16667 5.9602 4.53976 6.33329 5 6.33329ZM8.75 5.49996C8.75 5.9602 8.3769 6.33329 7.91667 6.33329C7.45643 6.33329 7.08333 5.9602 7.08333 5.49996C7.08333 5.03972 7.45643 4.66663 7.91667 4.66663C8.3769 4.66663 8.75 5.03972 8.75 5.49996Z" fill={fill}/>
      </svg>
    }


    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" {...otherProps}>
            <path fillRule="evenodd" clipRule="evenodd" d="M5 14C6.10457 14 7 13.1046 7 12C7 10.8954 6.10457 10 5 10C3.89543 10 3 10.8954 3 12C3 13.1046 3.89543 14 5 14ZM12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14ZM21 12C21 13.1046 20.1046 14 19 14C17.8954 14 17 13.1046 17 12C17 10.8954 17.8954 10 19 10C20.1046 10 21 10.8954 21 12Z" fill={fill} />
        </svg>
    )
}

export default IconMenu
