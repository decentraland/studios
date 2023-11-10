import React, { useEffect, useState } from 'react'

import styles from './UserAvatar.module.css'
import { User } from '../../interfaces/User';
import { VerifiedPartner } from '../../interfaces/VerifiedPartner';
import { logout, useUser } from '../../clients/Sessions';

function stringToHslColor(str: string, s: number, l: number) {
    let hash = 0;
    for (var i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    let h = hash % 360;
    return 'hsl(' + h + ', ' + s + '%, ' + l + '%)';
}

const DB_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL

interface Props {
    user?: User
    studio?: VerifiedPartner
    s?: boolean
    xs?: boolean
    currentUser?: boolean
    menu?: boolean
}

const UserAvatar = ({ user, studio, menu, s, xs, currentUser, ...otherProps }: Props) => {
    let style = {}
    let name = ''

    let userData = user
    const [studioData, setStudioData] = useState(studio)
    const [open, setOpen] = useState(false)

    const logguedUserData = useUser()

    if (currentUser) {
        userData = logguedUserData.user
    }

    useEffect(() => {
        if (currentUser && userData) {
            fetch(`/api/get/studio`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        user: userData.id,
                    })
                })
                .then(res => res.ok && res.json())
                .then(studio => setStudioData(studio))
        }
    }, [userData])

    if (currentUser && !userData) return null

    if (studioData?.logo) {
        style = { background: `url(${DB_URL}/assets/${studioData.logo}?key=logo)` }
    } else if (userData) {
        style = { backgroundColor: stringToHslColor(userData.id, 100, 85) }
        name = [userData.first_name, userData.last_name].join(' ')
    }

    return <div 
        // onClick={() => setOpen(!open)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        tabIndex={0}
        className={`${styles.avatarContainer} ${(s || xs) && (s ? styles['avatarContainer--small'] : styles['avatarContainer--xsmall'])}`}
        style={style}
        {...otherProps}>
        <div title={studioData?.name || name}>{name[0] && name[0].toUpperCase()}</div>
        {menu && open && <div className={styles.menuContainer}>
            <div className={styles.menuItem} onClick={() => logout()}>Log out</div>
            {currentUser && userData?.role.name === "Studio" && <div className={styles.menuItem} onClick={() => (globalThis as any).open("https://admin.dclstudios.org/", '_blank').focus()}>
                Open back office
                </div>}
        </div>}
    </div>
}

// UserAvatar.displayName = 'UserAvatar'

export default UserAvatar