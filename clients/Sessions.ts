import Cookies from "js-cookie";
import router from "next/router";
import useSWR, { mutate } from "swr";

export interface AuthData {
    expires?: number
    expires_at: number
    error: string
}

const getUserData = async (url: string) => {
    return getLoggedState().then((logged) => logged && fetch(url)
        .then(res => res.ok ? res.json() : res.body?.cancel())
        .then(body => body?.data))
}

export const useUser = () => {
    const { data, error, isLoading } = useSWR(`/api/user/me`, getUserData, { refreshInterval: 1 * 60 * 1000 })

    return {
        user: data,
        userLoading: isLoading,
        isError: error
    }
}

const fetchConversations = async (url: string) => {
    return fetch(url).then(res => res?.json())
}

export const useMessages = () => {
    const { data, isLoading, error } = useSWR('/api/conversations/get', fetchConversations, { refreshInterval: 1 * 60 * 1000, errorRetryInterval: 500 })

    return { data, isLoading, error }
}

// The expiration is computed on the client clock from the token TTL, so server clock skew doesn't matter
const storeExpiration = (data: { expires?: number, expires_at?: number }) => {
    if (typeof data.expires !== 'number') return
    data.expires_at = Date.now() + data.expires
    Cookies.set("auth_expires", String(data.expires_at), { secure: true, sameSite: 'lax', path: '/' })
}

const parseAuthResponse = (res: Response) => res.json().catch(() => ({}))
    .then(body => {
        if (body.data) {
            storeExpiration(body.data)
            return mutate(`/api/user/me`).then(() => body.data as AuthData)
        }

        if (body.errors && body.errors[0]?.message === "\"otp\" is required") {
            return { error: "missing otp" } as AuthData
        }

        if (body.errors && body.errors[0]?.message === "\"otp\" is invalid") {
            return { error: "The one-time password provided is invalid, please try again." } as AuthData
        }

        return { error: "We couldn't find an account with that email and password. Check your credentials and try again." } as AuthData
    })

const post = (url: string, body?: object) => fetch(url, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(body || {})
})

const fetcher = async (url: string, body?: object) => post(url, body).then(parseAuthResponse)

// Without Web Locks a tab can't tell whether another one is refreshing, so a rejected refresh
// waits this long for a concurrent refresh to store its session before logging out
const REJECTED_REFRESH_GRACE_MS = 1500

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const hasFreshSession = () => Number(Cookies.get("auth_expires")) > Date.now()

/**
 * Directus rotates refresh tokens, so when two tabs refresh at once one of them is rejected.
 * A rejected refresh only logs out when no other tab stored a newer session meanwhile.
 */
const requestRefresh = async (waitForOtherTabs: boolean) => {
    const previousExpiresAt = Cookies.get("auth_expires")
    const res = await post('/api/user/refresh').catch(() => undefined)

    if (res?.ok) {
        const data = await parseAuthResponse(res)
        if (!data.error) return true
    } else {
        await res?.body?.cancel()
    }

    // Only a rejected refresh token ends the session, outages keep it so the refresh is retried later
    if (res?.status !== 401) return Cookies.get("auth_expires") !== previousExpiresAt && hasFreshSession()

    if (waitForOtherTabs) await wait(REJECTED_REFRESH_GRACE_MS)

    if (Cookies.get("auth_expires") !== previousExpiresAt) return hasFreshSession()

    Cookies.remove("auth_expires")
    return false
}

/**
 * Refreshes are serialized across tabs with the Web Locks API: a tab that waited for the lock
 * finds the session another tab just refreshed and doesn't spend the rotated refresh token.
 */
const refreshAcrossTabs = (): Promise<boolean> => {
    if (typeof navigator !== 'undefined' && navigator.locks) {
        return navigator.locks.request('auth-refresh', async () => hasFreshSession() || requestRefresh(false))
    }
    return requestRefresh(true)
}

// Concurrent callers in the same tab share one refresh
let refreshInFlight: Promise<boolean> | undefined

const refreshLogin = () => {
    if (!refreshInFlight) {
        refreshInFlight = refreshAcrossTabs().finally(() => {
            refreshInFlight = undefined
        })
    }
    return refreshInFlight
}

export const login = async (email: string, password: string, otp?: string) => {
    return fetcher('/api/user/login', {
        email: email,
        password: password,
        otp: otp
    })
}

export const logout = async () => {
    await fetch('/api/user/logout', { method: 'POST' })
    Cookies.remove("auth_expires")
    mutate('/api/user/me', null)
    mutate('/api/conversations/get', null)
}

// The session tokens live in an HttpOnly cookie; only their expiration time is readable here.
export const getLoggedState = async () => {
    const expiresAt = Number(Cookies.get("auth_expires"))
    // The session cookie (`__Host-auth`) is HttpOnly, so a readable `auth` one is a legacy session with exposed tokens
    if (!expiresAt && Cookies.get("auth")) {
        Cookies.remove("auth")
        return false
    }
    if (expiresAt) {
        if (Date.now() > expiresAt) {
            return refreshLogin()
        } else {
            return true
        }
    }
    return false
}

export const fetchAuth = (url: string, body?: object) => getLoggedState().then(logged => {
    if (logged) {
        return fetch(url, body)
    } else {
        router.push('/login')
    }
})
