import { useState } from 'react';
import {
  Copy, Check, RotateCcw, KeyRound, X, AlertCircle,
  Heart, Star, Smile, Cloud, Sparkles, Rainbow, Send,
  Zap, Flower2, Music, Crown, Flame, Trash2,
} from 'lucide-react';
import { saveNote, loadNote } from './storage.js';

// ============================================================
// STAMPS — six bright 90s stickers-as-stamps
// ============================================================
const STAMPS = [
  { id: 'heart',    icon: Heart,    bg: '#ff5fa2', accent: '#fff0f5', name: 'Pink Hearts' },
  { id: 'star',     icon: Star,     bg: '#a566ff', accent: '#fff5d1', name: 'Purple Star' },
  { id: 'smile',    icon: Smile,    bg: '#ffd54f', accent: '#5a2a00', name: 'Happy Face' },
  { id: 'cloud',    icon: Cloud,    bg: '#5fcaff', accent: '#ffffff', name: 'Cloud 9' },
  { id: 'sparkles', icon: Sparkles, bg: '#ff8a3d', accent: '#fff5d1', name: 'Sparkles' },
  { id: 'rainbow',  icon: Rainbow,  bg: '#5dd39e', accent: '#ffffff', name: 'Rainbow' },
];

// 90s scrapbook stickers — tap a palette sticker to plop it on the letter,
// tap a placed sticker to peel it off
const STICKERS = [
  { id: 'wow',     type: 'text', text: 'WOW!', bg: '#ff5fa2', accent: '#ffffff' },
  { id: 'bff',     type: 'text', text: 'BFF',  bg: '#ffd54f', accent: '#2a1640' },
  { id: 'cool',    type: 'text', text: 'COOL', bg: '#5fcaff', accent: '#ffffff' },
  { id: 'hi',      type: 'text', text: 'HI★',  bg: '#5dd39e', accent: '#ffffff' },
  { id: 'yay',     type: 'text', text: 'YAY!', bg: '#a566ff', accent: '#ffffff' },
  { id: 'zap',     type: 'icon', icon: Zap,    bg: '#ffd54f', accent: '#2a1640' },
  { id: 'flower2', type: 'icon', icon: Flower2,bg: '#ff5fa2', accent: '#ffffff' },
  { id: 'music',   type: 'icon', icon: Music,  bg: '#a566ff', accent: '#ffffff' },
  { id: 'crown',   type: 'icon', icon: Crown,  bg: '#ffd54f', accent: '#5a2a00' },
  { id: 'flame',   type: 'icon', icon: Flame,  bg: '#ff8a3d', accent: '#ffffff' },
];

const MAX_STICKERS = 10;

// Placed stickers cluster across the top strip of the letter — a scrapbook-y
// band above the headline that doesn't run over the message body.
const randomPlacement = () => ({
  x: 14 + Math.random() * 72,
  y: 3 + Math.random() * 14,
  rot: -22 + Math.random() * 44,
  scale: 0.88 + Math.random() * 0.32,
});

const generateCode = () => {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const digits = '0123456789';
  let c = '';
  for (let i = 0; i < 2; i++) c += letters[Math.floor(Math.random() * letters.length)];
  c += '-';
  for (let i = 0; i < 4; i++) c += digits[Math.floor(Math.random() * digits.length)];
  return c;
};

// Color tokens — vibrant 90s pastels + neons
const C = {
  pinkHot: '#ff3d8a',
  pinkSoft: '#ffb3d9',
  pinkBlush: '#ffcfe5',
  purple: '#a566ff',
  purpleDeep: '#7e3eff',
  lavender: '#d4b5ff',
  yellow: '#ffd54f',
  yellowDeep: '#ffb800',
  mint: '#69e3b8',
  mintDeep: '#3dd1a1',
  sky: '#5fcaff',
  skyDeep: '#2bb3f0',
  peach: '#ffa07a',
  cream: '#fff8e7',
  paper: '#ffffff',
  ink: '#3d2a5e',
};

// ============================================================
// PRIMITIVES
// ============================================================
const BubblyLabel = ({ children, color = C.pinkHot, size = '0.7rem' }) => (
  <span style={{
    fontFamily: '"Fredoka", "Trebuchet MS", sans-serif',
    color, fontSize: size, letterSpacing: '0.18em', textTransform: 'uppercase',
    fontWeight: 700,
  }}>{children}</span>
);

// A 90s sticker-style postage stamp
const PostalStamp = ({ stamp, size = 50, selected = false, tilt = 0, canceled = false }) => {
  const Icon = stamp.icon;
  const w = size;
  const h = Math.round(size * 1.2);
  return (
    <div style={{
      width: w, height: h, position: 'relative', flexShrink: 0,
      transform: `rotate(${tilt}deg) ${selected ? 'scale(1.12)' : 'scale(1)'}`,
      transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
      filter: 'drop-shadow(2px 3px 0 rgba(0,0,0,0.18))',
      animation: selected ? 'stampBob 1.4s ease-in-out infinite' : undefined,
    }}>
      <div style={{
        position: 'absolute', inset: '4px',
        background: `
          radial-gradient(ellipse at 30% 25%, rgba(255,255,255,0.35) 0%, transparent 55%),
          ${stamp.bg}
        `,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: '1px',
        boxShadow: 'inset 0 0 0 2px rgba(0,0,0,0.12)',
      }}>
        <div style={{
          position: 'absolute', inset: '4px',
          border: `1.5px dashed ${stamp.accent}aa`,
          pointerEvents: 'none',
        }} />
        <Icon size={Math.round(size * 0.46)} color={stamp.accent} strokeWidth={2.4} fill={stamp.accent + '33'} />
        <span style={{
          fontFamily: '"Bagel Fat One", "Fredoka", sans-serif',
          fontSize: Math.round(size * 0.2) + 'px',
          color: stamp.accent, lineHeight: 1, marginTop: '1px',
          letterSpacing: '0.02em',
        }}>10¢</span>
      </div>
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `
          radial-gradient(circle 2.2px at 0 0, #ffffff 99%, transparent) 0 0 / 8px 8px repeat-x,
          radial-gradient(circle 2.2px at 0 0, #ffffff 99%, transparent) 0 100% / 8px 8px repeat-x,
          radial-gradient(circle 2.2px at 0 0, #ffffff 99%, transparent) 0 0 / 8px 8px repeat-y,
          radial-gradient(circle 2.2px at 0 0, #ffffff 99%, transparent) 100% 0 / 8px 8px repeat-y
        `,
      }} />
      {canceled && (
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: `repeating-linear-gradient(155deg,
            transparent 0, transparent 6px,
            rgba(30, 20, 60, 0.5) 6px, rgba(30, 20, 60, 0.5) 7px,
            transparent 7px, transparent 11px)`,
          mixBlendMode: 'multiply',
        }} />
      )}
    </div>
  );
};

const StickerSeal = ({ initial, size = 60 }) => (
  <div style={{
    width: size, height: size, position: 'relative', flexShrink: 0,
    filter: 'drop-shadow(2px 3px 0 rgba(0,0,0,0.15))',
  }}>
    <div style={{
      width: '100%', height: '100%',
      background: `
        radial-gradient(circle at 30% 28%, rgba(255,255,255,0.7) 0%, transparent 35%),
        conic-gradient(from 45deg,
          ${C.pinkHot}, ${C.yellow}, ${C.mint}, ${C.sky}, ${C.purple}, ${C.pinkHot})
      `,
      clipPath: 'polygon(50% 0%, 61% 12%, 79% 4%, 84% 22%, 100% 25%, 92% 41%, 100% 55%, 84% 64%, 90% 82%, 72% 80%, 65% 100%, 50% 88%, 35% 100%, 28% 80%, 10% 82%, 16% 64%, 0% 55%, 8% 41%, 0% 25%, 16% 22%, 21% 4%, 39% 12%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative',
    }}>
      <div style={{
        width: '60%', height: '60%', borderRadius: '50%',
        background: '#ffffff',
        boxShadow: 'inset 0 -3px 6px rgba(0,0,0,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: `2px dashed ${C.pinkHot}`,
      }}>
        <span style={{
          fontFamily: '"Bagel Fat One", "Fredoka", sans-serif',
          fontSize: size * 0.38, color: C.pinkHot,
          lineHeight: 1, textTransform: 'uppercase',
        }}>{initial || '★'}</span>
      </div>
    </div>
  </div>
);

