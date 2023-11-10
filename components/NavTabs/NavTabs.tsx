import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

import styles from './NavTabs.module.css'
import SearchInputNav from '../SearchInputNav/SearchInputNav'
import UserAvatar from '../UserAvatar/UserAvatar'
import { useUser } from '../../clients/Sessions'

export default function NavTabs() {
    const router = useRouter()

    const { user } = useUser()

    const activeRef = useRef<HTMLDivElement>(null)

    const tabsContents = [
        {path: '/', label: 'Overview'}, 
        {path: '/studios', label: 'Studios'}, 
        {path: '/projects', label: 'Projects'}, 
        {path: '/resources', label: 'Resources'}, 
        {path: '/dashboard', label: 'Dashboard', roles: ['Client', 'Studio', 'Resources Editor']}, 
        {path: '/jobs', label: 'Jobs', roles: ['Client', 'Studio', 'Resources Editor']},
    ]

    useEffect(() => {
        activeRef.current?.scrollIntoView()
    },[])
    return <div className={styles.navTabs}>
        <div className={styles.barContainer}>
            <div className={styles.tabsContainer}>
                {tabsContents.map(tab => {

                    const isActive = `/${(router.route.split('/')[1])}` === tab.path

                    if (tab.roles && !tab.roles.includes(user?.role?.name)) return null

                    return <Link key={tab.path} href={`${tab.path}`} legacyBehavior prefetch={false}>
                        <div className={`${styles.navTab} ${isActive ? styles['navTab--active'] : ''}`}
                        ref={isActive ? activeRef : null}>
                            {`${tab.label}`}
                            {isActive ? <div className={styles['active-bar']} /> : null}
                        </div>
                    </Link>
                }
                )}
            </div>
            <div className={styles.rightContainer}>
                <SearchInputNav avatar={!!user} />
                {user && <UserAvatar menu currentUser/>}
                {!user && <div className="button_primary button_primary--small" onClick={() => router.push('/login?dashboard=true')}>LOG IN</div>}
            </div>
        </div>
    </div>
}