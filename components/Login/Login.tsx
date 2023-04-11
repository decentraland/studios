import React, { useEffect, useState } from 'react'

import styles from './Login.module.css'
import { openIntercom, trackLink } from '../utils'
import { login } from '../sessions'
import { useRouter } from 'next/router'
import IconInfo from '../Icons/IconInfo'
import BackButton from '../BackButton/BackButton'

const JOIN_REGISTRY_URL = 'https://dclstudios.typeform.com/to/NfzmbzXi'

export default function Login() {

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [credentialsError, setCredentialsError] = useState(false)

    const router = useRouter()

    const emptyFields = !(email && password)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        login(email, password)
        .then(res => {
            if (res.error){
                setCredentialsError(true)
            } else {
                router.push(router.query?.from ? `${router.query.from}` : '/jobs')
            }
        })
    }

    const join_link = <a target={'_blank'}
        href={JOIN_REGISTRY_URL}
        rel="noreferrer"
        onClick={() => trackLink('Open External Link', 'Join Registry', JOIN_REGISTRY_URL)}>register here</a>

    const contact_link = <a href=""
    rel="noreferrer"
    onClick={(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => { 
        e.preventDefault()
        openIntercom()
    }}>contact us</a>

    const credentialsMessage = <div className={styles.credentialsMessage}>{credentialsError ? <><IconInfo />We couldn&apos;t find an account with that email and password. Check your credentials and try again.</> : null}</div>

    return <div className={styles.container}>
        <BackButton />
        <div className={styles.formContainer}>
            <div className={styles.header}>
                <div className={styles.title}>Log in to find your next project</div>
                <div className={styles.description}>
                    <div>The job board is exclusive for Decentraland creators.
                    Use your <a target={'_blank'} rel="noreferrer" href="https://admin.dclstudios.org/">back office</a> platform credentials to log in.</div>
                </div>
            </div>
            <form onSubmit={handleSubmit} >
                <label className={styles.label}>Email</label>
                <input className={styles.input} required type='email' onChange={(e) => setEmail(e.currentTarget.value)} value={email} placeholder="studioname@studio.com"/>
                <label className={styles.label}>Password</label>
                <input className={styles.input} required type='password' onChange={(e) => setPassword(e.currentTarget.value)} value={password} placeholder="*******" />
                {credentialsMessage}
                <input
                    className={`${styles.submitBtn} ${emptyFields ? styles.submitBtn_disabled : ''}`}
                    disabled={emptyFields}
                    type="submit"
                    value="LOGIN"
                />
            </form>
            <div className={styles.description}>The job board is exclusive for Decentraland Studios. If you want to become one, {join_link}. If you are already part of this community and need help logging in, {contact_link}.</div>
        </div>
    </div>
}