const Sticker = ({ sticker, size = 50 }) => {
  const isText = sticker.type === 'text';
  const Icon = sticker.icon;
  return (
    <div style={{
      borderRadius: isText ? `${size}px` : '50%',
      width: isText ? 'auto' : size,
      height: isText ? 'auto' : size,
      background: `
        radial-gradient(ellipse at 30% 25%, rgba(255,255,255,0.45) 0%, transparent 50%),
        ${sticker.bg}
      `,
      color: sticker.accent,
      border: '3px solid #ffffff',
      boxShadow: '0 3px 0 rgba(40, 20, 80, 0.22), 0 5px 10px rgba(0,0,0,0.18)',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      padding: isText ? `${Math.round(size * 0.18)}px ${Math.round(size * 0.34)}px` : '0',
      flexShrink: 0, whiteSpace: 'nowrap',
    }}>
      {isText ? (
        <span style={{
          fontFamily: '"Bagel Fat One", "Fredoka", sans-serif',
          fontSize: `${Math.round(size * 0.42)}px`,
          lineHeight: 1, letterSpacing: '0.02em',
          textShadow: '1px 1px 0 rgba(0,0,0,0.15)',
        }}>{sticker.text}</span>
      ) : (
        <Icon size={Math.round(size * 0.58)} color={sticker.accent}
              fill={`${sticker.accent}55`} strokeWidth={2.6} />
      )}
    </div>
  );
};

const MailboxFace = ({ happy = false }) => {
  const eyeAnim = happy ? 'none' : 'blink 5s ease-in-out infinite';
  return (
    <div style={{
      position: 'absolute', top: '14px', left: '50%',
      transform: 'translateX(-50%)',
      width: '130px', height: '46px',
      pointerEvents: 'none', zIndex: 8,
    }}>
      <div style={{
        position: 'absolute', top: '20px', left: '2px',
        width: '14px', height: '8px', borderRadius: '50%',
        background: `radial-gradient(ellipse, ${C.pinkHot}cc 0%, transparent 80%)`,
        filter: 'blur(2px)',
      }} />
      <div style={{
        position: 'absolute', top: '20px', right: '2px',
        width: '14px', height: '8px', borderRadius: '50%',
        background: `radial-gradient(ellipse, ${C.pinkHot}cc 0%, transparent 80%)`,
        filter: 'blur(2px)',
      }} />
      <div style={{
        position: 'absolute', top: '4px', left: '26px',
        width: '14px', height: '16px', borderRadius: '50%',
        background: '#ffffff',
        border: '2px solid #2a1640',
        animation: eyeAnim,
        transformOrigin: 'center',
        transform: happy ? 'scaleY(0.35)' : 'scaleY(1)',
        transition: 'transform 0.3s ease',
      }}>
        <div style={{
          position: 'absolute', top: '3px', left: '3px',
          width: '6px', height: '7px', borderRadius: '50%',
          background: '#2a1640',
        }}>
          <div style={{
            position: 'absolute', top: '1px', left: '1px',
            width: '2px', height: '2px', borderRadius: '50%',
            background: '#ffffff',
          }} />
        </div>
      </div>
      <div style={{
        position: 'absolute', top: '4px', right: '26px',
        width: '14px', height: '16px', borderRadius: '50%',
        background: '#ffffff',
        border: '2px solid #2a1640',
        animation: eyeAnim,
        transformOrigin: 'center',
        transform: happy ? 'scaleY(0.35)' : 'scaleY(1)',
        transition: 'transform 0.3s ease',
      }}>
        <div style={{
          position: 'absolute', top: '3px', left: '3px',
          width: '6px', height: '7px', borderRadius: '50%',
          background: '#2a1640',
        }}>
          <div style={{
            position: 'absolute', top: '1px', left: '1px',
            width: '2px', height: '2px', borderRadius: '50%',
            background: '#ffffff',
          }} />
        </div>
      </div>
      <svg style={{ position: 'absolute', top: '26px', left: '50%', transform: 'translateX(-50%)' }}
           width="40" height={happy ? '18' : '14'} viewBox={happy ? '0 0 40 18' : '0 0 40 14'}>
        {happy ? (
          <path d="M 4 2 Q 20 20 36 2" stroke="#2a1640" strokeWidth="3" fill="none" strokeLinecap="round" />
        ) : (
          <path d="M 6 2 Q 20 14 34 2" stroke="#2a1640" strokeWidth="3" fill="none" strokeLinecap="round" />
        )}
      </svg>
    </div>
  );
};

