import React, { useState } from 'react'

import styles from './SetPassword.module.css'
import Form from '../Form/Form'
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '../../lib/password'

interface Props {
    stepDescription?: string
    isSubmitting?: boolean
    error?: string
    onSubmit: (password: string) => void
}

export default function SetPassword({ stepDescription, isSubmitting = false, error, onSubmit }: Props) {
    const [password, setPassword] = useState('')
    const [passwordConfirm, setPasswordConfirm] = useState('')

    const passwordTooShort = !!password && password.length < PASSWORD_MIN_LENGTH
    const passwordTooLong = password.length > PASSWORD_MAX_LENGTH
    const passwordConfirmError = !!password && !!passwordConfirm && (password !== passwordConfirm)
    const disableSubmit = !password || !passwordConfirm || passwordTooShort || passwordTooLong || passwordConfirmError || isSubmitting

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (disableSubmit) return
        onSubmit(password)
    }

    return <div className={styles.container}>
        <Form onSubmit={handleSubmit}
            stepTitle='Set your password'
            stepDescription={stepDescription} >

            <Form.Label>Create a password</Form.Label>
            <Form.InputText required
                type='password'
                value={password}
                placeholder="*******"
                onChange={(e) => setPassword(e.currentTarget.value)} />
            <Form.FieldMessage message={passwordTooLong ? `${PASSWORD_MAX_LENGTH} Characters maximum` : `${PASSWORD_MIN_LENGTH} Characters minimum`}
                icon="info"
                red={passwordTooShort || passwordTooLong} />

            <Form.Label>Confirm your password</Form.Label>
            <Form.InputText required
                type='password'
                value={passwordConfirm}
                placeholder="*******"
                onChange={(e) => setPasswordConfirm(e.currentTarget.value)} />
            <Form.FieldMessage message={passwordConfirmError ? "Please verify password and confirmation" : ""}
                icon={passwordConfirmError ? "info" : ""}
                red />

            <Form.ButtonSubmit disabled={disableSubmit}
                value="CONTINUE" />
            {error && <Form.FieldMessage icon="info" red message={error} />}
        </Form>
    </div>
}
