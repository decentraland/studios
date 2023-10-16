import Cookies from "js-cookie";
import router from "next/router";
import useSWR, { mutate } from "swr";

export interface AuthData {
    expires_at: number
    access_token: string
    refresh_token: string
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
    const { data, isLoading, error } = useSWR('/api/conversations/get', fetchConversations, { refreshInterval: 1 * 60 * 1000, errorRetryInterval: 2000 })

    return { data, isLoading, error }
}

const fetcher = async (url: string, body: object) => fetch(url, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
})
    .then(res => res.json())
    .then(body => {
        if (body.data) {
            body.data.expires_at = Date.now() + body.data.expires
            Cookies.set("auth", JSON.stringify(body.data))
            // Cookies.set("auth", JSON.stringify(body.data), { sameSite: 'strict', secure: true })
            return mutate(`/api/user/me`).then(() => body.data as AuthData)
            // return body.data as AuthData;
        }

        if (body.errors && body.errors[0].message === "\"otp\" is required") {
            return { error: "missing otp" } as AuthData
        }

        if (body.errors && body.errors[0].message === "\"otp\" is invalid") {
            return { error: "The one-time password provided is invalid, please try again." } as AuthData
        }

        return { error: "We couldn't find an account with that email and password. Check your credentials and try again." } as AuthData
    })

const refreshLogin = async (user: AuthData) => {
    return fetcher('/api/user/refresh', {
        refresh_token: user.refresh_token
    })
}

export const login = async (email: string, password: string, otp?: string) => {
    return fetcher('/api/user/login', {
        email: email,
        password: password,
        otp: otp
    })
}

export const logout = async () => {
    await fetch('/api/user/logout')
    Cookies.remove("auth")
    mutate('/api/user/me', null)
    mutate('/api/conversations/get', null)
}

export const getLoggedState = async () => {
    const auth: AuthData = JSON.parse(Cookies.get("auth") || '{}')
    if (auth.access_token) {
        if (Date.now() > auth.expires_at) {
            const newUser = await refreshLogin(auth)
            if (!newUser.error) {
                return true
            }
        } else {
            // console.log('token not expired', Date.now())
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