const Mailbox = ({ doorOpen, flagUp, letterIncoming, happy }) => (
  <div style={{
    position: 'relative', width: '320px', height: '300px',
    margin: '0 auto', userSelect: 'none', pointerEvents: 'none',
    animation: 'mailboxIdle 4s ease-in-out infinite',
  }}>
    <div style={{
      position: 'absolute', bottom: 6, left: '50%', transform: 'translateX(-50%)',
      width: '280px', height: '18px', borderRadius: '50%',
      background: 'radial-gradient(ellipse, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 70%)',
      filter: 'blur(6px)', zIndex: 0,
    }} />
    <div style={{
      position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
      width: '300px', height: '20px',
      borderRadius: '14px',
      background: `linear-gradient(180deg, ${C.lavender} 0%, ${C.purple} 100%)`,
      boxShadow: `inset 0 2px 0 rgba(255,255,255,0.4), inset 0 -3px 6px rgba(0,0,0,0.15), 0 4px 0 ${C.purpleDeep}`,
      zIndex: 1,
    }}>
      {[20, 60, 100, 140, 180, 220, 260].map((x, i) => (
        <div key={i} style={{
          position: 'absolute', top: '6px', left: `${x}px`,
          width: '6px', height: '6px', borderRadius: '50%',
          background: i % 2 === 0 ? C.yellow : C.mint,
          opacity: 0.7,
        }} />
      ))}
    </div>
    <div style={{
      position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
      width: '36px', height: '60px',
      background: `linear-gradient(90deg, ${C.purpleDeep} 0%, ${C.purple} 50%, ${C.purpleDeep} 100%)`,
      borderRadius: '4px 4px 0 0',
      boxShadow: `inset 0 -4px 6px rgba(0,0,0,0.2), inset 0 2px 0 rgba(255,255,255,0.25)`,
      zIndex: 2,
    }}>
      <div style={{
        position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%) rotate(-8deg)',
        fontFamily: '"Bagel Fat One", sans-serif',
        fontSize: '0.8rem', color: C.yellow,
        textShadow: '1px 1px 0 #2a1640',
      }}>★</div>
    </div>
    <div style={{
      position: 'absolute', bottom: 80, left: '50%', transform: 'translateX(-50%)',
      width: '260px', height: '170px',
      borderRadius: '130px 130px 12px 12px',
      background: `
        radial-gradient(ellipse 80% 50% at 30% 22%, rgba(255,255,255,0.5) 0%, transparent 60%),
        linear-gradient(180deg, ${C.pinkSoft} 0%, ${C.pinkHot} 60%, #d9266c 100%)
      `,
      boxShadow: `
        inset -14px 0 22px rgba(217, 38, 108, 0.4),
        inset 14px 0 18px rgba(255,255,255,0.25),
        inset 0 -10px 14px rgba(120, 10, 50, 0.25),
        0 8px 16px rgba(0,0,0,0.25)
      `,
      zIndex: 3,
      perspective: '900px',
    }}>
      <MailboxFace happy={happy || doorOpen} />
      <div style={{
        position: 'absolute', bottom: '24px', left: '14px',
        width: '24px', height: '24px',
        background: `radial-gradient(circle at 30% 30%, ${C.mint}, ${C.mintDeep})`,
        clipPath: 'polygon(50% 0, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
        boxShadow: '1px 2px 0 rgba(0,0,0,0.15)',
        zIndex: 6,
      }} />
      <div style={{
        position: 'absolute', inset: '60px 18px 6px 18px',
        borderRadius: '6px',
        background: 'radial-gradient(ellipse 80% 60% at 50% 80%, #4a2660 0%, #1f0f30 100%)',
        boxShadow: 'inset 0 12px 24px rgba(0,0,0,0.7)',
      }}>
        <div style={{
          position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%) rotate(-3deg)',
          width: '70%', height: '6px',
          background: `linear-gradient(180deg, ${C.yellow}, ${C.peach})`,
          borderRadius: '1px', opacity: 0.5,
        }} />
      </div>
      {letterIncoming && (
        <div style={{
          position: 'absolute', left: '50%', top: '50%',
          transform: 'translate(-50%, -50%)',
          width: '120px', height: '78px',
          background: '#ffffff',
          borderRadius: '4px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.5)',
          animation: 'letterIntoSlot 0.7s ease-in forwards',
          animationDelay: '0.3s',
          opacity: 0,
        }}>
          <div style={{
            position: 'absolute', top: '8px', right: '8px',
            width: '22px', height: '16px',
            background: `radial-gradient(circle, ${C.pinkHot}, #d9266c)`,
            borderRadius: '2px',
          }} />
        </div>
      )}
      <div style={{
        position: 'absolute', inset: '60px 18px 6px 18px',
        borderRadius: '6px',
        background: `
          radial-gradient(ellipse 70% 40% at 40% 25%, rgba(255,255,255,0.4) 0%, transparent 55%),
          linear-gradient(180deg, ${C.pinkBlush} 0%, ${C.pinkHot} 50%, #d9266c 100%)
        `,
        boxShadow: doorOpen
          ? 'inset 0 -6px 10px rgba(120, 10, 50, 0.4), inset 0 4px 8px rgba(255,255,255,0.3), 6px 0 14px rgba(0,0,0,0.5)'
          : 'inset 0 -6px 10px rgba(120, 10, 50, 0.3), inset 0 4px 8px rgba(255,255,255,0.25)',
        transformOrigin: 'left center',
        transform: doorOpen
          ? 'perspective(900px) rotateY(-115deg)'
          : 'perspective(900px) rotateY(0deg)',
        transition: 'transform 0.6s cubic-bezier(0.5, 0, 0.4, 1.2), box-shadow 0.6s ease',
        backfaceVisibility: 'hidden',
        zIndex: 5,
        border: '2px solid #ffffff',
      }}>
        <div style={{
          position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
          width: '16px', height: '16px', borderRadius: '50%',
          background: `radial-gradient(circle at 30% 30%, ${C.yellow} 0%, ${C.yellowDeep} 60%, #b88500 100%)`,
          boxShadow: '0 1px 2px rgba(0,0,0,0.4), inset 0 -1px 2px rgba(0,0,0,0.3)',
          border: '1.5px solid #2a1640',
        }} />
        <div style={{
          position: 'absolute', top: '50%', left: '40%', transform: 'translate(-50%, -50%) rotate(-4deg)',
          padding: '4px 10px',
          background: '#ffffff',
          borderRadius: '20px',
          border: '2px solid #2a1640',
          boxShadow: '2px 2px 0 #2a1640',
        }}>
          <span style={{
            fontFamily: '"Bagel Fat One", sans-serif',
            fontSize: '1rem', color: C.purpleDeep, lineHeight: 1,
          }}>K7!</span>
        </div>
      </div>
      <div style={{
        position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)',
        whiteSpace: 'nowrap',
      }}>
        <span style={{
          fontFamily: '"Fredoka", sans-serif',
          fontSize: '0.55rem', color: '#ffffff',
          letterSpacing: '0.3em', fontWeight: 700,
          opacity: 0.7,
        }}>★ U·S·AIR·MAIL ★</span>
      </div>
      <div style={{
        position: 'absolute',
        right: '-3px', bottom: '36px',
        transformOrigin: 'left bottom',
        transform: flagUp ? 'rotate(0deg)' : 'rotate(78deg)',
        transition: 'transform 1.1s cubic-bezier(0.34, 1.7, 0.5, 1)',
        zIndex: 6,
        animation: flagUp ? 'none' : 'flagWiggle 3s ease-in-out infinite',
      }}>
        <div style={{
          width: '4px', height: '72px',
          background: `linear-gradient(90deg, #4a2660 0%, ${C.purple} 30%, #6b3eb8 100%)`,
          borderRadius: '2px',
        }} />
        <div style={{
          position: 'absolute', top: '-4px', left: '-3px',
          width: '10px', height: '10px', borderRadius: '50%',
          background: `radial-gradient(circle at 30% 30%, ${C.yellow}, ${C.yellowDeep})`,
          border: '1.5px solid #2a1640',
        }} />
        <div style={{
          position: 'absolute', top: '6px', left: '4px',
          width: '38px', height: '28px',
          background: `linear-gradient(95deg, ${C.pinkHot} 0%, ${C.purple} 60%, ${C.purpleDeep} 100%)`,
          clipPath: 'polygon(0 0, 100% 0, 78% 50%, 100% 100%, 0 100%)',
          boxShadow: '1px 1px 2px rgba(0,0,0,0.3)',
          border: '1px solid #ffffff',
        }}>
          <span style={{
            position: 'absolute', top: '4px', left: '6px',
            fontFamily: '"Bagel Fat One", sans-serif',
            fontSize: '0.9rem', color: '#ffffff',
            lineHeight: 1,
          }}>★</span>
        </div>
      </div>
      {[
        { left: '12px', top: '90px', color: C.yellow },
        { right: '12px', top: '90px', color: C.mint },
        { left: '12px', bottom: '14px', color: C.sky },
        { right: '12px', bottom: '14px', color: C.lavender },
      ].map((pos, i) => (
        <div key={i} style={{
          position: 'absolute', ...pos,
          width: '8px', height: '8px', borderRadius: '50%',
          background: pos.color,
          border: '1.5px solid #2a1640',
          boxShadow: '1px 1px 0 rgba(0,0,0,0.15)',
          zIndex: 7,
        }} />
      ))}
    </div>
  </div>
);

const ConfettiBurst = ({ trigger }) => {
  if (!trigger) return null;
  const colors = [C.pinkHot, C.yellow, C.mint, C.sky, C.purple, C.peach];
  const shapes = ['★', '♥', '✦', '●', '✨'];
  return (
    <div key={trigger} style={{
      position: 'absolute', top: '50%', left: '50%',
      width: 0, height: 0,
      pointerEvents: 'none', zIndex: 30,
    }}>
      {Array.from({ length: 32 }).map((_, i) => {
        const angle = (i / 32) * Math.PI * 2;
        const dist = 110 + (i % 4) * 30;
        const dx = Math.cos(angle) * dist;
        const dy = Math.sin(angle) * dist - 40;
        const dur = 900 + (i * 31) % 700;
        const delay = (i * 17) % 100;
        const color = colors[i % colors.length];
        const shape = shapes[i % shapes.length];
        const size = 14 + (i % 5) * 4;
        const rot = (i * 47) % 720 - 360;
        return (
          <div key={i} style={{
            position: 'absolute', top: 0, left: 0,
            fontSize: `${size}px`,
            color, fontWeight: 800,
            lineHeight: 1,
            ['--dx']: `${dx}px`,
            ['--dy']: `${dy}px`,
            ['--rot']: `${rot}deg`,
            animation: `confettiBurst ${dur}ms cubic-bezier(0.22, 0.61, 0.36, 1) ${delay}ms forwards`,
            transform: 'translate(-50%, -50%)',
            filter: 'drop-shadow(1px 1px 0 rgba(0,0,0,0.2))',
          }}>{shape}</div>
        );
      })}
    </div>
  );
};

const FloatingBg = () => {
  const items = [
    { shape: '★', color: C.yellow }, { shape: '♥', color: C.pinkHot },
    { shape: '✦', color: C.sky }, { shape: '✨', color: C.mint },
    { shape: '★', color: C.lavender }, { shape: '♥', color: C.peach },
    { shape: '●', color: C.pinkSoft }, { shape: '✦', color: C.yellow },
    { shape: '★', color: C.mint }, { shape: '♥', color: C.purple },
    { shape: '✨', color: C.pinkHot }, { shape: '●', color: C.sky },
    { shape: '★', color: C.peach }, { shape: '✦', color: C.lavender },
  ];
  return (
    <div style={{
      position: 'absolute', inset: 0, overflow: 'hidden',
      pointerEvents: 'none', zIndex: 0,
    }}>
      {items.map((item, i) => {
        const left = (i * 7.3) % 100;
        const dur = 14 + (i * 1.7) % 12;
        const delay = (i * 1.3) % 8;
        const size = 16 + (i % 4) * 8;
        const drift = ((i * 17) % 80) - 40;
        return (
          <div key={i} style={{
            position: 'absolute',
            left: `${left}%`,
            bottom: '-40px',
            fontSize: `${size}px`,
            color: item.color,
            opacity: 0.45,
            ['--drift']: `${drift}px`,
            animation: `floatUp ${dur}s linear ${delay}s infinite`,
            fontWeight: 800,
            textShadow: '0 1px 2px rgba(0,0,0,0.1)',
          }}>{item.shape}</div>
        );
      })}
    </div>
  );
};

