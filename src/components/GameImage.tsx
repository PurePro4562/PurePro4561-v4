import React, { useState } from 'react';
import { LucideIcon } from 'lucide-react';

interface GameImageProps {
  src: string | null;
  alt: string;
  icon?: LucideIcon;
  className?: string;
}

const GameImage: React.FC<GameImageProps> = ({ src, alt, icon: Icon, className }) => {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div className={`flex items-center justify-center bg-zinc-800 ${className}`}>
        {Icon ? <Icon className="w-16 h-16 text-zinc-500" strokeWidth={1.5} /> : <div className="w-16 h-16 bg-zinc-700 rounded-full" />}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`object-cover ${className}`}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
    />
  );
};

export default GameImage;
