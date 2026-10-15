import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'

import type { TurnstileAction } from '../../lib/turnstile'
import IconInfo from '../Icons/IconInfo'

import styles from './Turnstile.module.css'

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
const SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

interface RenderOptions {
    sitekey: string
    action?: string
    appearance?: 'always' | 'execute' | 'interaction-only'
    callback?: (token: string) => void
    'expired-callback'?: () => void
    'error-callback'?: (code: string) => void
}

declare global {
    interface Window {
        turnstile?: {
            render: (container: HTMLElement, options: RenderOptions) => string
            reset: (widgetId: string) => void
            remove: (widgetId: string) => void
        }
    }
}

let scriptLoading: Promise<void> | undefined

/**
 * Loads the Turnstile script once and resolves when `window.turnstile` is available. A failed load isn't cached, so a
 * later call (e.g. the widget mounting again) retries it.
 */
export function loadTurnstile(): Promise<void> {
    if (window.turnstile) return Promise.resolve()

    if (!scriptLoading) {
        scriptLoading = new Promise<void>((resolve, reject) => {
            const script = document.createElement('script')
            const fail = () => {
                script.remove()
                scriptLoading = undefined
                reject(new Error('Turnstile script failed to load'))
            }
            script.src = SCRIPT_URL
            script.async = true
            script.onload = () => window.turnstile ? resolve() : fail()
            script.onerror = fail
            document.head.appendChild(script)
        })
    }

    return scriptLoading
}

// Errors in a row (without a token in between) after which the widget stops reporting that it's retrying
const MAX_CONSECUTIVE_ERRORS = 2

/**
 * Whether a Turnstile client-side error code won't go away by retrying: 110xxx are configuration errors (invalid
 * sitekey, unknown domain, invalid action or cData, unsupported browser) except the 1106xx challenge timeouts, and
 * 400xxx are invalid or disabled sitekeys. Other families (e.g. 600xxx, a failed challenge) are worth one retry.
 */
function isTerminalError(code: string) {
    return (code.startsWith('110') && !code.startsWith('1106')) || code.startsWith('400')
}

export interface TurnstileHandle {
    reset: () => void
}

interface Props {
    action: TurnstileAction
    onToken: (token?: string) => void
}

const Turnstile = forwardRef<TurnstileHandle, Props>(function Turnstile({ action, onToken }, ref) {
    const container = useRef<HTMLDivElement>(null)
    const widgetId = useRef<string>()
    const onTokenRef = useRef(onToken)
    const errorCount = useRef(0)
    // 'failed': the script or the site key is missing. 'retrying': the widget errored and is retrying by itself.
    // 'error': the widget can't recover by itself (a configuration error, or it kept failing).
    const [status, setStatus] = useState<'failed' | 'retrying' | 'error'>()

    onTokenRef.current = onToken

    useEffect(() => {
        if (!SITE_KEY) {
            setStatus('failed')
            return
        }

        let unmounted = false
        let id: string | undefined

        loadTurnstile()
            .then(() => {
                if (unmounted || !container.current || !window.turnstile) return

                errorCount.current = 0
                setStatus(undefined)
                id = window.turnstile.render(container.current, {
                    sitekey: SITE_KEY,
                    action,
                    appearance: 'interaction-only',
                    callback: (token) => {
                        errorCount.current = 0
                        setStatus(undefined)
                        onTokenRef.current(token)
                    },
                    'expired-callback': () => onTokenRef.current(undefined),
                    'error-callback': (code) => {
                        errorCount.current++
                        const terminal = isTerminalError(`${code}`) || errorCount.current >= MAX_CONSECUTIVE_ERRORS
                        setStatus(terminal ? 'error' : 'retrying')
                        onTokenRef.current(undefined)
                    },
                })
                widgetId.current = id
            })
            .catch(() => {
                if (!unmounted) setStatus('failed')
            })

        return () => {
            unmounted = true
            if (id) {
                window.turnstile?.remove(id)
                widgetId.current = undefined
            }
            // A token from a removed widget (e.g. a previous signup step) was issued for another action
            onTokenRef.current(undefined)
        }
    }, [action])

    useImperativeHandle(ref, () => ({
        reset: () => {
            widgetId.current && window.turnstile?.reset(widgetId.current)
        }
    }), [])

    const retry = () => {
        errorCount.current = 0
        setStatus(undefined)
        widgetId.current && window.turnstile?.reset(widgetId.current)
    }

    return <>
        <div ref={container} className={styles.container} />
        {status === 'failed' && <div className={styles.error} role="alert">
            <IconInfo red />
            Security check couldn&apos;t load. Disable content blockers or try again later.
        </div>}
        {status === 'retrying' && <div className={styles.notice} role="status">
            <IconInfo />
            Retrying security check…
        </div>}
        {status === 'error' && <div className={styles.error} role="alert">
            <IconInfo red />
            Security check failed. Reload the page or try a different browser.
            <button type="button" className={styles.retry} onClick={retry}>Try again</button>
        </div>}
    </>
})

/**
 * Whether a request was rejected by the Turnstile check of its API route (see `turnstileRejected` in lib/turnstile).
 * Reads the response body.
 */
export async function isTurnstileRejection(res: Response) {
    if (res.status !== 400) return false
    const body = await res.json().catch(() => undefined)
    return body?.errors?.[0]?.message === 'captcha'
}

/**
 * Holds the token of a <Turnstile> widget rendered for `action`, which the API route checks when verifying the token.
 * Tokens are single-use: get the token with `take` right before sending a request, which also resets the widget, so a
 * second submit can't send it again.
 */
export function useTurnstile(action: TurnstileAction) {
    const ref = useRef<TurnstileHandle>(null)
    const tokenRef = useRef<string>()
    const [token, setToken] = useState<string>()

    const onToken = useCallback((newToken?: string) => {
        tokenRef.current = newToken
        setToken(newToken)
    }, [])

    const take = useCallback(() => {
        const current = tokenRef.current
        if (!current) return undefined
        onToken(undefined)
        ref.current?.reset()
        return current
    }, [onToken])

    return { ref, action, token, onToken, take }
}

export default Turnstile
