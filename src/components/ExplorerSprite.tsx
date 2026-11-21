import React from 'react';
import { AccessoryId, AvatarId } from '../types/game';
import { ASSETS } from '../data/worlds';
import { ResilientImage } from './ResilientImage';

interface ExplorerSpriteProps {
  avatar: AvatarId;
  accessory: AccessoryId;
  isMoving?: boolean;
  facing?: 'left' | 'right';
  size?: 'sm' | 'md' | 'lg';
  playerName?: string;
}

export const ExplorerSprite: React.FC<ExplorerSpriteProps> = ({
  avatar,
  accessory,
  isMoving = false,
  facing = 'right',
  size = 'md',
  playerName,
}) => {
  const dimensions =
    size === 'sm'
      ? 'w-11 h-11'
      : size === 'lg'
      ? 'w-24 h-24'
      : 'w-16 h-16';

  const avatarSrc = avatar === 'bima' ? ASSETS.avatarBima : ASSETS.avatarSari;
  const avatarAlt = avatar === 'bima' ? 'Karakter Penjelajah Bima' : 'Karakter Penjelajah Sari';

  return (
    <div className="relative inline-flex flex-col items-center select-none">
      {/* Ground shadow */}
      {size === 'md' && (
        <div
          className="absolute -bottom-1.5 w-11 h-3 rounded-full bg-slate-950/30 blur-[2px] pointer-events-none"
          aria-hidden="true"
        />
      )}

      <div
        className={`relative ${dimensions} ${
          isMoving ? 'animate-walk-bob' : 'animate-float-slow'
        } transition-transform duration-150`}
        style={{
          transform: facing === 'left' ? 'scaleX(-1)' : 'scaleX(1)',
        }}
      >
        {/* Sayap Pelangi behind character */}
        {accessory === 'sayap-pelangi' && (
          <svg
            viewBox="0 0 100 100"
            className="absolute -inset-2 w-[124%] h-[124%] -left-[12%] -top-[10%] pointer-events-none drop-shadow"
            aria-hidden="true"
          >
            <path
              d="M18 52 C2 32, 8 18, 28 32 Z"
              fill="#10B981"
              stroke="#064E3B"
              strokeWidth="2"
            />
            <path
              d="M15 58 C0 48, 4 34, 24 44 Z"
              fill="#F59E0B"
              stroke="#78350F"
              strokeWidth="2"
            />
            <path
              d="M82 52 C98 32, 92 18, 72 32 Z"
              fill="#0EA5E9"
              stroke="#0C4A6E"
              strokeWidth="2"
            />
            <path
              d="M85 58 C100 48, 96 34, 76 44 Z"
              fill="#F43F5E"
              stroke="#881337"
              strokeWidth="2"
            />
          </svg>
        )}

        {/* Character Portrait Token */}
        <div className="relative w-full h-full rounded-full overflow-hidden border-[3px] border-white shadow-lg bg-amber-50">
          <ResilientImage
            src={avatarSrc}
            alt={avatarAlt}
            className="w-full h-full object-cover"
            fallbackLabel={avatar === 'bima' ? 'Bima' : 'Sari'}
          />
        </div>

        {/* Topi Rimba */}
        {accessory === 'topi-rimba' && (
          <svg
            viewBox="0 0 80 40"
            className="absolute -top-[22%] left-[5%] w-[90%] pointer-events-none drop-shadow"
            aria-hidden="true"
          >
            <ellipse cx="40" cy="28" rx="36" ry="8" fill="#92400E" stroke="#451A03" strokeWidth="2" />
            <path d="M18 26 C20 10, 60 10, 62 26 Z" fill="#B45309" stroke="#451A03" strokeWidth="2" />
            <rect x="20" y="21" width="40" height="4" rx="2" fill="#F59E0B" />
          </svg>
        )}

        {/* Mahkota Bintang */}
        {accessory === 'mahkota-bintang' && (
          <svg
            viewBox="0 0 80 44"
            className="absolute -top-[28%] left-[12%] w-[76%] pointer-events-none drop-shadow"
            aria-hidden="true"
          >
            <path
              d="M12 36 L8 14 L26 24 L40 6 L54 24 L72 14 L68 36 Z"
              fill="#FBBF24"
              stroke="#92400E"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <circle cx="40" cy="22" r="4" fill="#EF4444" />
          </svg>
        )}

        {/* Kacamata Pintar */}
        {accessory === 'kacamata-pintar' && (
          <svg
            viewBox="0 0 80 30"
            className="absolute top-[33%] left-[14%] w-[72%] pointer-events-none"
            aria-hidden="true"
          >
            <rect x="8" y="6" width="24" height="16" rx="5" fill="rgba(56,189,248,0.28)" stroke="#0369A1" strokeWidth="3" />
            <rect x="48" y="6" width="24" height="16" rx="5" fill="rgba(56,189,248,0.28)" stroke="#0369A1" strokeWidth="3" />
            <line x1="32" y1="13" x2="48" y2="13" stroke="#0369A1" strokeWidth="3" />
          </svg>
        )}

        {/* Syal Merah Putih */}
        {accessory === 'syal-garuda' && (
          <svg
            viewBox="0 0 80 28"
            className="absolute -bottom-[6%] left-[14%] w-[72%] pointer-events-none drop-shadow"
            aria-hidden="true"
          >
            <path d="M10 6 Q40 18 70 6 L66 16 Q40 26 14 16 Z" fill="#DC2626" stroke="#7F1D1D" strokeWidth="2" />
            <path d="M18 13 Q40 22 62 13 L60 19 Q40 27 20 19 Z" fill="#FFFFFF" />
          </svg>
        )}
      </div>

      {playerName && (
        <span className="mt-1 px-2 py-0.5 rounded bg-slate-900/85 text-white text-[11px] font-semibold tracking-tight whitespace-nowrap shadow">
          {playerName}
        </span>
      )}
    </div>
  );
};
