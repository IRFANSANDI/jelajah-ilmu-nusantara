import { useState } from 'react';
import {
  Award,
  Check,
  Coins,
  Compass,
  RotateCcw,
  Sparkles,
  TrendingUp,
  User,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  getGradeCompletedCount,
  PlayerProgress3D,
  WORLD_THEMES,
} from '../game3d/curriculumData';
import { getChapterById } from '../game3d/curriculum';
import { GRADE1_OPEN_WORLD_REGIONS } from '../game3d/grade1SubjectWorlds';
import {
  computeLevelStatus,
  GradeNumber,
  HeroStyleId,
  LOCAL_REGIONS,
  LocalRegionId,
  RELIGIONS,
  ReligionId,
} from '../game3d/inventoryData';

interface PlayerProfile3DViewProps {
  progress: PlayerProgress3D;
  onUpdateName: (name: string) => void;
  onSelectHeroStyle: (style: HeroStyleId) => void;
  onSelectReligion: (religion: ReligionId) => void;
  onSelectLocalRegion?: (region: LocalRegionId) => void;
  onToggleEnglish: (enabled: boolean) => void;
  onToggleSound: () => void;
  onResetProgress: () => void;
}

export function PlayerProfile3DView({
  progress,
  onUpdateName,
  onSelectHeroStyle,
  onSelectReligion,
  onSelectLocalRegion,
  onToggleEnglish,
  onToggleSound,
  onResetProgress,
}: PlayerProfile3DViewProps) {
  const [nameInput, setNameInput] = useState(progress.playerName);
  const [savedNotice, setSavedNotice] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const levelInfo = computeLevelStatus(progress.xp);
  const discoveredRegions = progress.discoveredRegions ?? ['desa-ceria'];
  const visitedInteriors = progress.visitedInteriors ?? [];
  const masteredSkills = progress.masteredSkills ?? [];
  const needsPracticeSkills = progress.needsPracticeSkills ?? [];
  const recentHistory = Object.entries(progress.chapterScoreHistory ?? {})
    .flatMap(([chapterId, entries]) =>
      entries.map((entry) => ({ chapterId, ...entry }))
    )
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 6);

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    onUpdateName(trimmed);
    setSavedNotice(true);
    window.setTimeout(() => setSavedNotice(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div>
        <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
          <User className="w-7 h-7 text-sky-600" />
          <span>Profil Pemain & Pengaturan</span>
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          Semua progres kelas, bab, nilai, XP, koin, agama pilihan, dan pencapaian tersimpan otomatis di peramban.
        </p>
      </div>

      {/* Player Identity & Character 3D Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm space-y-5">
          <form onSubmit={handleSaveName} className="space-y-3">
            <label
              htmlFor="player-name-input"
              className="block text-xs font-extrabold uppercase tracking-wider text-slate-500"
            >
              Nama Petualang
            </label>
            <div className="flex gap-2">
              <input
                id="player-name-input"
                type="text"
                maxLength={24}
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
              >
                Simpan
              </button>
            </div>
            {savedNotice && (
              <p className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Nama berhasil diperbarui!
              </p>
            )}
          </form>

          <div className="space-y-2.5">
            <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Pilih Karakter 3D Utama
            </p>
            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  {
                    id: 'bima' as HeroStyleId,
                    name: 'Bima',
                    desc: 'Rompi petualang cokelat & syal merah',
                  },
                  {
                    id: 'sari' as HeroStyleId,
                    name: 'Sari',
                    desc: 'Rompi zamrud, rambut kuncir & pita emas',
                  },
                ]
              ).map((hero) => {
                const active = progress.heroStyle === hero.id;
                return (
                  <button
                    key={hero.id}
                    type="button"
                    onClick={() => onSelectHeroStyle(hero.id)}
                    className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                      active
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-slate-50 text-slate-900 border-slate-200 hover:border-emerald-400'
                    }`}
                  >
                    <p className="font-display text-base font-extrabold">{hero.name}</p>
                    <p
                      className={`text-[11px] mt-1 ${
                        active ? 'text-slate-300' : 'text-slate-600'
                      }`}
                    >
                      {hero.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Agama & Budi Pekerti Selector */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <label
              htmlFor="profile-religion-select"
              className="block text-xs font-extrabold uppercase tracking-wider text-slate-500"
            >
              Pendidikan Agama & Budi Pekerti
            </label>
            <select
              id="profile-religion-select"
              value={progress.religion}
              onChange={(e) => onSelectReligion(e.target.value as ReligionId)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-sm font-bold text-slate-900 cursor-pointer"
            >
              {RELIGIONS.map((rel) => (
                <option key={rel.id} value={rel.id}>
                  {rel.label}
                </option>
              ))}
            </select>
          </div>

          {/* Muatan Lokal Daerah Selector */}
          {onSelectLocalRegion && (
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <label
                htmlFor="profile-region-select"
                className="block text-xs font-extrabold uppercase tracking-wider text-slate-500"
              >
                Daerah Muatan Lokal (Kelas 1 Kampung Budaya)
              </label>
              <select
                id="profile-region-select"
                value={progress.localRegion}
                onChange={(e) => onSelectLocalRegion(e.target.value as LocalRegionId)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 bg-amber-50 text-sm font-bold text-slate-900 cursor-pointer"
              >
                {LOCAL_REGIONS.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.label} · {loc.province}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* English Optional Toggle */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-slate-900">Bahasa Inggris Sekolah</p>
              <p className="text-xs text-slate-500">Tampilkan mata pelajaran Bahasa Inggris (Kurikulum Merdeka)</p>
            </div>
            <button
              type="button"
              onClick={() => onToggleEnglish(!progress.englishEnabled)}
              className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer shrink-0 ${
                progress.englishEnabled
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {progress.englishEnabled ? 'Aktif' : 'Nonaktif'}
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-900">Efek Suara Permainan</p>
              <p className="text-xs text-slate-500">Langkah kaki, koin, lompat, dan misi selesai</p>
            </div>
            <button
              type="button"
              onClick={onToggleSound}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                progress.soundEnabled
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {progress.soundEnabled ? (
                <>
                  <Volume2 className="w-4 h-4" /> Aktif
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4" /> Nonaktif
                </>
              )}
            </button>
          </div>
        </div>

        {/* Lifetime Stats & Grade Breakdown */}
        <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200">
              <Coins className="w-5 h-5 text-amber-600 mx-auto" />
              <p className="font-mono text-lg font-extrabold text-slate-900 mt-1 tabular-nums">
                {progress.coins}
              </p>
              <p className="text-[11px] font-bold text-amber-800">Koin Ilmu</p>
            </div>
            <div className="p-3 rounded-2xl bg-sky-50 border border-sky-200">
              <Award className="w-5 h-5 text-sky-600 mx-auto" />
              <p className="font-mono text-lg font-extrabold text-slate-900 mt-1 tabular-nums">
                {progress.score}
              </p>
              <p className="text-[11px] font-bold text-sky-800">Total Skor</p>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
              <Sparkles className="w-5 h-5 text-emerald-600 mx-auto" />
              <p className="font-mono text-lg font-extrabold text-slate-900 mt-1 tabular-nums">
                Lv.{levelInfo.level}
              </p>
              <p className="text-[11px] font-bold text-emerald-800">{progress.xp} XP</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <p className="font-mono text-lg font-extrabold text-slate-900 tabular-nums">
                {progress.completedChapters.length}
              </p>
              <p className="text-[11px] font-bold text-slate-600">Bab Mapel Lulus</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <p className="font-mono text-lg font-extrabold text-amber-600 tabular-nums">
                {progress.completedSubjectExams.length}
              </p>
              <p className="text-[11px] font-bold text-slate-600">Ujian Akhir Lulus</p>
            </div>
          </div>

          <div className="space-y-2.5">
            <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Progres 6 Dunia Kelas 1 – 6
            </p>
            {([1, 2, 3, 4, 5, 6] as GradeNumber[]).map((grade) => {
              const done = getGradeCompletedCount(progress, grade);
              const pct = (done / 4) * 100;
              return (
                <div key={grade} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-700">
                      Kelas {grade} · {WORLD_THEMES[grade].worldName}
                    </span>
                    <span className="font-mono text-slate-600">{done}/4 Bab</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: WORLD_THEMES[grade].badgeColor,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grade 1 Open World Discovery & Skill Diagnostics Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-display text-base font-extrabold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <span>Diagnostik Kemampuan & Eksplorasi</span>
            </h3>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-sky-50 border border-sky-200 text-sky-800">
              {discoveredRegions.length}/{GRADE1_OPEN_WORLD_REGIONS.length} Kawasan ·{' '}
              {visitedInteriors.length}/{GRADE1_OPEN_WORLD_REGIONS.length} Ruangan
            </span>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-extrabold uppercase tracking-wider text-emerald-800">
              Kemampuan Dikuasai ({masteredSkills.length})
            </p>
            {masteredSkills.length === 0 ? (
              <p className="text-xs text-slate-500">
                Selesaikan kuis bab dengan jawaban tepat pertama untuk mencatat kemampuan yang sudah dikuasai.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {masteredSkills.map((sk) => (
                  <span
                    key={sk}
                    className="px-2.5 py-1 rounded-lg bg-emerald-100 border border-emerald-200 text-emerald-900 text-xs font-bold"
                  >
                    ✓ {sk}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <p className="text-xs font-extrabold uppercase tracking-wider text-amber-800">
              Perlu Latihan Tambahan ({needsPracticeSkills.length})
            </p>
            {needsPracticeSkills.length === 0 ? (
              <p className="text-xs text-slate-500">
                Belum ada catatan topik yang perlu diulang. Pertahankan semangat belajarmu!
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {needsPracticeSkills.map((sk) => (
                  <span
                    key={sk}
                    className="px-2.5 py-1 rounded-lg bg-amber-100 border border-amber-300 text-amber-950 text-xs font-bold"
                  >
                    ↻ {sk}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="font-display text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Compass className="w-5 h-5 text-sky-600" />
            <span>Riwayat Latihan & Kuis Terbaru</span>
          </h3>

          {recentHistory.length === 0 ? (
            <p className="text-xs text-slate-500">
              Belum ada riwayat kuis tersimpan. Coba kerjakan latihan bab di Dunia 3D atau menu Materi Pelajaran!
            </p>
          ) : (
            <div className="space-y-2">
              {recentHistory.map((item, idx) => {
                const ch = getChapterById(item.chapterId, progress.religion);
                return (
                  <div
                    key={`${item.chapterId}-${item.timestamp}-${idx}`}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <p className="font-extrabold text-slate-900 truncate">
                        {ch ? ch.title : item.chapterId}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Benar langsung {item.firstTryCorrect}/{item.total}
                        {item.usedVariation ? ' · Soal Variasi Baru' : ''}
                      </p>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-lg font-mono font-extrabold shrink-0 ${
                        item.scorePct >= 60
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {item.scorePct}%
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Safe Two-Step Progress Reset */}
      <div className="rounded-2xl bg-white border border-rose-200 p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-display text-base font-extrabold text-slate-900">
            Atur Ulang Progres Petualangan
          </h3>
          <p className="text-xs text-slate-600">
            Menghapus seluruh progres bab, koin, dan pencapaian untuk memulai dari awal.
          </p>
        </div>

        {!confirmReset ? (
          <button
            type="button"
            onClick={() => setConfirmReset(true)}
            className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Progres</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onResetProgress();
                setConfirmReset(false);
                setNameInput('Petualang Cilik');
              }}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
            >
              Ya, Hapus Semua
            </button>
            <button
              type="button"
              onClick={() => setConfirmReset(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold cursor-pointer"
            >
              Batal
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
