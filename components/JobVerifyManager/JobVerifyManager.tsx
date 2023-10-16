import React, { useEffect, useState } from 'react'

import { useRouter } from 'next/router'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'
import ErrorScreen from '../ErrorScreen/ErrorScreen'
import { useUser } from '../../clients/Sessions'

function JobVerifyManager() {

    const [error, setError] = useState(false)

    const router = useRouter()
    const { id } = router.query

    const { user, userLoading  } = useUser()
    
    useEffect(() => {
        if (!id && router.isReady) {
            setError(true)
        }
        if (!userLoading && !user) {
            router.push("/login")
        }
        
        if (id){
            fetch(`/api/jobs/manage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ job_id: id })
            })
            .then((res) => {
                if (res.ok){
                    router.push(`/dashboard?id=${id}`)
                } else {
                    setError(true)
                }
            })
        }
    }, [user,userLoading,id])
    
    if (error) return <ErrorScreen />

    return <Loader active>Loading...</Loader>
}

export default JobVerifyManager