const MemphisPattern = () => (
  <svg viewBox="0 0 100 100" preserveAspectRatio="none"
       style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.18, pointerEvents: 'none', zIndex: 0 }}>
    <path d="M 5 15 Q 8 12 11 15 T 17 15 T 23 15" stroke={C.yellow} strokeWidth="0.8" fill="none" />
    <path d="M 70 8 Q 73 5 76 8 T 82 8 T 88 8" stroke={C.mint} strokeWidth="0.8" fill="none" />
    <path d="M 12 78 Q 15 75 18 78 T 24 78 T 30 78" stroke={C.sky} strokeWidth="0.8" fill="none" />
    <polygon points="35,5 39,12 31,12" fill={C.pinkHot} opacity="0.7" />
    <polygon points="85,55 90,62 80,62" fill={C.purple} opacity="0.7" />
    <polygon points="8,45 13,52 3,52" fill={C.yellow} opacity="0.7" />
    <g>
      <circle cx="55" cy="18" r="1.2" fill={C.mint} />
      <circle cx="58" cy="20" r="1.2" fill={C.mint} />
      <circle cx="60" cy="17" r="1.2" fill={C.mint} />
    </g>
    <g>
      <circle cx="20" cy="60" r="1.2" fill={C.purple} />
      <circle cx="23" cy="62" r="1.2" fill={C.purple} />
      <circle cx="25" cy="59" r="1.2" fill={C.purple} />
    </g>
    <g>
      <circle cx="75" cy="88" r="1.2" fill={C.pinkHot} />
      <circle cx="78" cy="90" r="1.2" fill={C.pinkHot} />
      <circle cx="80" cy="87" r="1.2" fill={C.pinkHot} />
    </g>
    <polyline points="45,40 47,42 49,40 51,42 53,40" stroke={C.peach} strokeWidth="0.6" fill="none" />
    <polyline points="62,72 64,74 66,72 68,74 70,72" stroke={C.sky} strokeWidth="0.6" fill="none" />
    <g stroke={C.purple} strokeWidth="0.8" fill="none">
      <line x1="40" y1="88" x2="44" y2="88" />
      <line x1="42" y1="86" x2="42" y2="90" />
    </g>
    <g stroke={C.yellow} strokeWidth="0.8" fill="none">
      <line x1="90" y1="32" x2="94" y2="32" />
      <line x1="92" y1="30" x2="92" y2="34" />
    </g>
    <text x="6" y="92" fontSize="3" fill={C.pinkHot}>★</text>
    <text x="92" y="78" fontSize="3" fill={C.mint}>★</text>
    <text x="52" y="55" fontSize="2.5" fill={C.lavender}>✦</text>
  </svg>
);

