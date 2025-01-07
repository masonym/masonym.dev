'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const CharacterImage = () => {
  const [imageUrl, setImageUrl] = useState('/images/zakum.png');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchCharacterImage = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/character');
        const data = await response.json();

        if (data.ranks && data.ranks[0] && data.ranks[0].characterImgURL) {
          setImageUrl(data.ranks[0].characterImgURL);
        }
      } catch (error) {
        console.error('Error fetching character image:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Fetch initially
    fetchCharacterImage();

    // Set up interval to fetch every 30 minutes
    const interval = setInterval(fetchCharacterImage, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-48 h-48 relative mb-6">
      <Link
        href="https://mapleranks.com/u/Zakum"
        rel="noopener noreferrer"
        target="_blank"
      >
        <Image
          src={imageUrl}
          alt="My MapleStory Character"
          fill
          unoptimized
          className={`rounded-full transition-opacity duration-300 ${isLoading ? 'opacity-50' : 'opacity-100'}`}
        />
      </Link>
    </div>
  );
};

export default CharacterImage;
