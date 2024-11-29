import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Mail } from 'lucide-react';
import CharacterImage from './components/CharacterImage';

const AboutPage = () => {
  return (
    <div className="flex flex-col items-center p-8">
      <h1 className="text-4xl font-bold mb-6">About Me</h1>

      <CharacterImage />

      <section className="mb-8 text-center max-w-2xl">
        <h2 className="text-2xl font-semibold mb-4">Hi, I'm Mason</h2>
        <p className="mb-4">
          I've been playing MapleStory on and off since 2008, and have been playing Kronos & my Cannon Master (IGN Zakum) since 2016 (with many breaks in-between).
        </p>
        <p>
          I originally started this website solely for my <Link href="/cash-shop" target="_blank" className="text-blue-500">Cash Shop preview tool</Link>, however I started creating some more tools for it. I hope to eventually add many useful pages to this site, but the time I spend working on this site is somewhat limited, so please be patient :)
        </p>
      </section>

      <section className="mb-8 text-center max-w-2xl">
        <h2 className="text-2xl font-semibold mb-4">Support</h2>
        <p className="mb-4">
          If you find the tools on this site useful to you, and wish to support the maintenance and future development of the website, you can do so at the links below:
        </p>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col items-center">
            <div className="w-72 h-32 relative mb-4 p-4 bg-white rounded-lg shadow-md">
              <Link
                href="https://ko-fi.com/masonym"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full h-full"
              >
                <Image
                  src="/images/kofi-logo.png"
                  alt="Ko-fi Logo"
                  fill
                  style={{ objectFit: 'contain' }}
                  className='p-4'
                />
              </Link>
            </div>
            <p>Support me on Ko-fi</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-72 h-32 relative mb-4 p-4 bg-white rounded-lg shadow-md">
              <Link
                href="https://www.paypal.com/donate/?hosted_button_id=PDMFY3KMSNWQ2"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full h-full"
              >
                <Image
                  src="/images/paypal-logo.svg"
                  alt="PayPal Logo"
                  fill
                  style={{ objectFit: 'contain' }}
                  className='p-4'
                />
              </Link>
            </div>
            <p>Donate via PayPal</p>
          </div>
        </div>
      </section>

      <section className="mb-8 text-center max-w-2xl flex flex-col items-center">
        <h2 className="text-2xl font-semibold mb-4">Get in Touch</h2>
        <p className="">
          If you notice an issue with the site, or have suggestions, questions, concerns, or otherwise; please feel free to reach me at the email below.
        </p>
        <Link href="mailto:contact@masonym.dev" target="_blank" className="flex flex-col items-center text-blue-500 underline">
          <Mail className='w-16 h-auto mt-4 text-center' />
          contact@masonym.dev
        </Link>
        <p></p>
      </section>
    </div>
  );
};

export default AboutPage;