"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ModeToggle from '../ModeToggle/ModeToggle';
import { Menu } from 'lucide-react';
import HamburgerMenu from '../HamburgerMenu/HamburgerMenu';
import Logo from '@/assets/Eqp_Zakum_Helmet.png'; // 36 x 34

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="bg-primary-dark p-5 flex justify-between items-center">
      {/* Menu + Logo + Title */}
      <div className="flex flex-1 items-center">
        <button onClick={toggleMenu} className="bg-transparent border-none mr-2.5">
          <Menu color='var(--primary)' />
        </button>
        <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
        <Link href="/" className="flex flex-row items-center gap-2.5">
          <Image
            src={Logo}
            width={36}
            height={34}
            alt="Zakum Helmet as a logo"
          />
          <h3 className="text-primary">mason's maple matrix</h3>
        </Link>
      </div>
      <div className="flex flex-1 justify-center items-center">
        <Link href="/about">
          About
        </Link>
        <Link href="/changelog" className="ml-5">
          Changelog
        </Link>
      </div>
      <div className="flex flex-1 justify-end items-center">
        <ModeToggle />
      </div>
    </div>
  );
};

export default NavBar;
