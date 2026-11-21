import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Coins,
  Compass,
  GraduationCap,
  MapPin,
  Play,
  Sparkles,
  Trophy,
  Users,
  X,
} from 'lucide-react';
import { PlayerProgress3D, WORLD_THEMES } from '../game3d/curriculumData';
import { computeLevelStatus, GradeNumber } from '../game3d/inventoryData';

interface GradeUpTransitionModalProps {
  fromGrade: GradeNumber;
  toGrade: GradeNumber;
  scorePct?: number;
  progress: PlayerProgress3D;
  onCancel: () => void;
  onConfirmEnterNewWorld: (toGrade: GradeNumber) => void;
}

export function GradeUpTransitionModal({
  fromGrade,
  toGrade,
  scorePct,
  progress,
  onCancel,
  onConfirmEnterNewWorld,
}: GradeUpTransitionModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const isSdGraduation = fromGrade === 6 && toGrade === 6;
  const fromWorld = WORLD_THEMES[fromGrade];
  const toWorld = WORLD_THEMES[toGrade];
  const levelStatus = computeLevelStatus(progress.xp);
  const ownedAccessoriesCount = progress.ownedAccessories.filter((a) => a !== 'none').length;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-5 bg-slate-950/80"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gradeup-modal-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-3xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Top Ceremonial Banner */}
        <div
          className="px-5 py-4 text-white flex items-center justify-between gap-4 shrink-0"
          style={{
            background: `linear-gradient(120deg, ${fromWorld.badgeColor}, ${toWorld.badgeColor})`,
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center shrink-0">
              {isSdGraduation ? (
                <Trophy className="w-6 h-6 text-amber-300" />
              ) : (
                <GraduationCap className="w-6 h-6 text-amber-200" />
              )}
            </div>
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-amber-200">
                {isSdGraduation
                  ? 'Wisuda Agung Sekolah Dasar Nusantara'
                  : `Upacara Kenaikan Kelas ${fromGrade} → Kelas ${toGrade}`}
              </p>
              <h2 id="gradeup-modal-title" className="font-display text-lg sm:text-xl font-extrabold">
                {step === 1
                  ? isSdGraduation
                    ? `Selamat Lulus Kelas 6 SD, ${progress.playerName}!`
                    : `Selamat Naik ke Kelas ${toGrade}, ${progress.playerName}!`
                  : step === 2
                  ? `Perjalanan Menuju ${toWorld.worldName}`
                  : `Perkenalan Dunia & Karakter Baru Kelas ${toGrade}`}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            aria-label="Tutup upacara kenaikan kelas"
            className="w-9 h-9 rounded-xl bg-black/25 hover:bg-black/40 flex items-center justify-center text-white cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Indicator */}
        <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2 text-xs font-bold text-slate-600 shrink-0">
          {[
            { id: 1 as const, label: '1. Kelulusan' },
            { id: 2 as const, label: '2. Perjalanan Dunia' },
            { id: 3 as const, label: '3. Karakter & NPC Baru' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setStep(item.id)}
              className={`flex-1 py-1.5 px-2.5 rounded-lg text-center transition-colors cursor-pointer ${
                step === item.id
                  ? 'bg-slate-900 text-white font-extrabold'
                  : step > item.id
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-200/70 text-slate-500'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -18 }}
                transition={{ duration: 0.2 }}
                className="space-y-5 text-center"
              >
                <motion.div
                  initial={{ scale: 0.7, rotate: -8 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 220, damping: 14 }}
                  className="w-24 h-24 rounded-3xl mx-auto bg-gradient-to-br from-amber-300 via-amber-400 to-orange-500 text-slate-950 flex items-center justify-center shadow-xl border-4 border-amber-100"
                >
                  <GraduationCap className="w-12 h-12" />
                </motion.div>

                <div className="space-y-1.5 max-w-xl mx-auto">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-extrabold">
                    <CheckCircle2 className="w-4 h-4" />
                    {scorePct !== undefined
                      ? `Ujian Akhir Lulus dengan Skor ${scorePct}%!`
                      : `Pencapaian Kelas ${fromGrade} Terpenuhi!`}
                  </span>
                  <h3 className="font-display text-2xl font-extrabold text-slate-900">
                    {isSdGraduation
                      ? 'Gelar Pahlawan Ilmu Nusantara Diraih!'
                      : `Lulus dari ${fromWorld.worldName}!`}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {isSdGraduation
                      ? 'Kamu telah menaklukkan tantangan puncak Sekolah Dasar di Kerajaan Penjaga Ilmu. Semua progres dan hartamu tetap tersimpan.'
                      : `Perjalanan belajarmu di Kelas ${fromGrade} berhasil diselesaikan. Saatnya berpindah ke dunia baru dengan karakter dan petualangan baru di Kelas ${toGrade}!`}
                  </p>
                </div>

                {/* Retained Progress Banner */}
                <div className="rounded-2xl bg-slate-900 text-white p-4 space-y-2.5 text-left">
                  <p className="text-[11px] font-extrabold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    <span>Seluruh Koin, XP, Skor & Inventaris Tetap Tersimpan!</span>
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="rounded-xl bg-white/10 p-2.5">
                      <p className="text-[11px] text-slate-300 flex items-center gap-1">
                        <Coins className="w-3.5 h-3.5 text-amber-300" />
                        Koin Ilmu
                      </p>
                      <p className="font-mono text-base font-extrabold text-amber-300">
                        {progress.coins}
                      </p>
                    </div>
                    <div className="rounded-xl bg-white/10 p-2.5">
                      <p className="text-[11px] text-slate-300 flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-sky-300" />
                        XP · Lv.{levelStatus.level}
                      </p>
                      <p className="font-mono text-base font-extrabold text-sky-300">
                        {progress.xp} XP
                      </p>
                    </div>
                    <div className="rounded-xl bg-white/10 p-2.5">
                      <p className="text-[11px] text-slate-300">Skor Total</p>
                      <p className="font-mono text-base font-extrabold text-white">
                        {progress.score}
                      </p>
                    </div>
                    <div className="rounded-xl bg-white/10 p-2.5">
                      <p className="text-[11px] text-slate-300">Bab & Aksesoris</p>
                      <p className="font-mono text-base font-extrabold text-emerald-300">
                        {progress.completedChapters.length} Bab · {ownedAccessoriesCount} Item
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -18 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                {/* Journey Route Graphic */}
                <div className="rounded-2xl bg-gradient-to-r from-sky-900 via-teal-800 to-emerald-900 text-white p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex-1 text-center sm:text-left bg-white/10 rounded-2xl p-3.5 border border-white/15 w-full">
                      <p className="text-[10px] font-extrabold uppercase text-sky-200">
                        {isSdGraduation ? 'Pencapaian Awal' : `Asal · Kelas ${fromGrade}`}
                      </p>
                      <p className="font-display text-base font-extrabold mt-0.5">
                        {fromWorld.worldName}
                      </p>
                      <p className="text-xs text-slate-200 mt-1">{fromWorld.heroRoleName}</p>
                    </div>

                    <motion.div
                      animate={{ x: [0, 8, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                      className="flex flex-col items-center gap-1 text-amber-300 shrink-0"
                    >
                      <Compass className="w-8 h-8" />
                      <span className="text-[10px] font-extrabold uppercase tracking-wider">
                        Menuju Dunia Baru
                      </span>
                    </motion.div>

                    <div className="flex-1 text-center sm:text-right bg-amber-400/20 rounded-2xl p-3.5 border border-amber-300/40 w-full">
                      <p className="text-[10px] font-extrabold uppercase text-amber-200">
                        Tujuan · Kelas {toGrade}
                      </p>
                      <p className="font-display text-base font-extrabold text-amber-200 mt-0.5">
                        {toWorld.worldName}
                      </p>
                      <p className="text-xs text-white mt-1">{toWorld.heroRoleName}</p>
                    </div>
                  </div>
                </div>

                {/* What Changes in the New World */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 space-y-1">
                    <p className="text-xs font-extrabold text-sky-900 uppercase">
                      Transformasi Karakter Utama
                    </p>
                    <p className="text-sm font-extrabold text-slate-900">
                      {toWorld.heroRoleName}
                    </p>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {toWorld.heroRoleDesc}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
                    <p className="text-xs font-extrabold text-emerald-900 uppercase">
                      Lingkungan & Arsitektur Baru
                    </p>
                    <p className="text-sm font-extrabold text-slate-900">
                      {toWorld.architectureTitle}
                    </p>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      Pendamping Alam: {toWorld.creatureNames}. Lengkap dengan pencahayaan langit dan musik latar khas Kelas {toGrade}.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -18 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-1.5">
                  <p className="text-xs font-extrabold uppercase text-amber-900 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    <span>Cerita Petualangan Baru · {toWorld.worldName}</span>
                  </p>
                  <p className="text-sm text-slate-800 leading-relaxed font-medium">
                    {toWorld.worldIntroStory}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-extrabold uppercase text-slate-500 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-emerald-600" />
                    <span>Perkenalkan 3 Mentor NPC Baru di Kelas {toGrade}</span>
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {toWorld.npcs.map((npc) => (
                      <div
                        key={npc.id}
                        className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3.5 h-3.5 rounded-full shrink-0 border border-slate-300"
                            style={{
                              backgroundColor: `#${npc.colors.shirt.toString(16).padStart(6, '0')}`,
                            }}
                          />
                          <p className="font-display text-sm font-extrabold text-slate-900 truncate">
                            {npc.name}
                          </p>
                        </div>
                        <p className="text-[11px] font-bold text-emerald-700">{npc.role}</p>
                        <p className="text-[11px] text-slate-600 line-clamp-2">
                          "{npc.greeting}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Navigation Footer */}
        <div className="px-5 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer"
          >
            Nanti Saja
          </button>

          <div className="flex items-center gap-2">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((s) => (s === 3 ? 2 : 1))}
                className="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold cursor-pointer"
              >
                ← Sebelumnya
              </button>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s === 1 ? 2 : 3))}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-extrabold flex items-center gap-2 cursor-pointer shadow"
              >
                <span>
                  {step === 1
                    ? isSdGraduation
                      ? 'Lihat Perjalanan Wisuda'
                      : `Perjalanan ke Kelas ${toGrade}`
                    : 'Kenali Karakter & NPC Baru'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onConfirmEnterNewWorld(toGrade)}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-extrabold flex items-center gap-2 cursor-pointer shadow-lg"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>
                  {isSdGraduation
                    ? 'Jelajahi Lagi Kerajaan Penjaga Ilmu!'
                    : `Masuk Dunia Kelas ${toGrade} dengan Karakter Baru!`}
                </span>
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
