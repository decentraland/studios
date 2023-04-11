import React, { useEffect, useState } from 'react'

import styles from './JobVerify.module.css'
import { useRouter } from 'next/router'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'

function JobVerify() {
  const [verifyOk, setVerifyOk] = useState(false)
  const [isLoading, setLoading] = useState(true)

  const router = useRouter()
  const { id } = router.query

  useEffect(() => {
    if (id){
      setLoading(true)
      fetch(`/api/jobs/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({id: id})
        })
        .then((res) => {
            setVerifyOk(res.ok)
            setLoading(false)
        })
    }
  }, [id])

  if (isLoading) return <Loader active>Loading...</Loader>

  if (!verifyOk ) return <div className={styles.subtitle} style={{margin: 'auto'}}>Wrong link</div>


  return <div className={styles.container}>
      <div className={styles.title}>
        Congratulations
      </div>
      <div className={styles.subtitle}>
        Your job has been published!
      </div>
    </div>
}

export default JobVerify