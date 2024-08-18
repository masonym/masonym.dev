import React from 'react'
import styles from './NavBar.module.css'
import Logo from '@/assets/Eqp_Zakum_Helmet.png' // 36 x 34
import Image from 'next/image'
import Link from 'next/link'
import ModeToggle from '../ModeToggle/ModeToggle'

const NavBar = () => {
  return (
    <div className={styles.headerContainer}>
      <Link href="/" className={styles.logoContainer}>
        <Image
          src={Logo}
          width={36}
          height={34}
          alt="Zakum Helmet as a logo"
        />
        <h3 className={styles.headerTitle}>mason's maple matrix</h3>
      </Link>
      <ModeToggle/>
    </div>
  )
}

export default NavBar