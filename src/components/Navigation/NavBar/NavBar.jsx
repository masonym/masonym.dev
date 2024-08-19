"use client";

import React, { useState } from 'react'
import styles from './NavBar.module.css'
import Logo from '@/assets/Eqp_Zakum_Helmet.png' // 36 x 34
import Image from 'next/image'
import Link from 'next/link'
import ModeToggle from '../ModeToggle/ModeToggle'
import { Menu } from 'lucide-react'
import HamburgerMenu from '../HamburgerMenu/HamburgerMenu'

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className={styles.headerContainer}>
      {/* menu + logo + title */}
      <div className={styles.leftSection}>
        <button onClick={toggleMenu} className={styles.menuButton}>
          <Menu color='var(--primary)' />
        </button>
        <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
        <Link href="/" className={styles.logoContainer}>
          <Image
            src={Logo}
            width={36}
            height={34}
            alt="Zakum Helmet as a logo"
          />
          <h3 className={styles.headerTitle}>mason's maple matrix</h3>
        </Link>
      </div>
      <div className={styles.centerSection}>
        <Link href="/about">
          About
        </Link>
      </div>
      <div className={styles.rightSection}>
        <ModeToggle />
      </div>
    </div>
  )
}

export default NavBar