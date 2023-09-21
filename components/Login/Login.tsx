import React, { useState } from 'react'

import styles from './Login.module.css'
import { openIntercom, trackLink } from '../utils'
import { login } from '../sessions'
import { useRouter } from 'next/router'
import IconInfo from '../Icons/IconInfo'
import BackButton from '../BackButton/BackButton'

const JOIN_REGISTRY_URL = process.env.NEXT_PUBLIC_JOIN_REGISTRY_URL

export default function Login() {

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [otp, setOtp] = useState<string>()
    const [credentialsError, setCredentialsError] = useState<string>()
    const [invalidClass, setInvalidClass] = useState('')
    const [otpScreen, setOtpScreen] = useState(false)

    const router = useRouter()

    const emptyFields = !(email && password)

    const goToPrevPage = (logged= false) => {

        let navHist = JSON.parse(globalThis.sessionStorage.navHist || '[]')
        
        if (navHist.length > 1){
            navHist.pop()

            if (!logged) {
                navHist = navHist.filter((e: string) => !(e.includes('/jobs/list') || e === '/login'))
            }

            router.push(navHist.pop())
        } else {
            router.push('/')
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setInvalidClass('')
        login(email, password, otp)
            .then(res => {
                if (res.access_token){
                    goToPrevPage(true)
                } else if (res.error && res.error === 'missing otp'){
                    setCredentialsError(undefined)
                    setOtpScreen(true)
                } else if (res.error){
                    setCredentialsError(res.error)
                } else {
                    goToPrevPage()
                }
            })
    }

    const join_link = <a target={'_blank'}
        href={JOIN_REGISTRY_URL}
        rel="noreferrer"
        onClick={() => trackLink('Open External Link', 'Join Registry', `${JOIN_REGISTRY_URL}`)}>register here</a>

    const contact_link = <a href=""
    rel="noreferrer"
    onClick={(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => { 
        e.preventDefault()
        openIntercom()
    }}>contact us</a>

    const credentialsMessage = credentialsError ? <div className={styles.credentialsMessage}> <IconInfo />{credentialsError} </div> : null

    return <div className={styles.container}>
        <BackButton onClick={() => goToPrevPage()}/>
        <div className={styles.formContainer}>
            <div className={styles.header}>
                <div className={styles.title}>Log in to find your next project</div>
                <div className={styles.description}>
                    <div>The job board is exclusive for verified Decentraland studios.
                    Use your <a target={'_blank'} rel="noreferrer" href="https://admin.dclstudios.org/">back office</a> platform credentials to log in.</div>
                </div>
            </div>
            <form onSubmit={handleSubmit} onInvalid={() => setInvalidClass('input__invalid')}>
                { !otpScreen ? <>
                <label className={styles.label}>Email</label>
                <input key="email" className={`${styles.input} ${styles[invalidClass]}`} required type='email' onChange={(e) => setEmail(e.currentTarget.value)} value={email} placeholder="studioname@studio.com"/>
                <label className={styles.label}>Password</label>
                <input key="password" className={styles.input} required type='password' onChange={(e) => setPassword(e.currentTarget.value)} value={password} placeholder="*******" />
                {credentialsMessage}
                <div className={styles.forgotPassword}><a href="https://admin.dclstudios.org/admin/reset-password" target="_blank" rel="noreferrer">Forgot your password?</a></div>
                </>
                :
                <>
                <label className={styles.label}>One-time password</label>
                <input key="otp" className={styles.input} required type='text' onChange={(e) => setOtp(e.currentTarget.value)} value={otp} placeholder="" />
                {credentialsError ? credentialsMessage : <div className={`${styles.credentialsMessage} ${styles.text_secondary}`}><IconInfo gray /> This is the 2FA code you use to access the back office.</div>}
                </>}
                <input
                    className={`${styles.submitBtn} ${emptyFields ? styles.submitBtn_disabled : ''}`}
                    disabled={emptyFields}
                    type="submit"
                    value="LOG IN"
                />
            </form>
            <div className={styles.description}>The job board is exclusive for Decentraland Studios. If you want to become one, {join_link}. If you are already part of this community and need help logging in, {contact_link}.</div>
        </div>
    </div>
}