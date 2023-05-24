import React from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

import styles from './NavTabs.module.css'
import SearchInputNav from '../SearchInputNav/SearchInputNav'



interface Props {
    tabsContents: Array<string[]>
}

export default function NavTabs ({ tabsContents }: Props) {
    const router = useRouter()

    return <div className={styles.navTabs}>
        <div className={styles.barContainer}>
            <div className={styles.tabsContainer}>
                {tabsContents.map(tab => {
                    
                    const isActive = `/${(router.route.split('/')[1]  || 'jobs')}` === tab[0]

                    return <Link key={tab[0]} href={`${tab[0]}`} legacyBehavior>
                        <div className={`${styles.navTab} ${isActive ? styles['navTab--active']: '' }`}>
                            {`${tab[1]}`}
                            {isActive ? <div className={styles['active-bar']}/> : null}
                        </div>
                    </Link>
                    }
                )}
            </div>
            <SearchInputNav />
        </div>
    </div>
}