// ============================================================
// MAIN
// ============================================================
export default function PocketPost() {
  const [stage, setStage] = useState('compose');
  const [doorOpen, setDoorOpen] = useState(false);
  const [letterFlying, setLetterFlying] = useState(false);
  const [letterIncoming, setLetterIncoming] = useState(false);
  const [flagUp, setFlagUp] = useState(false);
  const [plaqueOut, setPlaqueOut] = useState(false);
  const [codeStamped, setCodeStamped] = useState(false);
  const [confettiKey, setConfettiKey] = useState(0);
  const [mailboxHappy, setMailboxHappy] = useState(false);

  const [senderName, setSenderName] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [message, setMessage] = useState('');
  const [stampIdx, setStampIdx] = useState(0);
  const [placedStickers, setPlacedStickers] = useState([]);
  const [trackingCode, setTrackingCode] = useState(null);
  const [copied, setCopied] = useState(false);
  const [sendError, setSendError] = useState(null);

  const [retrievePanelOpen, setRetrievePanelOpen] = useState(false);
  const [retrieveCode, setRetrieveCode] = useState('');
  const [retrieved, setRetrieved] = useState(null);
  const [retrieveError, setRetrieveError] = useState(null);
  const [retrieveLoading, setRetrieveLoading] = useState(false);

  const stamp = STAMPS[stampIdx];
  const senderInitial = senderName.trim().charAt(0).toUpperCase();
  const canSend = senderName.trim().length > 0 && message.trim().length > 0;
  const charsLeft = 280 - message.length;

  const addSticker = (stickerId) => {
    if (placedStickers.length >= MAX_STICKERS) return;
    setPlacedStickers(prev => [...prev, {
      ...randomPlacement(),
      stickerId,
      key: Date.now() + Math.random(),
    }]);
  };

  const removeSticker = (key) => {
    setPlacedStickers(prev => prev.filter(s => s.key !== key));
  };

  const clearStickers = () => setPlacedStickers([]);

  const handleSend = async () => {
    if (!canSend) return;
    setSendError(null);

    const initialCode = generateCode();
    const result = await saveNote(initialCode, {
      sender: senderName.trim().slice(0, 30),
      recipient: recipientName.trim().slice(0, 30),
      message: message.trim().slice(0, 280),
      stampIdx,
      placedStickers,
    });

    if (!result.ok) {
      setSendError("Couldn't drop your note in. Try again?");
      return;
    }

    setTrackingCode(result.code);
    setStage('mailing');
    setLetterFlying(true);
    setTimeout(() => setDoorOpen(true), 250);
    setTimeout(() => { setLetterIncoming(true); setMailboxHappy(true); }, 700);
    setTimeout(() => setConfettiKey(Date.now()), 1300);
    setTimeout(() => setDoorOpen(false), 1700);
    setTimeout(() => { setLetterIncoming(false); setFlagUp(true); }, 2300);
    setTimeout(() => setPlaqueOut(true), 3000);
    setTimeout(() => setCodeStamped(true), 3400);
    setTimeout(() => setStage('sent'), 3800);
  };

  const handleCopy = async () => {
    try {
      const text = `${senderName} mailed you a note 💌\nTracking code: ${trackingCode}\nOpen Pocket Post, drop the code in, pick up your mail.`;
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {}
  };

  const handleReset = () => {
    setStage('compose');
    setDoorOpen(false); setLetterFlying(false); setLetterIncoming(false);
    setFlagUp(false); setPlaqueOut(false); setCodeStamped(false);
    setMailboxHappy(false); setConfettiKey(0);
    setTrackingCode(null); setRecipientName(''); setMessage('');
    setPlacedStickers([]);
    setCopied(false); setSendError(null);
  };

  const handleRetrieve = async () => {
    const code = retrieveCode.trim().toUpperCase();
    if (!code) return;
    setRetrieveError(null); setRetrieved(null); setRetrieveLoading(true);
    const result = await loadNote(code);
    if (result.ok && result.note) {
      setRetrieved(result.note);
    } else {
      setRetrieveError("No note found under that tracking code!");
    }
    setRetrieveLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh', width: '100%', position: 'relative', overflow: 'hidden',
      background: `
        linear-gradient(180deg, ${C.lavender} 0%, ${C.pinkBlush} 50%, ${C.peach} 100%)
      `,
      padding: '36px 16px 60px',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bagel+Fat+One&family=Fredoka:wght@400;500;600;700&family=Gloria+Hallelujah&display=swap');

        @keyframes letterFlyToBox {
          0% { transform: translateY(0) scale(1) rotate(0deg); opacity: 1; }
          20% { transform: translateY(30px) scale(0.96) rotate(-3deg); opacity: 1; }
          50% { transform: translateY(220px) scale(0.55) rotate(-12deg); opacity: 0.95; }
          75% { transform: translateY(400px) scale(0.25) rotate(-22deg); opacity: 0.7; }
          100% { transform: translateY(500px) scale(0.1) rotate(-35deg); opacity: 0; }
        }
        @keyframes letterIntoSlot {
          0% { opacity: 0; transform: translate(-50%, -180%) rotate(-15deg) scale(0.6); }
          25% { opacity: 1; }
          100% { opacity: 0; transform: translate(-50%, 40%) rotate(-3deg) scale(0.85); }
        }
        @keyframes plaqueSlideUp {
          0% { opacity: 0; transform: translateY(80px) scale(0.85); }
          50% { opacity: 1; transform: translateY(-10px) scale(1.04); }
          75% { transform: translateY(4px) scale(0.98); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes codeStamp {
          0% { opacity: 0; transform: scale(2.4) rotate(-15deg); filter: blur(3px); }
          50% { opacity: 1; filter: blur(0); transform: scale(0.92) rotate(-5deg); }
          75% { transform: scale(1.05) rotate(-3deg); }
          100% { opacity: 1; transform: scale(1) rotate(-4deg); filter: blur(0); }
        }
        @keyframes paperRise {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes wiggle {
          0%, 100% { transform: rotate(-12deg); }
          50% { transform: rotate(-14deg); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-3px); }
          75% { transform: translateX(3px); }
        }
        @keyframes stampOn {
          0% { opacity: 0; transform: scale(2) rotate(-25deg); }
          60% { opacity: 1; transform: scale(0.9) rotate(-7deg); }
          100% { opacity: 1; transform: scale(1) rotate(-9deg); }
        }
        @keyframes stampBob {
          0%, 100% { transform: scale(1.12) rotate(0deg); }
          50% { transform: scale(1.12) rotate(-4deg); }
        }
        @keyframes blink {
          0%, 92%, 100% { transform: scaleY(1); }
          94%, 98% { transform: scaleY(0.1); }
        }
        @keyframes mailboxIdle {
          0%, 100% { transform: rotate(-0.6deg); }
          50% { transform: rotate(0.6deg); }
        }
        @keyframes flagWiggle {
          0%, 100% { transform: rotate(78deg); }
          50% { transform: rotate(74deg); }
        }
        @keyframes floatUp {
          0% { transform: translate(0, 0) rotate(0deg); opacity: 0; }
          10% { opacity: 0.5; }
          50% { transform: translate(var(--drift), -50vh) rotate(180deg); opacity: 0.55; }
          90% { opacity: 0.4; }
          100% { transform: translate(0, -110vh) rotate(360deg); opacity: 0; }
        }
        @keyframes confettiBurst {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0); }
          15% { opacity: 1; transform: translate(calc(-50% + (var(--dx) * 0.2)), calc(-50% + (var(--dy) * 0.2))) scale(1.2) rotate(calc(var(--rot) * 0.2)); }
          70% { opacity: 1; }
          100% { opacity: 0; transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy) + 100px)) scale(0.6) rotate(var(--rot)); }
        }
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255, 61, 138, 0.45), 0 6px 0 #d9266c, 0 10px 16px rgba(0,0,0,0.2); }
          50% { box-shadow: 0 0 0 14px rgba(255, 61, 138, 0), 0 6px 0 #d9266c, 0 10px 16px rgba(0,0,0,0.2); }
        }
        @keyframes mailboxHappyBounce {
          0%, 100% { transform: translateY(0); }
          40% { transform: translateY(-8px); }
          70% { transform: translateY(2px); }
        }
        @keyframes stickerPlop {
          0% { opacity: 0; transform: scale(0); }
          55% { opacity: 1; transform: scale(1.25); }
          80% { transform: scale(0.92); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes stickerPeel {
          0% { opacity: 1; transform: scale(1) rotate(0deg); }
          100% { opacity: 0; transform: scale(0.3) rotate(45deg); }
        }
        .paper-rise { animation: paperRise 0.5s ease-out both; }

        input::placeholder, textarea::placeholder {
          color: rgba(126, 62, 255, 0.4);
          font-style: italic;
        }
        textarea { resize: none; }

        .stamp-btn:hover { transform: rotate(-4deg) scale(1.05); }
        .stamp-btn { transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1); }

        .sticker-btn:not(:disabled):hover { transform: rotate(-7deg) scale(1.1); }
        .sticker-btn { transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1); }

        .placed-sticker:hover { filter: brightness(1.08); }

        .send-btn:hover:not(:disabled) { transform: scale(1.05) rotate(-1deg); }
        .send-btn:active:not(:disabled) { transform: scale(0.98) translateY(3px); }

        /* On narrow screens, stack the writing pad above the options column */
        @media (max-width: 520px) {
          .pp-writing-row { flex-direction: column !important; }
          .pp-options-col { width: 100% !important; }
        }
      `}</style>

      <MemphisPattern />
      <FloatingBg />

      <div style={{ position: 'relative', maxWidth: '620px', margin: '0 auto', zIndex: 1 }}>

        <div style={{ textAlign: 'center', marginBottom: '32px', position: 'relative' }}>
          <span style={{
            position: 'absolute', top: '-4px', left: '20%',
            fontSize: '20px', color: C.yellow,
            animation: 'wiggle 3s ease-in-out infinite',
          }}>★</span>
          <span style={{
            position: 'absolute', top: '8px', right: '18%',
            fontSize: '24px', color: C.mint,
            animation: 'wiggle 4s ease-in-out infinite reverse',
          }}>✦</span>
          <span style={{
            position: 'absolute', top: '40px', left: '8%',
            fontSize: '18px', color: C.purple,
            animation: 'wiggle 3.5s ease-in-out infinite',
          }}>♥</span>
          <span style={{
            position: 'absolute', top: '50px', right: '8%',
            fontSize: '16px', color: C.pinkHot,
            animation: 'wiggle 4.5s ease-in-out infinite reverse',
          }}>✨</span>

          <h1 style={{
            fontFamily: '"Bagel Fat One", "Fredoka", sans-serif',
            fontSize: 'clamp(2.5rem, 9vw, 4rem)',
            color: C.pinkHot,
            lineHeight: 1,
            letterSpacing: '-0.02em',
            margin: 0,
            textShadow: `
              3px 3px 0 #ffffff,
              -3px -3px 0 #ffffff,
              3px -3px 0 #ffffff,
              -3px 3px 0 #ffffff,
              0 3px 0 #ffffff,
              3px 0 0 #ffffff,
              0 -3px 0 #ffffff,
              -3px 0 0 #ffffff,
              6px 6px 0 ${C.purple},
              7px 7px 12px rgba(0,0,0,0.15)
            `,
            transform: 'rotate(-2deg)',
            display: 'inline-block',
          }}>Pocket Post</h1>

          <div style={{ marginTop: '16px' }}>
            <span style={{
              display: 'inline-block',
              padding: '6px 16px',
              background: '#ffffff',
              borderRadius: '20px',
              border: `2px dashed ${C.purple}`,
              fontFamily: '"Fredoka", sans-serif',
              fontSize: '0.7rem', color: C.purpleDeep,
              letterSpacing: '0.18em', fontWeight: 700,
              transform: 'rotate(1deg)',
              boxShadow: `2px 2px 0 ${C.purple}`,
            }}>
              ✦ EST · 1994 · NOTES TOO CUTE FOR TEXTS ✦
            </span>
          </div>
        </div>

        {stage !== 'sent' && (
          <div style={{
            position: 'relative',
            animation: letterFlying ? 'letterFlyToBox 1.5s cubic-bezier(0.5, 0, 0.65, 0.7) forwards' : undefined,
            marginBottom: '24px',
            transformOrigin: 'center bottom',
            zIndex: 5,
          }}>
            <LetterPaper
              senderName={senderName} setSenderName={setSenderName}
              recipientName={recipientName} setRecipientName={setRecipientName}
              message={message} setMessage={setMessage}
              stampIdx={stampIdx} setStampIdx={setStampIdx}
              stamp={stamp} senderInitial={senderInitial}
              charsLeft={charsLeft}
              placedStickers={placedStickers}
              onAddSticker={addSticker}
              onRemoveSticker={removeSticker}
              onClearStickers={clearStickers}
              disabled={stage !== 'compose'}
            />
          </div>
        )}

        {stage === 'compose' && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
            <button
              onClick={handleSend}
              disabled={!canSend}
              className="send-btn"
              style={{
                fontFamily: '"Bagel Fat One", "Fredoka", sans-serif',
                fontSize: '1.15rem', letterSpacing: '0.04em',
                padding: '18px 32px 16px',
                color: '#ffffff',
                background: canSend
                  ? `linear-gradient(135deg, ${C.pinkHot} 0%, ${C.purple} 100%)`
                  : `linear-gradient(180deg, #bbb 0%, #999 100%)`,
                border: '3px solid #ffffff',
                borderRadius: '999px',
                boxShadow: canSend
                  ? `0 0 0 3px ${C.pinkHot}, 0 6px 0 #d9266c, 0 10px 16px rgba(0,0,0,0.2)`
                  : '0 4px 0 #777',
                textShadow: '2px 2px 0 rgba(0,0,0,0.2)',
                cursor: canSend ? 'pointer' : 'not-allowed',
                transition: 'transform 0.15s, box-shadow 0.2s',
                display: 'flex', alignItems: 'center', gap: '12px',
                animation: canSend ? 'glowPulse 2.4s ease-in-out infinite' : undefined,
              }}
            >
              <Send size={20} strokeWidth={3} fill="#ffffff" />
              DROP IT IN! ✨
            </button>
          </div>
        )}

        {!canSend && stage === 'compose' && (
          <div style={{ textAlign: 'center', marginTop: '-28px', marginBottom: '20px' }}>
            <BubblyLabel size="0.7rem" color={C.purpleDeep}>
              ♥ sign your note &amp; write something to send ♥
            </BubblyLabel>
          </div>
        )}

        {sendError && stage === 'compose' && (
          <div style={{
            margin: '0 auto 20px', maxWidth: '420px',
            display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px',
            background: '#ffffff',
            border: `3px solid ${C.pinkHot}`,
            borderRadius: '14px',
            fontFamily: '"Fredoka", sans-serif',
            fontSize: '0.9rem', color: C.pinkHot,
            fontWeight: 600,
            animation: 'shake 0.4s',
            boxShadow: `3px 3px 0 ${C.pinkHot}`,
          }}>
            <AlertCircle size={16} strokeWidth={3} /> {sendError}
          </div>
        )}

        <div style={{
          position: 'relative', zIndex: 2,
          animation: mailboxHappy && !plaqueOut ? 'mailboxHappyBounce 0.7s ease-out 1.4s' : undefined,
        }}>
          <Mailbox doorOpen={doorOpen} flagUp={flagUp} letterIncoming={letterIncoming} happy={mailboxHappy} />
          <div style={{
            position: 'absolute', top: '40%', left: '50%',
            width: 0, height: 0, pointerEvents: 'none',
          }}>
            <ConfettiBurst trigger={confettiKey} />
          </div>
        </div>

        {(plaqueOut || stage === 'sent') && (
          <div style={{
            margin: '24px auto 0', maxWidth: '460px',
            animation: 'plaqueSlideUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
            position: 'relative', zIndex: 4,
          }}>
            <div style={{
              padding: '22px 26px 24px',
              background: `
                radial-gradient(ellipse at 25% 15%, rgba(255,255,255,0.5) 0%, transparent 50%),
                conic-gradient(from 60deg,
                  ${C.pinkSoft}, ${C.lavender}, ${C.sky}, ${C.mint}, ${C.yellow}, ${C.pinkSoft})
              `,
              borderRadius: '20px',
              border: '3px solid #ffffff',
              boxShadow: `
                0 0 0 3px ${C.pinkHot},
                0 8px 0 #d9266c,
                0 14px 24px rgba(0,0,0,0.25)
              `,
              position: 'relative',
            }}>
              {[
                { top: '-12px', left: '12px', color: C.yellow, rot: -15 },
                { top: '-12px', right: '12px', color: C.mint, rot: 15 },
                { bottom: '-10px', left: '20%', color: C.purple, rot: -8 },
                { bottom: '-10px', right: '20%', color: C.pinkHot, rot: 12 },
              ].map((s, i) => (
                <div key={i} style={{
                  position: 'absolute', ...s,
                  fontFamily: '"Bagel Fat One", sans-serif',
                  fontSize: '1.6rem', color: s.color,
                  transform: `rotate(${s.rot}deg)`,
                  textShadow: '2px 2px 0 #ffffff, -1px -1px 0 #ffffff',
                  lineHeight: 1,
                  zIndex: 5,
                }}>★</div>
              ))}

              <div style={{ textAlign: 'center', marginBottom: '14px' }}>
                <span style={{
                  fontFamily: '"Bagel Fat One", sans-serif',
                  fontSize: '0.95rem', letterSpacing: '0.06em',
                  color: '#ffffff',
                  textShadow: `2px 2px 0 ${C.pinkHot}, -1px -1px 0 ${C.purpleDeep}`,
                }}>★ MAIL DELIVERED ★</span>
              </div>

              <div style={{ textAlign: 'center', marginBottom: '14px', minHeight: '56px' }}>
                {codeStamped && (
                  <div style={{
                    display: 'inline-block',
                    padding: '8px 22px',
                    background: '#ffffff',
                    border: `4px solid ${C.purpleDeep}`,
                    borderRadius: '14px',
                    fontFamily: '"Bagel Fat One", sans-serif',
                    fontSize: 'clamp(1.7rem, 6.5vw, 2.3rem)',
                    color: C.purpleDeep, letterSpacing: '0.05em', lineHeight: 1,
                    animation: 'codeStamp 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
                    boxShadow: `4px 4px 0 ${C.purpleDeep}, 0 0 0 2px #ffffff inset`,
                  }}>
                    {trackingCode}
                  </div>
                )}
              </div>

              <div style={{
                textAlign: 'center', marginBottom: '14px',
                fontFamily: '"Fredoka", sans-serif',
                fontSize: '0.9rem', color: C.purpleDeep, lineHeight: 1.5,
                fontWeight: 600,
              }}>
                FROM <span style={{ background: '#ffffff', padding: '1px 8px', borderRadius: '8px' }}>{senderName || '—'}</span>
                {recipientName && (<> &nbsp;✿&nbsp; TO <span style={{ background: '#ffffff', padding: '1px 8px', borderRadius: '8px' }}>{recipientName}</span></>)}
              </div>

              <div style={{
                textAlign: 'center', marginBottom: '18px', padding: '10px 14px',
                background: 'rgba(255,255,255,0.6)',
                borderRadius: '12px',
                fontFamily: '"Gloria Hallelujah", cursive',
                fontSize: '0.95rem', color: C.ink, lineHeight: 1.4,
              }}>
                Send this code to {recipientName || 'whoever you like!'} They open Pocket Post, drop in the code, &amp; pick up your note ✨
              </div>

              {stage === 'sent' && (
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button
                    onClick={handleCopy}
                    style={{
                      fontFamily: '"Bagel Fat One", sans-serif',
                      fontSize: '0.85rem', letterSpacing: '0.04em',
                      padding: '12px 18px',
                      color: '#ffffff',
                      background: copied ? `linear-gradient(180deg, ${C.mintDeep} 0%, #2bb088 100%)` : `linear-gradient(180deg, ${C.pinkHot} 0%, #d9266c 100%)`,
                      border: '2.5px solid #ffffff',
                      borderRadius: '999px',
                      boxShadow: copied ? '0 3px 0 #2bb088' : '0 3px 0 #d9266c',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                      textShadow: '1px 1px 0 rgba(0,0,0,0.2)',
                      transition: 'transform 0.15s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05) rotate(-1deg)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = ''}
                  >
                    {copied ? <><Check size={15} strokeWidth={3} /> COPIED!</> : <><Copy size={15} strokeWidth={3} /> COPY NOTE</>}
                  </button>
                  <button
                    onClick={handleReset}
                    style={{
                      fontFamily: '"Bagel Fat One", sans-serif',
                      fontSize: '0.85rem', letterSpacing: '0.04em',
                      padding: '12px 18px',
                      color: C.purpleDeep,
                      background: '#ffffff',
                      border: `2.5px solid ${C.purpleDeep}`,
                      borderRadius: '999px',
                      boxShadow: `0 3px 0 ${C.purpleDeep}`,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                      transition: 'transform 0.15s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05) rotate(1deg)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = ''}
                  >
                    <RotateCcw size={15} strokeWidth={3} /> ONE MORE!
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        <div style={{
          marginTop: '48px', padding: '22px',
          background: 'rgba(255, 255, 255, 0.55)',
          border: `3px dashed ${C.purple}`,
          borderRadius: '20px',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute', top: '-14px', left: '20px',
            background: C.yellow,
            border: '2px solid #2a1640',
            borderRadius: '999px',
            padding: '2px 10px',
            fontFamily: '"Bagel Fat One", sans-serif',
            fontSize: '0.7rem', color: '#2a1640',
            transform: 'rotate(-4deg)',
            boxShadow: '2px 2px 0 #2a1640',
          }}>★ MAIL CALL!</div>

          {!retrievePanelOpen ? (
            <button
              onClick={() => setRetrievePanelOpen(true)}
              style={{
                width: '100%', background: 'transparent', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                padding: '12px',
              }}
            >
              <KeyRound size={20} color={C.purpleDeep} strokeWidth={2.5} />
              <span style={{
                fontFamily: '"Fredoka", sans-serif',
                fontSize: '0.95rem', letterSpacing: '0.04em', fontWeight: 700,
                color: C.purpleDeep,
              }}>
                Got a tracking code? Pick up your mail!
              </span>
            </button>
          ) : (
            <div className="paper-rise">
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: '14px',
              }}>
                <BubblyLabel size="0.85rem" color={C.purpleDeep}>Pick up your mail</BubblyLabel>
                <button
                  onClick={() => { setRetrievePanelOpen(false); setRetrieved(null); setRetrieveCode(''); setRetrieveError(null); }}
                  style={{
                    background: '#ffffff', border: `2px solid ${C.purpleDeep}`,
                    borderRadius: '50%', cursor: 'pointer',
                    width: '26px', height: '26px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: C.purpleDeep, padding: 0,
                  }}
                ><X size={14} strokeWidth={3} /></button>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginBottom: retrieved || retrieveError ? '14px' : 0 }}>
                <input
                  type="text"
                  value={retrieveCode}
                  onChange={(e) => setRetrieveCode(e.target.value.toUpperCase())}
                  placeholder="XX-NNNN"
                  maxLength={7}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleRetrieve(); }}
                  style={{
                    flex: 1, padding: '14px 16px',
                    background: '#ffffff', color: C.purpleDeep,
                    fontFamily: '"Bagel Fat One", sans-serif',
                    fontSize: '1.1rem',
                    letterSpacing: '0.1em', textAlign: 'center',
                    border: `3px solid ${C.purpleDeep}`, borderRadius: '14px',
                    outline: 'none', textTransform: 'uppercase',
                    boxShadow: `3px 3px 0 ${C.purpleDeep}`,
                  }}
                />
                <button
                  onClick={handleRetrieve}
                  disabled={!retrieveCode.trim() || retrieveLoading}
                  style={{
                    padding: '14px 18px',
                    fontFamily: '"Bagel Fat One", sans-serif',
                    fontSize: '0.85rem', letterSpacing: '0.04em',
                    color: '#ffffff',
                    background: `linear-gradient(180deg, ${C.mintDeep} 0%, #2bb088 100%)`,
                    border: '3px solid #ffffff',
                    borderRadius: '14px',
                    boxShadow: `0 4px 0 #2bb088, 0 0 0 3px ${C.mintDeep}`,
                    cursor: 'pointer',
                    textShadow: '1px 1px 0 rgba(0,0,0,0.2)',
                    opacity: !retrieveCode.trim() || retrieveLoading ? 0.5 : 1,
                    transition: 'transform 0.15s',
                  }}
                  onMouseEnter={(e) => { if (retrieveCode.trim() && !retrieveLoading) e.currentTarget.style.transform = 'scale(1.05) rotate(-1deg)' }}
                  onMouseLeave={(e) => e.currentTarget.style.transform = ''}
                >{retrieveLoading ? '...' : 'OPEN!'}</button>
              </div>

              {retrieveError && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px',
                  background: '#ffffff',
                  border: `3px solid ${C.pinkHot}`,
                  borderRadius: '14px',
                  fontFamily: '"Fredoka", sans-serif',
                  fontSize: '0.9rem', color: C.pinkHot,
                  fontWeight: 600,
                  animation: 'shake 0.4s',
                  boxShadow: `3px 3px 0 ${C.pinkHot}`,
                }}>
                  <AlertCircle size={16} strokeWidth={3} /> {retrieveError}
                </div>
              )}

              {retrieved && (
                <RetrievedLetter retrieved={retrieved} />
              )}
            </div>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: '36px' }}>
          <BubblyLabel size="0.7rem" color={C.purpleDeep}>
            ♥ Pocket Post · made with love · 1994 ♥
          </BubblyLabel>
        </div>
      </div>
    </div>
  );
}

