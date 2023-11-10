import React, { useEffect, useState } from 'react'

import styles from './UserVerify.module.css'
import { useRouter } from 'next/router'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'
import Link from 'next/link'

function UserVerify() {
  const [verifyOk, setVerifyOk] = useState(false)
  const [isLoading, setLoading] = useState(true)

  const router = useRouter()
  const { id } = router.query

  useEffect(() => {
    if (id) {
      setLoading(true)
      fetch(`/api/user/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: id })
      })
        .then((res) => {
          setVerifyOk(res.ok)
          setLoading(false)
        })
    }
  }, [id])

  if (isLoading) return <Loader active>Loading...</Loader>

  if (!verifyOk) return <div className={styles.subtitle} style={{ margin: 'auto' }}>Wrong link</div>

  return <div className={styles.container}>
    <img className={styles.image} alt='Welcome to Decentraland Studios!' src="/images/done_circle.webp" />

    <div className={styles.title}>
    Welcome to Decentraland Studios!
    </div>
    <div className={styles.subtitle}>
      Take a look at our list of <Link href="/studios">verified studios,</Link> or head to your dashboard, start a project and collaborate with talented studios to bring your brand to Decentraland.
    </div>
    {/* TODO: fix Open Dashboard link url */}
    <Link href="/dashboard"><span className={`button_primary mt-3r`}>OPEN DASHBOARD</span></Link>
    
  </div>
}

export default UserVerify