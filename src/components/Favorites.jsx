import { motion } from 'framer-motion';
import { CornerWeb, SpiderWebDivider } from './SpiderWebDecor';

const CARD_ROWS = [
  { label: 'Fav Color', key: 'favoriteColor', icon: 'palette', isColor: true },
  { label: 'Fav Song', key: 'favoriteSong', icon: 'music_note' },
  { label: 'Fav Food', key: 'favoriteFood', icon: 'restaurant' },
  { label: 'Fun Fact', key: 'funFact', icon: 'auto_stories' },
];

const ACCENTS = ['#111111', '#ff6fa5'];
const BGS = ['#f4a6c1', '#ffd9e4'];

function TradingCard({ person, index }) {
  const accentColor = person.accentColor || ACCENTS[index % 2];
  const bgColor = person.bgColor || BGS[index % 2];
  const role = person.role || (index === 0 ? 'The Artist' : 'The Heroine');
  const emoji = person.emoji || (index === 0 ? '🕷️' : '🌸');

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotate: index === 0 ? -4 : 4 }}
      whileInView={{ opacity: 1, y: 0, rotate: index === 0 ? -2 : 2 }}
      viewport={{ once: false, margin: '-40px' }}
      transition={{ duration: 0.6, delay: index * 0.12 }}
      whileHover={{ y: -8, rotate: 0, scale: 1.02 }}
      className={`relative bg-white border-4 border-[#111111] overflow-hidden ${
        index === 0 ? 'md:rotate-[-2deg]' : 'md:rotate-[2deg]'
      }`}
      style={{ boxShadow: `6px 6px 0px 0px ${accentColor}` }}
    >
      <div className="absolute top-0 right-0 w-12 h-12 pointer-events-none z-20 opacity-70">
        <svg viewBox="0 0 60 60" fill="none" className="w-full h-full">
          <line x1="60" y1="0" x2="0" y2="0" stroke="#111" strokeWidth="2.5" />
          <line x1="60" y1="0" x2="60" y2="60" stroke="#111" strokeWidth="2.5" />
          <line x1="60" y1="0" x2="0" y2="60" stroke="#ff6fa5" strokeWidth="2" />
        </svg>
      </div>

      <div
        className="px-4 sm:px-6 py-6 sm:py-8 relative overflow-hidden flex flex-col items-center gap-2.5"
        style={{ backgroundColor: bgColor }}
      >
        <div className="absolute inset-0 halftone-bg opacity-20" />

        <div
          className="relative z-10 w-20 h-20 sm:w-24 sm:h-24 border-4 border-[#111111] rounded-full overflow-hidden flex items-center justify-center text-4xl sm:text-5xl"
          style={{ backgroundColor: accentColor, boxShadow: '3px 3px 0px #111' }}
        >
          {person.avatar ? (
            <img
              src={person.avatar}
              alt={person.name}
              className="w-full h-full object-cover"
              onError={e => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <span
            className={`${person.avatar ? 'hidden' : ''} items-center justify-center w-full h-full`}
            style={{ display: person.avatar ? 'none' : 'flex' }}
          >
            {emoji}
          </span>
        </div>

        <span className="relative z-10 bg-[#111111] text-white font-[Hanken_Grotesk] text-[9px] sm:text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 flex items-center gap-1">
          <span>{role}</span>
          <span className="text-[#00f0ff] animate-pulse">🕸️</span>
        </span>

        <h3
          className="relative z-10 font-[Anybody] text-2xl sm:text-3xl md:text-4xl font-black italic tracking-tighter leading-tight text-center break-words max-w-full"
          style={{ color: '#1d1b18', textShadow: `2px 2px 0px ${accentColor}` }}
        >
          {person.name}
        </h3>
      </div>

      <div className="p-4 sm:p-5 flex flex-col gap-0 divide-y-2 divide-[#e8e1dc]">
        {CARD_ROWS.map(row => (
          <div key={row.key} className="flex items-start gap-2.5 py-2.5 sm:py-3">
            <span className="material-symbols-outlined text-[#aa2c62] text-base sm:text-lg flex-shrink-0 mt-0.5">{row.icon}</span>
            <div className="min-w-0 flex-1">
              <p className="font-[Hanken_Grotesk] text-[9px] sm:text-[10px] font-bold tracking-widest uppercase text-[#837377] mb-0.5">
                {row.label}
              </p>
              {row.isColor ? (
                <div className="flex items-center gap-2">
                  <div
                    className="w-3.5 h-3.5 border-2 border-[#111111] flex-shrink-0"
                    style={{ backgroundColor: person[row.key] }}
                  />
                  <p className="font-[Hanken_Grotesk] text-xs sm:text-sm text-[#1d1b18] truncate">{person[row.key]}</p>
                </div>
              ) : (
                <p className="font-[Hanken_Grotesk] text-xs sm:text-sm text-[#1d1b18] leading-snug break-words">
                  {person[row.key]}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div
        className="h-2.5 w-full border-t-2 border-[#111111]"
        style={{ backgroundColor: accentColor }}
      />
    </motion.div>
  );
}

export default function Favorites({ favoriteCards }) {
  const people = favoriteCards || [];

  return (
    <section id="favorites" className="relative py-16 sm:py-24 px-4 sm:px-8 md:px-16 overflow-hidden bg-[#fff8f3]">
      <CornerWeb position="top-left" size={130} color="#ff6fa5" />
      <CornerWeb position="bottom-right" size={130} color="#00f0ff" />

      <div className="absolute inset-0 web-lines opacity-10 pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h2
            className="font-[Anybody] text-4xl sm:text-5xl md:text-6xl font-black uppercase text-[#1d1b18] leading-none break-words inline-block max-w-full"
            style={{ textShadow: '4px 4px 0px #ff6fa5' }}
          >
            Meet the Team
          </h2>
          <p className="font-[Bricolage_Grotesque] text-base sm:text-lg text-[#514347] mt-3">
            Two heroes, one Spider-Verse 🦸‍♂️🦸‍♀️🕸️
          </p>
        </motion.div>

        <SpiderWebDivider title="HERO PROFILE CARDS 🕷️" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 md:gap-16 max-w-3xl mx-auto mt-8">
          {people.map((person, i) => (
            <TradingCard key={person.id} person={person} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