function LetterPaper({
  senderName, setSenderName,
  recipientName, setRecipientName,
  message, setMessage,
  stampIdx, setStampIdx,
  stamp, senderInitial, charsLeft, disabled,
  placedStickers = [], onAddSticker, onRemoveSticker, onClearStickers,
}) {
  return (
    <div style={{
      position: 'relative',
      padding: '36px 24px 24px',
      background: '#ffffff',
      borderRadius: '8px',
      boxShadow: `
        0 0 0 4px ${C.pinkHot},
        0 0 0 8px ${C.yellow},
        0 0 0 12px ${C.mint},
        0 0 0 16px ${C.sky},
        0 0 0 20px ${C.purple},
        0 0 0 24px #ffffff,
        0 26px 32px rgba(0,0,0,0.25)
      `,
      transform: 'rotate(-0.6deg)',
    }}>
      <div style={{
        position: 'absolute', top: '-6px', left: '-6px',
        fontSize: '32px', color: C.yellow,
        transform: 'rotate(-18deg)',
        textShadow: '2px 2px 0 #ffffff, -1px -1px 0 #ffffff, 1px -1px 0 #ffffff, -1px 1px 0 #ffffff',
        fontFamily: '"Bagel Fat One", sans-serif',
        pointerEvents: 'none', zIndex: 3,
      }}>★</div>
      <div style={{
        position: 'absolute', bottom: '-8px', right: '-8px',
        fontSize: '32px', color: C.pinkHot,
        transform: 'rotate(20deg)',
        textShadow: '2px 2px 0 #ffffff, -1px -1px 0 #ffffff, 1px -1px 0 #ffffff, -1px 1px 0 #ffffff',
        fontFamily: '"Bagel Fat One", sans-serif',
        pointerEvents: 'none', zIndex: 3,
      }}>♥</div>
      <div style={{
        position: 'absolute', bottom: '-6px', left: '-6px',
        fontSize: '26px', color: C.mint,
        transform: 'rotate(-15deg)',
        textShadow: '2px 2px 0 #ffffff, -1px -1px 0 #ffffff, 1px -1px 0 #ffffff, -1px 1px 0 #ffffff',
        fontFamily: '"Bagel Fat One", sans-serif',
        pointerEvents: 'none', zIndex: 3,
      }}>✦</div>

      <div
        key={`stamp-${stamp.id}`}
        style={{
          position: 'absolute', top: '12px', left: '14px',
          animation: 'stampOn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both',
          zIndex: 2, pointerEvents: 'none',
        }}
      >
        <PostalStamp stamp={stamp} size={58} tilt={-9} />
      </div>

      <div style={{
        position: 'absolute', top: '14px', right: '18px',
        width: '76px', height: '76px',
        transform: 'rotate(-12deg)',
        animation: 'wiggle 5s ease-in-out infinite',
        pointerEvents: 'none', zIndex: 2,
      }}>
        <div style={{
          width: '100%', height: '100%',
          border: `3px double ${C.purpleDeep}`,
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column',
          opacity: 0.7,
        }}>
          <span style={{
            fontFamily: '"Fredoka", sans-serif',
            fontSize: '0.5rem', color: C.purpleDeep,
            letterSpacing: '0.12em', textAlign: 'center', lineHeight: 1.2,
            fontWeight: 700,
          }}>POCKET POST<br />MAY · 1994</span>
          <div style={{ width: '32px', height: '1px', background: C.purpleDeep, margin: '3px 0' }} />
          <span style={{
            fontFamily: '"Bagel Fat One", sans-serif',
            fontSize: '0.7rem', color: C.purpleDeep,
            letterSpacing: '0.05em',
          }}>PAID</span>
        </div>
      </div>

      <div style={{
        marginTop: '76px', marginBottom: '20px',
        position: 'relative', zIndex: 1,
      }}>
        <BubblyLabel size="0.7rem" color={C.pinkHot}>♥ first class · top priority ♥</BubblyLabel>
        <div style={{
          fontFamily: '"Bagel Fat One", sans-serif',
          fontSize: 'clamp(1.5rem, 5.5vw, 2rem)',
          color: C.purpleDeep, lineHeight: 1.05, letterSpacing: '-0.01em',
          marginTop: '4px',
          textShadow: `2px 2px 0 ${C.yellow}`,
        }}>A little note for u! ✨</div>
      </div>

      <FormField label="FROM" color={C.pinkHot}>
        <input
          type="text"
          value={senderName}
          onChange={(e) => setSenderName(e.target.value)}
          placeholder="your name"
          maxLength={30}
          disabled={disabled}
          style={{
            width: '100%', background: 'transparent',
            border: 'none', outline: 'none',
            borderBottom: `2px dotted ${C.pinkHot}`,
            fontFamily: '"Gloria Hallelujah", cursive',
            fontSize: '1.4rem', color: C.ink,
            padding: '4px 2px',
          }}
        />
      </FormField>

      <FormField label="TO" color={C.purple}>
        <input
          type="text"
          value={recipientName}
          onChange={(e) => setRecipientName(e.target.value)}
          placeholder="(or leave blank for anyone!)"
          maxLength={30}
          disabled={disabled}
          style={{
            width: '100%', background: 'transparent',
            border: 'none', outline: 'none',
            borderBottom: `2px dotted ${C.purple}`,
            fontFamily: '"Gloria Hallelujah", cursive',
            fontSize: '1.3rem', color: C.ink,
            padding: '4px 2px',
          }}
        />
      </FormField>

      {/* WRITING PAD on the left, OPTIONS column on the right */}
      <div className="pp-writing-row" style={{
        display: 'flex', gap: '14px',
        marginBottom: '20px', position: 'relative', zIndex: 1,
        alignItems: 'stretch',
      }}>
        {/* Writing pad */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
            marginBottom: '8px',
          }}>
            <BubblyLabel size="0.7rem" color={C.mintDeep}>★ your note ★</BubblyLabel>
            <span style={{
              fontFamily: '"Fredoka", sans-serif',
              fontSize: '0.75rem', fontWeight: 700,
              color: charsLeft < 30 ? C.pinkHot : C.purple,
              padding: '2px 8px', borderRadius: '999px',
              background: charsLeft < 30 ? '#fff0f5' : '#f5edff',
            }}>{charsLeft}</span>
          </div>
          <textarea
            value={message}
            onChange={(e) => {
              if (e.target.value.length <= 280) setMessage(e.target.value);
            }}
            placeholder={"dear u,\n\n..."}
            rows={7}
            disabled={disabled}
            style={{
              width: '100%', flex: 1,
              background: `repeating-linear-gradient(180deg,
                transparent 0px, transparent 27px,
                ${C.pinkSoft}aa 27px, ${C.pinkSoft}aa 28px,
                transparent 28px, transparent 30px)`,
              backgroundPositionY: '6px',
              border: `2px solid ${C.pinkSoft}`,
              borderRadius: '10px',
              outline: 'none',
              fontFamily: '"Gloria Hallelujah", cursive',
              fontSize: '1.25rem', lineHeight: '28px',
              color: C.ink,
              padding: '8px 12px',
            }}
          />
        </div>

        {/* Options column */}
        <div className="pp-options-col" style={{
          width: '136px', flexShrink: 0,
          display: 'flex', flexDirection: 'column', gap: '14px',
        }}>
          {/* Pick a stamp */}
          <div>
            <BubblyLabel size="0.65rem" color={C.skyDeep}>✦ stamp ✦</BubblyLabel>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '6px',
              padding: '8px 0 0',
            }}>
              {STAMPS.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => !disabled && setStampIdx(i)}
                  disabled={disabled}
                  title={s.name}
                  className="stamp-btn"
                  style={{
                    background: 'transparent', border: 'none',
                    cursor: disabled ? 'default' : 'pointer',
                    padding: '2px',
                    borderRadius: '6px',
                    display: 'flex', justifyContent: 'center',
                  }}
                >
                  <PostalStamp stamp={s} size={36} selected={stampIdx === i} />
                </button>
              ))}
            </div>
          </div>

          {/* Stickers */}
          <div>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
              gap: '4px', flexWrap: 'wrap',
            }}>
              <BubblyLabel size="0.65rem" color={C.peach}>♥ stickers ♥</BubblyLabel>
              <span style={{
                fontFamily: '"Fredoka", sans-serif',
                fontSize: '0.65rem', fontWeight: 700,
                color: placedStickers.length >= MAX_STICKERS ? C.pinkHot : C.purple,
                padding: '1px 6px', borderRadius: '999px',
                background: placedStickers.length >= MAX_STICKERS ? '#fff0f5' : '#f5edff',
              }}>{placedStickers.length}/{MAX_STICKERS}</span>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '6px',
              padding: '8px 0 0',
            }}>
              {STICKERS.map((s) => {
                const atMax = placedStickers.length >= MAX_STICKERS;
                return (
                  <button
                    key={s.id}
                    onClick={() => !disabled && !atMax && onAddSticker(s.id)}
                    disabled={disabled || atMax}
                    title={atMax ? 'sticker book is full!' : `add ${s.id} sticker`}
                    className="sticker-btn"
                    style={{
                      background: 'transparent', border: 'none',
                      cursor: (disabled || atMax) ? 'not-allowed' : 'pointer',
                      padding: '0',
                      opacity: (disabled || atMax) ? 0.4 : 1,
                      display: 'flex', justifyContent: 'center', alignItems: 'center',
                    }}
                  >
                    <Sticker sticker={s} size={30} />
                  </button>
                );
              })}
            </div>
            {placedStickers.length > 0 && !disabled && (
              <button
                onClick={onClearStickers}
                title="clear all stickers"
                style={{
                  marginTop: '8px',
                  width: '100%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                  background: '#ffffff',
                  border: `2px solid ${C.pinkHot}`,
                  borderRadius: '999px',
                  padding: '4px 10px',
                  fontFamily: '"Fredoka", sans-serif',
                  fontSize: '0.65rem', fontWeight: 700,
                  color: C.pinkHot, cursor: 'pointer',
                  letterSpacing: '0.05em',
                  boxShadow: `2px 2px 0 ${C.pinkHot}`,
                }}
              >
                <Trash2 size={11} strokeWidth={3} /> CLEAR
              </button>
            )}
          </div>
        </div>
      </div>

      <div style={{
        marginTop: '12px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: '14px',
        position: 'relative', zIndex: 1,
      }}>
        <div style={{ flex: 1 }}>
          <BubblyLabel size="0.65rem" color={C.purple}>sealed by</BubblyLabel>
          <div style={{
            fontFamily: '"Gloria Hallelujah", cursive',
            fontSize: '1.3rem', color: C.ink, lineHeight: 1,
            marginTop: '6px',
            paddingBottom: '4px',
            borderBottom: `2px dotted ${C.purple}`,
          }}>{senderName || '...'}</div>
        </div>
        <StickerSeal initial={senderInitial} size={64} />
      </div>

      {placedStickers.map((ps) => {
        const stickerDef = STICKERS.find(s => s.id === ps.stickerId);
        if (!stickerDef) return null;
        return (
          <div key={ps.key} style={{
            position: 'absolute',
            left: `${ps.x}%`, top: `${ps.y}%`,
            transform: `translate(-50%, -50%) rotate(${ps.rot}deg)`,
            zIndex: 4,
          }}>
            <div style={{ transform: `scale(${ps.scale})` }}>
              <div
                className="placed-sticker"
                onClick={() => !disabled && onRemoveSticker(ps.key)}
                style={{
                  animation: 'stickerPlop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both',
                  cursor: disabled ? 'default' : 'pointer',
                  pointerEvents: disabled ? 'none' : 'auto',
                }}
                title="tap to peel off"
              >
                <Sticker sticker={stickerDef} size={52} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function FormField({ label, children, color = C.pinkHot }) {
  return (
    <div style={{
      marginBottom: '16px',
      position: 'relative', zIndex: 1,
    }}>
      <BubblyLabel size="0.7rem" color={color}>{label}</BubblyLabel>
      {children}
    </div>
  );
}

function RetrievedLetter({ retrieved }) {
  const stamp = STAMPS[retrieved.stampIdx] || STAMPS[0];
  const senderInitial = (retrieved.sender || '').charAt(0).toUpperCase();
  const dt = new Date(retrieved.ts);
  const dateStr = dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="paper-rise" style={{
      position: 'relative',
      padding: '70px 22px 22px',
      background: '#ffffff',
      borderRadius: '8px',
      boxShadow: `
        0 0 0 3px ${C.pinkHot},
        0 0 0 6px ${C.yellow},
        0 0 0 9px ${C.mint},
        0 0 0 12px ${C.sky},
        0 0 0 15px ${C.purple},
        0 0 0 18px #ffffff,
        0 12px 24px rgba(0,0,0,0.3)
      `,
      transform: 'rotate(0.7deg)',
      marginTop: '10px',
    }}>
      <div style={{
        position: 'absolute', top: '14px', left: '18px', zIndex: 2,
      }}>
        <PostalStamp stamp={stamp} size={50} tilt={-9} canceled />
      </div>

      <div style={{
        position: 'absolute', top: '18px', right: '14px',
        padding: '4px 12px',
        border: `3px solid ${C.mintDeep}`, borderRadius: '999px',
        background: '#ffffff',
        fontFamily: '"Bagel Fat One", sans-serif',
        fontSize: '0.75rem', color: C.mintDeep,
        letterSpacing: '0.06em',
        transform: 'rotate(8deg)',
        boxShadow: `2px 2px 0 ${C.mintDeep}`,
      }}>★ OPENED ★</div>

      <BubblyLabel size="0.65rem" color={C.purple}>delivered · {dateStr}</BubblyLabel>

      <div style={{
        fontFamily: '"Gloria Hallelujah", cursive',
        fontSize: '1.3rem', color: C.ink,
        marginTop: '8px', marginBottom: '12px', lineHeight: 1.3,
      }}>
        dear {retrieved.recipient || 'friend'},
      </div>

      <div style={{
        padding: '8px 12px', marginBottom: '14px',
        background: `repeating-linear-gradient(180deg,
          transparent 0px, transparent 27px,
          ${C.pinkSoft}aa 27px, ${C.pinkSoft}aa 28px,
          transparent 28px, transparent 30px)`,
        backgroundPositionY: '8px',
        border: `2px solid ${C.pinkSoft}`,
        borderRadius: '10px',
        fontFamily: '"Gloria Hallelujah", cursive',
        fontSize: '1.25rem', lineHeight: '28px',
        color: C.ink,
        whiteSpace: 'pre-wrap', wordBreak: 'break-word',
        minHeight: '56px',
      }}>{retrieved.message || '(no message)'}</div>

      <div style={{
        fontFamily: '"Gloria Hallelujah", cursive',
        fontSize: '1.2rem', color: C.ink,
        lineHeight: 1.3, marginBottom: '14px',
      }}>
        yours,<br />
        <span style={{ fontSize: '1.6rem', color: C.pinkHot }}>{retrieved.sender} ♥</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <StickerSeal initial={senderInitial} size={50} />
      </div>

      {(retrieved.placedStickers || []).map((ps) => {
        const stickerDef = STICKERS.find(s => s.id === ps.stickerId);
        if (!stickerDef) return null;
        return (
          <div key={ps.key} style={{
            position: 'absolute',
            left: `${ps.x}%`, top: `${ps.y}%`,
            transform: `translate(-50%, -50%) rotate(${ps.rot}deg)`,
            zIndex: 4, pointerEvents: 'none',
          }}>
            <div style={{ transform: `scale(${ps.scale * 0.9})` }}>
              <Sticker sticker={stickerDef} size={48} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
