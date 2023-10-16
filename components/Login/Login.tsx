import React, { useState } from 'react'

import styles from './Login.module.css'
import { login } from '../../clients/Sessions'
import { useRouter } from 'next/router'
import { mutate } from 'swr'
import Link from 'next/link'
import Form from '../Form/Form'

export default function Login() {

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [otp, setOtp] = useState<string>()
    const [credentialsError, setCredentialsError] = useState<string>()
    const [invalidInput, setInvalidInput] = useState(false)
    const [otpScreen, setOtpScreen] = useState(false)

    const router = useRouter()

    const dashboard = router.query.dashboard

    const emptyFields = !(email && password)

    const goToPrevPage = (logged = false) => {

        let navHist = JSON.parse(globalThis.sessionStorage.navHist || '[]')

        if (navHist.length > 1) {

            navHist = navHist.filter((e: string) => e !== '/login')
            if (!logged) {
                navHist = navHist.filter((e: string) => (!e.includes('/jobs') && e !== '/dashboard'))
            }

            router.push(navHist.pop())
        } else {
            router.push('/')
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setInvalidInput(false)
        const res = await login(email, password, otp)
        if (res.access_token) {
            await mutate(`/api/user/me`)
            await mutate(`/api/messages/get`)
            {
                dashboard ?
                    router.push('/dashboard')
                    :
                    goToPrevPage(true)
            }
        } else if (res.error && res.error === 'missing otp') {
            setCredentialsError(undefined)
            setOtpScreen(true)
        } else if (res.error) {
            setCredentialsError(res.error)
        } else {
            goToPrevPage()
        }
    }

    return <div className={styles.container}>
        <Form onBack={() => goToPrevPage()}
            logo
            onSubmit={handleSubmit}
            onInvalid={() => setInvalidInput(true)}
            stepTitle={'Log in'}>

            {!otpScreen ? <>
                <Form.Label>Email</Form.Label>
                <Form.InputText key="email" invalid={invalidInput} required type='email' onChange={(e) => setEmail(e.currentTarget.value)} value={email} placeholder="studioname@studio.com" />
                <Form.Label>Password</Form.Label>
                <Form.InputText key="password" required type='password' onChange={(e) => setPassword(e.currentTarget.value)} value={password} placeholder="*******" />
                {credentialsError && <Form.FieldMessage icon="info" red message={credentialsError} />}
                <div className={styles.forgotPassword}><a href="https://admin.dclstudios.org/admin/reset-password" target="_blank" rel="noreferrer">Forgot your password?</a></div>
            </>
                :
                <>
                    <Form.Label>One-time password</Form.Label>
                    <Form.InputText key="otp" required type='text' onChange={(e) => setOtp(e.currentTarget.value)} value={otp} placeholder="" />
                    <Form.FieldMessage icon="info" red={!!credentialsError} message={credentialsError || "This is the 2FA code you use to access the back office."} />
                </>}
            <Form.ButtonSubmit
                disabled={emptyFields}
                value="LOG IN"
            />
            {!otpScreen && <div className={styles.text}>Don’t have an account yet? <Link href="/signup">Register</Link></div>}
        </Form>
    </div>
}