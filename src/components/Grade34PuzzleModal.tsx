import { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Compass,
  HelpCircle,
  KeyRound,
  Puzzle,
  RotateCcw,
  Sparkles,
  X,
} from 'lucide-react';
import { Grade3Challenge } from '../game3d/grade3World';
import { Grade4PuzzleChallenge } from '../game3d/grade4World';

function deterministicShuffle<T>(items: T[], seed: number): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = (seed * 7 + i * 3 + 1) % (i + 1);
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  // Ensure at least first element shifts when possible so it isn't trivially in order
  if (arr.length > 1 && arr[0] === items[0]) {
    const first = arr.shift()!;
    arr.push(first);
  }
  return arr;
}

interface Grade3ModalProps {
  challenge: Grade3Challenge;
  alreadySolved: boolean;
  onSolved: (bab: number) => void;
  onClose: () => void;
  onReadMateri: () => void;
}

export function Grade3ExplorationModal({
  challenge,
  alreadySolved,
  onSolved,
  onClose,
  onReadMateri,
}: Grade3ModalProps) {
  const [textAns, setTextAns] = useState('');
  const [orderPicked, setOrderPicked] = useState<string[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [pairMap, setPairMap] = useState<Record<string, string>>({});
  const [showHint, setShowHint] = useState(false);
  const [solvedNow, setSolvedNow] = useState(alreadySolved);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setTextAns('');
    setOrderPicked([]);
    setSelectedLeft(null);
    setPairMap({});
    setShowHint(false);
    setSolvedNow(alreadySolved);
    setErrorMsg(null);
  }, [challenge.bab, alreadySolved]);

  const shuffledOrderItems = useMemo(() => {
    if (challenge.type !== 'order-sequence') return [];
    return deterministicShuffle(challenge.items, challenge.bab);
  }, [challenge]);

  const shuffledRights = useMemo(() => {
    if (challenge.type !== 'classify-pairs') return [];
    return deterministicShuffle(
      challenge.pairs.map((p) => p.right),
      challenge.bab + 2
    );
  }, [challenge]);

  const handleVerify = () => {
    setErrorMsg(null);

    if (challenge.type === 'word-decode') {
      const norm = textAns.trim().toLowerCase().replace(/\s+/g, ' ');
      if (challenge.acceptedAnswers.some((a) => a.toLowerCase() === norm)) {
        setSolvedNow(true);
        onSolved(challenge.bab);
      } else {
        setErrorMsg('Belum tepat! Periksa ejaan atau buka petunjuk terlebih dahulu.');
      }
      return;
    }

    if (challenge.type === 'number-input') {
      const parsed = Number(textAns.replace(/[^0-9.-]/g, ''));
      if (!Number.isNaN(parsed) && parsed === challenge.expectedNumber) {
        setSolvedNow(true);
        onSolved(challenge.bab);
      } else {
        setErrorMsg('Angka belum sesuai. Hitung kembali atau klik Petunjuk.');
      }
      return;
    }

    if (challenge.type === 'order-sequence') {
      if (orderPicked.length < challenge.items.length) {
        setErrorMsg('Pilih semua tahapan berurutan hingga lengkap.');
        return;
      }
      const isMatch = challenge.items.every((item, idx) => orderPicked[idx] === item);
      if (isMatch) {
        setSolvedNow(true);
        onSolved(challenge.bab);
      } else {
        setErrorMsg('Urutannya masih tertukar. Klik Atur Ulang lalu susun dari awal!');
      }
      return;
    }

    if (challenge.type === 'classify-pairs') {
      if (Object.keys(pairMap).length < challenge.pairs.length) {
        setErrorMsg('Pasangkan semua kartu di kiri dan kanan terlebih dahulu.');
        return;
      }
      const isMatch = challenge.pairs.every((p) => pairMap[p.left] === p.right);
      if (isMatch) {
        setSolvedNow(true);
        onSolved(challenge.bab);
      } else {
        setErrorMsg('Ada pasangan yang kurang tepat. Coba periksa kembali!');
      }
    }
  };

  return (
    <div
      className="absolute inset-0 z-30 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-xl bg-white rounded-2xl border border-emerald-200 shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        <div className="px-5 py-4 bg-emerald-800 text-white flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <Compass className="w-5 h-5 text-amber-300 shrink-0" />
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-emerald-200 truncate">
                Eksplorasi Hutan Misteri · {challenge.locationName} (Bab {challenge.bab})
              </p>
              <h2 className="font-display text-base sm:text-lg font-extrabold truncate">
                {challenge.title}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup tantangan eksplorasi"
            className="w-9 h-9 rounded-lg bg-emerald-900 hover:bg-emerald-950 flex items-center justify-center cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto text-sm">
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs sm:text-sm leading-relaxed">
            <strong>Temuan Lapangan:</strong> {challenge.storyClue}
          </div>

          <div className="flex items-center justify-between gap-2">
            <p className="font-bold text-slate-900 text-sm sm:text-base">{challenge.prompt}</p>
            <button
              type="button"
              onClick={onReadMateri}
              className="text-xs font-bold text-emerald-700 hover:underline shrink-0 cursor-pointer"
            >
              Baca Materi
            </button>
          </div>

          {(challenge.type === 'word-decode' || challenge.type === 'number-input') && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type={challenge.type === 'number-input' ? 'number' : 'text'}
                  value={textAns}
                  disabled={solvedNow}
                  onChange={(e) => setTextAns(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !solvedNow) handleVerify();
                  }}
                  placeholder={
                    challenge.type === 'number-input'
                      ? 'Ketik angka jawaban...'
                      : 'Ketik kata kunci jawaban...'
                  }
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-300 focus:border-emerald-600 focus:outline-none font-bold text-base text-slate-900"
                />
                {challenge.type === 'number-input' && (
                  <span className="px-3 py-3 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700">
                    {challenge.unit}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => setShowHint((h) => !h)}
                className="text-xs font-bold text-amber-700 flex items-center gap-1 cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{showHint ? 'Sembunyikan Petunjuk' : 'Butuh Petunjuk?'}</span>
              </button>
              {showHint && (
                <p className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900">
                  Petunjuk: {challenge.hint}
                </p>
              )}
            </div>
          )}

          {challenge.type === 'order-sequence' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                  <span>Urutan Pilihanmu ({orderPicked.length}/{challenge.items.length})</span>
                  {!solvedNow && orderPicked.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setOrderPicked([])}
                      className="text-rose-600 flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Atur Ulang</span>
                    </button>
                  )}
                </div>
                {orderPicked.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">
                    Klik kartu di bawah secara berurutan mulai dari langkah pertama.
                  </p>
                ) : (
                  <div className="space-y-1">
                    {orderPicked.map((item, idx) => (
                      <div
                        key={item}
                        className="px-3 py-1.5 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-950 text-xs font-bold flex items-center gap-2"
                      >
                        <span className="w-5 h-5 rounded-full bg-emerald-700 text-white text-[10px] flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-1.5">
                {shuffledOrderItems.map((item) => {
                  const used = orderPicked.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      disabled={used || solvedNow}
                      onClick={() => setOrderPicked((prev) => [...prev, item])}
                      className={`px-3.5 py-2.5 rounded-xl border text-left text-xs sm:text-sm font-bold transition-colors ${
                        used || solvedNow
                          ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                          : 'bg-white hover:bg-emerald-50 border-slate-300 hover:border-emerald-500 text-slate-800 cursor-pointer'
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {challenge.type === 'classify-pairs' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <p className="text-[11px] font-extrabold uppercase text-slate-500">
                    1. Pilih Unsur (Kiri)
                  </p>
                  {challenge.pairs.map((p) => {
                    const paired = pairMap[p.left];
                    const active = selectedLeft === p.left;
                    return (
                      <button
                        key={p.left}
                        type="button"
                        disabled={solvedNow}
                        onClick={() => setSelectedLeft(p.left)}
                        className={`w-full px-3 py-2.5 rounded-xl border text-left text-xs font-bold cursor-pointer ${
                          active
                            ? 'bg-emerald-700 border-emerald-800 text-white'
                            : paired
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                            : 'bg-white border-slate-300 hover:border-emerald-500 text-slate-800'
                        }`}
                      >
                        <div>{p.left}</div>
                        {paired && (
                          <div className="text-[10px] font-semibold text-emerald-700 mt-0.5">
                            → {paired}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-1.5">
                  <p className="text-[11px] font-extrabold uppercase text-slate-500">
                    2. Cocokkan Pasangan (Kanan)
                  </p>
                  {shuffledRights.map((rightVal) => {
                    const usedBy = Object.entries(pairMap).find(
                      ([, v]) => v === rightVal
                    )?.[0];
                    return (
                      <button
                        key={rightVal}
                        type="button"
                        disabled={solvedNow || !selectedLeft}
                        onClick={() => {
                          if (!selectedLeft) return;
                          setPairMap((prev) => ({
                            ...prev,
                            [selectedLeft]: rightVal,
                          }));
                          setSelectedLeft(null);
                        }}
                        className={`w-full px-3 py-2.5 rounded-xl border text-left text-xs font-bold ${
                          usedBy
                            ? 'bg-sky-50 border-sky-300 text-sky-900'
                            : selectedLeft
                            ? 'bg-amber-50 hover:bg-amber-100 border-amber-400 text-slate-900 cursor-pointer'
                            : 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        {rightVal}
                      </button>
                    );
                  })}
                </div>
              </div>
              {!solvedNow && Object.keys(pairMap).length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setPairMap({});
                    setSelectedLeft(null);
                  }}
                  className="text-xs font-bold text-rose-600 flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Ulangi Pasangan</span>
                </button>
              )}
            </div>
          )}

          {errorMsg && (
            <p className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
              {errorMsg}
            </p>
          )}

          {solvedNow && (
            <div className="p-3.5 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-950 space-y-1">
              <p className="font-extrabold flex items-center gap-1.5 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Misi Eksplorasi Wilayah {challenge.bab} Selesai! (+20 Koin, +30 XP)</span>
              </p>
              <p className="text-xs leading-relaxed">{challenge.explanation}</p>
            </div>
          )}
        </div>

        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs sm:text-sm font-bold cursor-pointer"
          >
            {solvedNow ? 'Lanjut Jelajah Hutan' : 'Tutup'}
          </button>
          {!solvedNow && (
            <button
              type="button"
              onClick={handleVerify}
              className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs sm:text-sm font-extrabold flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Periksa Jawaban</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface Grade4ModalProps {
  puzzle: Grade4PuzzleChallenge;
  alreadySolved: boolean;
  onSolved: (bab: number) => void;
  onClose: () => void;
  onReadMateri: () => void;
}

export function Grade4PuzzleModal({
  puzzle,
  alreadySolved,
  onSolved,
  onClose,
  onReadMateri,
}: Grade4ModalProps) {
  const [numAns, setNumAns] = useState('');
  const [orderPicked, setOrderPicked] = useState<string[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [pairMap, setPairMap] = useState<Record<string, string>>({});
  const [showHint, setShowHint] = useState(false);
  const [solvedNow, setSolvedNow] = useState(alreadySolved);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setNumAns('');
    setOrderPicked([]);
    setSelectedLeft(null);
    setPairMap({});
    setShowHint(false);
    setSolvedNow(alreadySolved);
    setErrorMsg(null);
  }, [puzzle.bab, alreadySolved]);

  const shuffledOrderItems = useMemo(() => {
    if (puzzle.type !== 'symbol-order') return [];
    return deterministicShuffle(puzzle.items, puzzle.bab + 3);
  }, [puzzle]);

  const shuffledRights = useMemo(() => {
    if (puzzle.type !== 'pair-logic') return [];
    return deterministicShuffle(
      puzzle.pairs.map((p) => p.right),
      puzzle.bab + 5
    );
  }, [puzzle]);

  const handleVerify = () => {
    setErrorMsg(null);

    if (puzzle.type === 'mechanism-calc' || puzzle.type === 'number-sequence') {
      const parsed = Number(numAns.replace(/[^0-9.-]/g, ''));
      if (!Number.isNaN(parsed) && parsed === puzzle.expectedNumber) {
        setSolvedNow(true);
        onSolved(puzzle.bab);
      } else {
        setErrorMsg('Kunci mekanik belum pas! Hitung kembali atau buka Petunjuk.');
      }
      return;
    }

    if (puzzle.type === 'symbol-order') {
      if (orderPicked.length < puzzle.items.length) {
        setErrorMsg('Pilih semua simbol bangun datar secara berurutan.');
        return;
      }
      const isMatch = puzzle.items.every((item, idx) => orderPicked[idx] === item);
      if (isMatch) {
        setSolvedNow(true);
        onSolved(puzzle.bab);
      } else {
        setErrorMsg('Urutan rune masih salah. Mulai dari sisi paling sedikit!');
      }
      return;
    }

    if (puzzle.type === 'pair-logic') {
      if (Object.keys(pairMap).length < puzzle.pairs.length) {
        setErrorMsg('Pasangkan semua kartu logika di kiri dan kanan.');
        return;
      }
      const isMatch = puzzle.pairs.every((p) => pairMap[p.left] === p.right);
      if (isMatch) {
        setSolvedNow(true);
        onSolved(puzzle.bab);
      } else {
        setErrorMsg('Pasangan belum tepat. Periksa kembali tiap nilai!');
      }
    }
  };

  return (
    <div
      className="absolute inset-0 z-30 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-xl bg-white rounded-2xl border border-sky-200 shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <Puzzle className="w-5 h-5 text-cyan-300 shrink-0" />
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-cyan-300 truncate">
                Teka-Teki Mekanik · {puzzle.locationName} (Bab {puzzle.bab})
              </p>
              <h2 className="font-display text-base sm:text-lg font-extrabold truncate">
                {puzzle.title}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup panel teka-teki"
            className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto text-sm">
          <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-950 text-xs sm:text-sm leading-relaxed">
            <strong>Mekanisme Pulau:</strong> {puzzle.story}
          </div>

          <div className="flex items-center justify-between gap-2">
            <p className="font-bold text-slate-900 text-sm sm:text-base">{puzzle.prompt}</p>
            <button
              type="button"
              onClick={onReadMateri}
              className="text-xs font-bold text-sky-700 hover:underline shrink-0 cursor-pointer"
            >
              Baca Materi
            </button>
          </div>

          {puzzle.type === 'number-sequence' && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-center gap-2 p-3 rounded-xl bg-slate-900">
                {puzzle.sequenceDisplay.map((val, idx) => (
                  <div
                    key={idx}
                    className={`min-w-[54px] h-12 px-3 rounded-xl flex items-center justify-center font-mono text-lg font-extrabold ${
                      idx === puzzle.missingIndex
                        ? 'bg-amber-400 text-slate-950 border-2 border-amber-200'
                        : 'bg-slate-800 text-cyan-300 border border-slate-700'
                    }`}
                  >
                    {idx === puzzle.missingIndex ? (numAns || '?') : val}
                  </div>
                ))}
              </div>
              <input
                type="number"
                value={numAns}
                disabled={solvedNow}
                onChange={(e) => setNumAns(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !solvedNow) handleVerify();
                }}
                placeholder="Masukkan angka pengganti ?"
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 focus:border-sky-600 focus:outline-none font-bold text-base text-slate-900"
              />
              <button
                type="button"
                onClick={() => setShowHint((h) => !h)}
                className="text-xs font-bold text-amber-700 flex items-center gap-1 cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{showHint ? 'Sembunyikan Petunjuk' : 'Buka Petunjuk Pola'}</span>
              </button>
              {showHint && (
                <p className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900">
                  Petunjuk: {puzzle.hint}
                </p>
              )}
            </div>
          )}

          {puzzle.type === 'mechanism-calc' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={numAns}
                  disabled={solvedNow}
                  onChange={(e) => setNumAns(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !solvedNow) handleVerify();
                  }}
                  placeholder="Masukkan angka kunci mekanik..."
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-300 focus:border-sky-600 focus:outline-none font-bold text-base text-slate-900"
                />
                <span className="px-3 py-3 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700">
                  {puzzle.unit}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowHint((h) => !h)}
                className="text-xs font-bold text-amber-700 flex items-center gap-1 cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{showHint ? 'Sembunyikan Petunjuk' : 'Buka Petunjuk Hitungan'}</span>
              </button>
              {showHint && (
                <p className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900">
                  Petunjuk: {puzzle.hint}
                </p>
              )}
            </div>
          )}

          {puzzle.type === 'symbol-order' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                  <span>Urutan Rune ({orderPicked.length}/{puzzle.items.length})</span>
                  {!solvedNow && orderPicked.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setOrderPicked([])}
                      className="text-rose-600 flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Atur Ulang</span>
                    </button>
                  )}
                </div>
                {orderPicked.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">
                    Klik bangun datar berurutan dari sisi paling sedikit!
                  </p>
                ) : (
                  <div className="space-y-1">
                    {orderPicked.map((item, idx) => (
                      <div
                        key={item}
                        className="px-3 py-1.5 rounded-lg bg-sky-100 border border-sky-300 text-sky-950 text-xs font-bold flex items-center gap-2"
                      >
                        <span className="w-5 h-5 rounded-full bg-sky-700 text-white text-[10px] flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-1.5">
                {shuffledOrderItems.map((item) => {
                  const used = orderPicked.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      disabled={used || solvedNow}
                      onClick={() => setOrderPicked((prev) => [...prev, item])}
                      className={`px-3.5 py-2.5 rounded-xl border text-left text-xs sm:text-sm font-bold ${
                        used || solvedNow
                          ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                          : 'bg-white hover:bg-sky-50 border-slate-300 hover:border-sky-500 text-slate-800 cursor-pointer'
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {puzzle.type === 'pair-logic' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <p className="text-[11px] font-extrabold uppercase text-slate-500">
                    1. Pilih Nilai (Kiri)
                  </p>
                  {puzzle.pairs.map((p) => {
                    const paired = pairMap[p.left];
                    const active = selectedLeft === p.left;
                    return (
                      <button
                        key={p.left}
                        type="button"
                        disabled={solvedNow}
                        onClick={() => setSelectedLeft(p.left)}
                        className={`w-full px-3 py-2.5 rounded-xl border text-left text-xs font-bold cursor-pointer ${
                          active
                            ? 'bg-sky-700 border-sky-800 text-white'
                            : paired
                            ? 'bg-sky-50 border-sky-300 text-sky-950'
                            : 'bg-white border-slate-300 hover:border-sky-500 text-slate-800'
                        }`}
                      >
                        <div>{p.left}</div>
                        {paired && (
                          <div className="text-[10px] font-semibold text-sky-700 mt-0.5">
                            → {paired}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-1.5">
                  <p className="text-[11px] font-extrabold uppercase text-slate-500">
                    2. Cocokkan Arti (Kanan)
                  </p>
                  {shuffledRights.map((rightVal) => {
                    const usedBy = Object.entries(pairMap).find(
                      ([, v]) => v === rightVal
                    )?.[0];
                    return (
                      <button
                        key={rightVal}
                        type="button"
                        disabled={solvedNow || !selectedLeft}
                        onClick={() => {
                          if (!selectedLeft) return;
                          setPairMap((prev) => ({
                            ...prev,
                            [selectedLeft]: rightVal,
                          }));
                          setSelectedLeft(null);
                        }}
                        className={`w-full px-3 py-2.5 rounded-xl border text-left text-xs font-bold ${
                          usedBy
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                            : selectedLeft
                            ? 'bg-amber-50 hover:bg-amber-100 border-amber-400 text-slate-900 cursor-pointer'
                            : 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        {rightVal}
                      </button>
                    );
                  })}
                </div>
              </div>
              {!solvedNow && Object.keys(pairMap).length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setPairMap({});
                    setSelectedLeft(null);
                  }}
                  className="text-xs font-bold text-rose-600 flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Ulangi Pasangan</span>
                </button>
              )}
            </div>
          )}

          {errorMsg && (
            <p className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
              {errorMsg}
            </p>
          )}

          {solvedNow && (
            <div className="p-3.5 rounded-xl bg-sky-100 border border-sky-300 text-sky-950 space-y-1">
              <p className="font-extrabold flex items-center gap-1.5 text-sm">
                <CheckCircle2 className="w-4 h-4 text-sky-700 shrink-0" />
                <span>Teka-Teki Wilayah {puzzle.bab} Terbuka! (+25 Koin, +35 XP)</span>
              </p>
              <p className="text-xs leading-relaxed">{puzzle.explanation}</p>
            </div>
          )}
        </div>

        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs sm:text-sm font-bold cursor-pointer"
          >
            {solvedNow ? 'Lanjutkan Petualangan' : 'Tutup'}
          </button>
          {!solvedNow && (
            <button
              type="button"
              onClick={handleVerify}
              className="px-5 py-2.5 rounded-xl bg-sky-700 hover:bg-sky-600 text-white text-xs sm:text-sm font-extrabold flex items-center gap-1.5 cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              <span>Aktifkan Kunci Mekanik</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
