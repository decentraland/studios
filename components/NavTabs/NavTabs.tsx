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
        <div className={styles.container}>
            {tabsContents.map(tab => 
                <Link key={tab[0]} href={`${tab[0]}`} legacyBehavior>
                    <div className={`${styles.navTab} ${router.route === tab[0] ? styles['navTab--active']: '' }`}>
                        {`${tab[1]}`}
                        {router.route === tab[0] ? <div className={styles['active-bar']}/> : null}
                    </div>
                </Link>
            )}
            <SearchInputNav />
        </div>
    </div>
}