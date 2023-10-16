import React from 'react'

const IconOpenProject = React.memo(({ ...otherProps }) => {
    const style = { verticalAlign: 'text-bottom' }
    return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" style={style} {...otherProps}>
            <path d="M15 10.875V6.75L9.75 1.5H4.5C4.10218 1.5 3.72064 1.65804 3.43934 1.93934C3.15804 2.22064 3 2.60218 3 3V15C3 15.3978 3.15804 15.7794 3.43934 16.0607C3.72064 16.342 4.10218 16.5 4.5 16.5H9" stroke="#FF2D55" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9.75 1.5V6.75H15" stroke="#FF2D55" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M15 16.5001L11.75 13.2501" stroke="#FF2D55" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M11.75 16.7501V13.2501H15.25" stroke="#FF2D55" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

    )
})

IconOpenProject.displayName = "IconOpenProject"

export default IconOpenProject
