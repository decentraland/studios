import React from 'react'

interface Props {
    red?: boolean;
    gray?: boolean;
}

const IconStatus = React.memo(({ red, gray }: Props) => {
    const style = { verticalAlign: 'text-bottom' }

    if (gray) {
        return <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="#7E797B">
            <circle cx="7" cy="7" r="3" fill="#7E797B" />
        </svg>
    }
    if (red) {
        return <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
            <g filter="url(#filter0_di_5860_7927)">
                <circle cx="7" cy="7" r="3" fill="#FF2D55" />
            </g>
            <defs>
                <filter id="filter0_di_5860_7927" x="0" y="0" width="14" height="14" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                    <feOffset />
                    <feGaussianBlur stdDeviation="2" />
                    <feComposite in2="hardAlpha" operator="out" />
                    <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 0.333333 0 0 0 0 0.462745 0 0 0 1 0" />
                    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_5860_7927" />
                    <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_5860_7927" result="shape" />
                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                    <feOffset dx="0.5" dy="0.5" />
                    <feGaussianBlur stdDeviation="0.5" />
                    <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
                    <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.3 0" />
                    <feBlend mode="normal" in2="shape" result="effect2_innerShadow_5860_7927" />
                </filter>
            </defs>
        </svg>
    }

    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="14" viewBox="0 0 13 14" fill="none">
            <g filter="url(#filter0_d_5860_7048)">
                <circle cx="6.5" cy="7" r="2.5" fill="#21C728" />
            </g>
            <defs>
                <filter id="filter0_d_5860_7048" x="0" y="0.5" width="13" height="13" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                    <feOffset />
                    <feGaussianBlur stdDeviation="2" />
                    <feComposite in2="hardAlpha" operator="out" />
                    <feColorMatrix type="matrix" values="0 0 0 0 0.129412 0 0 0 0 0.780392 0 0 0 0 0.156863 0 0 0 1 0" />
                    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_5860_7048" />
                    <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_5860_7048" result="shape" />
                </filter>
            </defs>
        </svg>
    )
})

IconStatus.displayName = "IconStatus"

export default IconStatus
