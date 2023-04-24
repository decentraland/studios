import React from 'react'
import styles from './ErrorScreen.module.css'
import { showIntercom } from '../utils'
import { useRouter } from 'next/router'
import { ReactNode } from 'react-markdown/lib/ast-to-react'


interface Props {
    onBackClick?: () => void
    button?: ReactNode
}

export default function ErrorScreen ({button, onBackClick}: Props) {
    const router = useRouter()

    const handleBackClick = () => {
        if (onBackClick) {
            onBackClick()
        } else {
            router.back()
        }
    }

    return <div className={styles.container}>
        <img alt="Something went wrong" src="/images/error.png" />
        <div className={styles.title}>Something went wrong</div>
        <div className={styles.text}>We&apos;re not sure what caused this error. <span className={styles.link} onClick={handleBackClick}>Please try going back to the previous page and try again.</span> If the problem persists, please <span className={styles.link} onClick={() => showIntercom()}>reach out to us.</span></div>
        {button && <div className="mt-16">{button}</div>}
    </div>
}