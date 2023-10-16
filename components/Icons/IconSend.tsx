import React from 'react'

interface Props extends React.HTMLAttributes<HTMLOrSVGElement> {
    gray?: boolean
}

const IconSend = React.memo(({ gray }: Props) => {
    const style = {verticalAlign: "middle"}
    let fill = "#FF2D55"
    if (gray) fill = "#7E797B"

    return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
            <path d="M15.3743 3.3528C16.1651 3.07601 16.9253 3.83619 16.6485 4.62701L12.3346 16.9526C12.0354 17.8075 10.8447 17.856 10.4769 17.0284L8.32418 12.1848C8.22363 11.9586 8.04274 11.7777 7.8165 11.6771L2.97291 9.52444C2.14528 9.1566 2.19385 7.96596 3.04869 7.66677L15.3743 3.3528Z" fill={fill} />
        </svg>

    )
})

IconSend.displayName = "IconSend"

export default IconSend
