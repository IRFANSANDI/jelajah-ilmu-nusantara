import React, { useState } from 'react';
import {
  ArrowLeft,
  Award,
  Check,
  Coins,
  Flame,
  Star,
  UserCheck,
} from 'lucide-react';
import { AvatarId, GradeLevel, PlayerState } from '../types/game';
import { ASSETS, GRADE_META, WORLDS } from '../data/worlds';
import { getLevelInfo } from '../data/rewards';
import { ExplorerSprite } from './ExplorerSprite';
import { ResilientImage } from './ResilientImage';
import { soundEngine } from '../utils/sound';

interface ProfileViewProps {
  player: PlayerState;
  onUpdateProfile: (name: string, avatar: AvatarId) => void;
  onSelectGrade: (grade: GradeLevel) => void;
  onBackHome: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  player,
  onUpdateProfile,
  onSelectGrade,
  onBackHome,
}) => {
  const [nameInput, setNameInput] = useState(player.name);
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarId>(player.avatar);
  const [savedNotice, setSavedNotice] = useState(false);

  const levelInfo = getLevelInfo(player.xp);
  const xpProgress =
    levelInfo.nextXp > levelInfo.minXp
      ? Math.min(
          100,
          Math.round(
            ((player.xp - levelInfo.minXp) / (levelInfo.nextXp - levelInfo.minXp)) * 100
          )
        )
      : 100;

  const totalCompleted = Object.values(player.missionProgress).filter((m) => m.completed).length;
  const totalStars = Object.values(player.missionProgress).reduce(
    (sum, m) => sum + (m.stars || 0),
    0
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = nameInput.trim() || 'Penjelajah Cilik';
    soundEngine.playUnlock();
    onUpdateProfile(cleaned, selectedAvatar);
    setNameInput(cleaned);
    setSavedNotice(true);
    window.setTimeout(() => setSavedNotice(false), 2200);
  };

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <p className="text-xs font-semibold text-emerald-700">
            Catatan Penjelajah · Rapor Belajar
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5">
            Profil Pemain & Progres Belajar
          </h1>
        </div>

        <button
          type="button"
          onClick={() => {
            soundEngine.playClick();
            onBackHome();
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold whitespace-nowrap shrink-0 self-start sm:self-auto cursor-pointer min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Home</span>
        </button>
      </div>

      {/* Top Grid: Profile Editor + Level & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Profile Form */}
        <form
          onSubmit={handleSave}
          className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <ExplorerSprite
              avatar={selectedAvatar}
              accessory={player.equippedAccessory}
              size="lg"
            />
            <div>
              <h2 className="font-display text-xl font-extrabold text-slate-900">
                {player.name}
              </h2>
              <p className="text-xs font-semibold text-emerald-700">
                Level {levelInfo.level} · {levelInfo.title}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Kelas Aktif: {GRADE_META[player.selectedGrade].label}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="player-name" className="block text-xs font-bold text-slate-700">
              Nama Pemain
            </label>
            <input
              id="player-name"
              type="text"
              maxLength={24}
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Masukkan namamu"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="space-y-2">
            <span className="block text-xs font-bold text-slate-700">Pilih Karakter Utama</span>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'bima' as AvatarId, label: 'Bima', img: ASSETS.avatarBima },
                { id: 'sari' as AvatarId, label: 'Sari', img: ASSETS.avatarSari },
              ].map((ch) => {
                const active = selectedAvatar === ch.id;
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      setSelectedAvatar(ch.id);
                    }}
                    className={`p-3 rounded-xl border-2 flex items-center gap-3 transition-all cursor-pointer ${
                      active
                        ? 'border-emerald-600 bg-emerald-50/70'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="w-11 h-11 rounded-full overflow-hidden border border-slate-200 shrink-0">
                      <ResilientImage
                        src={ch.img}
                        alt={ch.label}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-sm font-bold text-slate-900">{ch.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold cursor-pointer min-h-[44px]"
            >
              <UserCheck className="w-4 h-4" />
              <span>Simpan Profil</span>
            </button>

            {savedNotice && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                <Check className="w-4 h-4" />
                <span>Tersimpan</span>
              </span>
            )}
          </div>
        </form>

        {/* Stats & XP Progress */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between space-y-6 shadow-sm">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-extrabold text-slate-900">
                Kemajuan Level & Pengalaman (XP)
              </h2>
              <span className="font-mono text-xs font-bold text-emerald-700 tabular-nums">
                {player.xp} / {levelInfo.nextXp} XP
              </span>
            </div>
            <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 transition-all duration-300"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
            <p className="text-xs text-slate-600">
              Kumpulkan XP dengan menyelesaikan Pos Tantangan dan membuka Peti Harta Dunia.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
              <p className="text-xs font-medium text-amber-800 flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5" />
                <span>Koin Ilmu</span>
              </p>
              <p className="font-mono text-2xl font-extrabold text-amber-950 tabular-nums mt-1">
                {player.coins}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-sky-50 border border-sky-200">
              <p className="text-xs font-medium text-sky-800 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" />
                <span>Skor Total</span>
              </p>
              <p className="font-mono text-2xl font-extrabold text-sky-950 tabular-nums mt-1">
                {player.totalScore}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <p className="text-xs font-medium text-emerald-800 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5" />
                <span>Total Bintang</span>
              </p>
              <p className="font-mono text-2xl font-extrabold text-emerald-950 tabular-nums mt-1">
                {totalStars}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200">
              <p className="text-xs font-medium text-rose-800 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5" />
                <span>Rekor Streak</span>
              </p>
              <p className="font-mono text-2xl font-extrabold text-rose-950 tabular-nums mt-1">
                {player.streakBest} · {totalCompleted} Pos
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Progres Belajar Per Mata Pelajaran (Kelas Aktif) */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-extrabold text-slate-900">
              Progres Belajar Kurikulum — {GRADE_META[player.selectedGrade].label}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Pantau penguasaan materi di 6 dunia pelajaran untuk setiap jenjang kelas.
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1 rounded-xl">
            {([1, 2, 3, 4, 5, 6] as GradeLevel[]).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  onSelectGrade(g);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                  player.selectedGrade === g
                    ? 'bg-white text-emerald-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Kls {g}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {WORLDS.map((w) => {
            const done = [1, 2, 3].filter(
              (o) => player.missionProgress[`${player.selectedGrade}_${w.id}_${o}`]?.completed
            ).length;
            const stars = [1, 2, 3].reduce(
              (sum, o) =>
                sum +
                (player.missionProgress[`${player.selectedGrade}_${w.id}_${o}`]?.stars || 0),
              0
            );
            const pct = Math.round((done / 3) * 100);

            return (
              <div
                key={w.id}
                className="p-4 rounded-xl border border-slate-200 space-y-2.5 bg-slate-50/50"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold text-slate-500">{w.subject}</p>
                    <p className="text-sm font-bold text-slate-900">{w.name}</p>
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-700 tabular-nums">
                    {pct}%
                  </span>
                </div>

                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-300"
                    style={{ width: `${pct}%`, backgroundColor: w.accentHex }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 font-mono tabular-nums">
                  <span>{done}/3 Pos</span>
                  <span>{stars}/9 ★</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
};
