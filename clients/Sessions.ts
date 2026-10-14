import Cookies from "js-cookie";
import router from "next/router";
import useSWR, { mutate } from "swr";

export interface AuthData {
    expires_at: number
    error: string
}

const getUserData = async (url: string) => {
    return getLoggedState().then((logged) => logged && fetch(url)
        .then(res => res.ok && res.json())
        .then(body => body.data))
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

const fetcher = async (url: string, body?: object) => fetch(url, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(body || {})
})
    .then(res => res.json().catch(() => ({})))
    .then(body => {
        if (body.data) {
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

const refreshLogin = async () => {
    return fetcher('/api/user/refresh')
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
    // The current `auth` cookie is HttpOnly, so a readable one is a legacy session with exposed tokens
    if (!expiresAt && Cookies.get("auth")) {
        Cookies.remove("auth")
        return false
    }
    if (expiresAt) {
        if (Date.now() > expiresAt) {
            const newUser = await refreshLogin()
            if (!newUser.error) {
                return true
            }
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