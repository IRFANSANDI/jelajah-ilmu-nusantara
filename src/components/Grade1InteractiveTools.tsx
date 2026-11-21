import { useEffect, useRef, useState } from 'react';
import {
  CheckCircle2,
  Eraser,
  Music,
  Palette,
  RotateCcw,
  Save,
  Sparkles,
  Trash2,
  Undo2,
  Volume2,
  X,
} from 'lucide-react';
import {
  LOCAL_REGIONS,
  LocalRegionId,
  RELIGIONS,
  ReligionId,
  SubjectId,
} from '../game3d/inventoryData';
import {
  Grade1BagState,
  Grade1LabKind,
  LOCAL_REGION_WORLD_META,
  RELIGION_SANCTUARY_META,
} from '../game3d/grade1SubjectWorlds';
import { sound3d } from '../game3d/sound3d';

interface Grade1LabModalProps {
  labKind: Grade1LabKind;
  subjectId: SubjectId;
  chapterNumber?: number;
  chapterTitle?: string;
  activityMode?: string;
  religion: ReligionId;
  localRegion: LocalRegionId;
  bag: Grade1BagState;
  playerCoins?: number;
  onClose: () => void;
  onSelectReligion?: (religion: ReligionId) => void;
  onSelectLocalRegion?: (region: LocalRegionId) => void;
  onSaveArtwork?: (title: string, dataUrl: string) => void;
  onReward: (coins: number, score: number, xp: number, noticeMsg: string) => void;
  onEarnOrSpendCoins?: (deltaCoins: number, deltaXp: number, message: string) => void;
  onTriggerHeroPose?: (pose: 'jump-jack' | 'balance' | 'stretch' | 'march') => void;
  onStartCombinedExam?: () => void;
  onMutateBag: (
    kind:
      | 'eat-fruit'
      | 'word-done'
      | 'color-mixed'
      | 'cube-done'
      | 'english-done'
      | 'shape-color-sorted'
      | 'sentence-built'
      | 'market-purchased'
      | 'sell-good-fruits'
  ) => void;
}

// =========================================================================
// 1. INTERACTIVE 3D FOLDING CUBE & BALOK NET VISUALIZER (60fps CSS 3D)
// =========================================================================
function CubeFoldingLab({
  onInspectComplete,
}: {
  onInspectComplete: () => void;
}) {
  const [foldPct, setFoldPct] = useState(100);
  const [shapeMode, setShapeMode] = useState<'kubus' | 'balok'>('kubus');
  const [rotX, setRotX] = useState(-24);
  const [rotY, setRotY] = useState(34);
  const [highlightPart, setHighlightPart] = useState<'sisi' | 'rusuk' | 'sudut'>('sisi');
  const [notifiedFold, setNotifiedFold] = useState(false);
  const dragRef = useRef<{ x: number; y: number } | null>(null);

  const angle = (foldPct / 100) * 90;
  const w = shapeMode === 'kubus' ? 84 : 112;
  const h = 84;
  const d = 84;

  useEffect(() => {
    if (foldPct <= 10 && !notifiedFold) {
      setNotifiedFold(true);
      onInspectComplete();
    }
  }, [foldPct, notifiedFold, onInspectComplete]);

  const faceStyleBase =
    'absolute flex flex-col items-center justify-center font-extrabold text-[11px] select-none transition-shadow';
  const borderHighlight =
    highlightPart === 'rusuk'
      ? 'border-[3px] border-amber-400'
      : highlightPart === 'sudut'
      ? 'border-2 border-rose-400'
      : 'border-2 border-white/90';

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShapeMode('kubus')}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold cursor-pointer ${
              shapeMode === 'kubus'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            Kubus (Sama Sisi)
          </button>
          <button
            type="button"
            onClick={() => setShapeMode('balok')}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold cursor-pointer ${
              shapeMode === 'balok'
                ? 'bg-sky-600 text-white'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            Balok (Panjang)
          </button>
        </div>

        <div className="flex items-center gap-1">
          {(['sisi', 'rusuk', 'sudut'] as const).map((part) => (
            <button
              key={part}
              type="button"
              onClick={() => setHighlightPart(part)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                highlightPart === part
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {part === 'sisi' ? '6 Sisi' : part === 'rusuk' ? '12 Rusuk' : '8 Titik Sudut'}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive 3D Viewport */}
      <div
        onPointerDown={(e) => {
          dragRef.current = { x: e.clientX, y: e.clientY };
        }}
        onPointerMove={(e) => {
          if (!dragRef.current) return;
          const dx = e.clientX - dragRef.current.x;
          const dy = e.clientY - dragRef.current.y;
          dragRef.current = { x: e.clientX, y: e.clientY };
          setRotY((y) => y + dx * 0.6);
          setRotX((x) => Math.max(-75, Math.min(75, x - dy * 0.6)));
        }}
        onPointerUp={() => {
          dragRef.current = null;
        }}
        onPointerLeave={() => {
          dragRef.current = null;
        }}
        className="w-full h-64 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing relative touch-none"
        style={{ perspective: '760px' }}
      >
        <p className="absolute top-2.5 left-3 text-[10px] font-bold text-slate-300 pointer-events-none">
          Seret area ini untuk memutar 3D · Geser slider di bawah untuk melipat jaring-jaring!
        </p>

        {/* Base Face (Alas) rotated in 3D space */}
        <div
          style={{
            width: `${w}px`,
            height: `${d}px`,
            transformStyle: 'preserve-3d',
            transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)`,
            position: 'relative',
          }}
        >
          {/* 1. ALAS */}
          <div
            className={`${faceStyleBase} ${borderHighlight} bg-emerald-500/85 text-white`}
            style={{ width: `${w}px`, height: `${d}px` }}
          >
            <span>Alas (1)</span>
          </div>

          {/* 2. KIRI */}
          <div
            className={`${faceStyleBase} ${borderHighlight} bg-sky-500/85 text-white`}
            style={{
              width: `${h}px`,
              height: `${d}px`,
              left: `${-h}px`,
              top: '0px',
              transformOrigin: 'right center',
              transform: `rotateY(${angle}deg)`,
            }}
          >
            <span>Kiri (2)</span>
          </div>

          {/* 3. KANAN */}
          <div
            className={`${faceStyleBase} ${borderHighlight} bg-indigo-500/85 text-white`}
            style={{
              width: `${h}px`,
              height: `${d}px`,
              left: `${w}px`,
              top: '0px',
              transformOrigin: 'left center',
              transform: `rotateY(${-angle}deg)`,
            }}
          >
            <span>Kanan (3)</span>
          </div>

          {/* 4. BELAKANG (Atas di jaring) */}
          <div
            className={`${faceStyleBase} ${borderHighlight} bg-amber-500/85 text-slate-950`}
            style={{
              width: `${w}px`,
              height: `${h}px`,
              left: '0px',
              top: `${-h}px`,
              transformOrigin: 'bottom center',
              transform: `rotateX(${-angle}deg)`,
            }}
          >
            <span>Belakang (4)</span>

            {/* 5. TUTUP (hinged to top edge of Belakang) */}
            <div
              className={`${faceStyleBase} ${borderHighlight} bg-purple-500/85 text-white`}
              style={{
                width: `${w}px`,
                height: `${d}px`,
                left: '0px',
                top: `${-d}px`,
                transformOrigin: 'bottom center',
                transform: `rotateX(${-angle}deg)`,
              }}
            >
              <span>Tutup (5)</span>
            </div>
          </div>

          {/* 6. DEPAN (Bawah di jaring) */}
          <div
            className={`${faceStyleBase} ${borderHighlight} bg-rose-500/85 text-white`}
            style={{
              width: `${w}px`,
              height: `${h}px`,
              left: '0px',
              top: `${d}px`,
              transformOrigin: 'top center',
              transform: `rotateX(${angle}deg)`,
            }}
          >
            <span>Depan (6)</span>
          </div>
        </div>
      </div>

      {/* Slider Control */}
      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-800">
          <span>Jaring Terbuka (0%)</span>
          <span className="font-mono text-emerald-700">Lipat: {foldPct}%</span>
          <span>Bangun 3D Utuh (100%)</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={foldPct}
          onChange={(e) => setFoldPct(Number(e.target.value))}
          className="w-full accent-emerald-600 cursor-pointer"
        />
        <div className="flex items-center justify-between gap-2 text-[11px] text-slate-600">
          <span>
            {highlightPart === 'sisi'
              ? 'Bidang datar pembatas kubus/balok berjumlah 6 buah sisi.'
              : highlightPart === 'rusuk'
              ? 'Garis pertemuan dua sisi berjumlah 12 rusuk lurus.'
              : 'Pojok pertemuan tiga rusuk berjumlah 8 titik sudut.'}
          </span>
          <button
            type="button"
            onClick={() => {
              setFoldPct(foldPct > 50 ? 0 : 100);
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-900 text-white font-bold shrink-0 cursor-pointer"
          >
            {foldPct > 50 ? 'Buka Jaring' : 'Lipat Kubus'}
          </button>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// 2. HTML5 CANVAS DRAWING STUDIO -> DISPLAYS ON 3D GALLERY EASELS
// =========================================================================
function DrawingCanvasStudio({
  onSaveArtwork,
}: {
  onSaveArtwork?: (title: string, dataUrl: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [color, setColor] = useState('#ef4444');
  const [brushSize, setBrushSize] = useState(8);
  const [tool, setTool] = useState<'brush' | 'eraser' | 'circle' | 'square' | 'star'>('brush');
  const [title, setTitle] = useState('Lukisan Ceria');
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const drawingRef = useRef(false);
  const historyRef = useRef<string[]>([]);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#fffbeb';
    ctx.fillRect(0, 0, c.width, c.height);
    historyRef.current = [c.toDataURL('image/png')];
  }, []);

  const pushHistory = () => {
    const c = canvasRef.current;
    if (!c) return;
    historyRef.current.push(c.toDataURL('image/png'));
    if (historyRef.current.length > 15) historyRef.current.shift();
  };

  const handleUndo = () => {
    if (historyRef.current.length <= 1) return;
    historyRef.current.pop();
    const prev = historyRef.current[historyRef.current.length - 1];
    const c = canvasRef.current;
    const ctx = c?.getContext('2d');
    if (!c || !ctx || !prev) return;
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = prev;
  };

  const getCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const c = canvasRef.current!;
    const rect = c.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * c.width,
      y: ((e.clientY - rect.top) / rect.height) * c.height,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const c = canvasRef.current;
    const ctx = c?.getContext('2d');
    if (!c || !ctx) return;
    const { x, y } = getCoords(e);

    if (tool === 'circle' || tool === 'square' || tool === 'star') {
      ctx.fillStyle = color;
      if (tool === 'circle') {
        ctx.beginPath();
        ctx.arc(x, y, brushSize * 2.4, 0, Math.PI * 2);
        ctx.fill();
      } else if (tool === 'square') {
        const s = brushSize * 4;
        ctx.fillRect(x - s / 2, y - s / 2, s, s);
      } else {
        ctx.beginPath();
        for (let i = 0; i < 10; i++) {
          const r = i % 2 === 0 ? brushSize * 2.8 : brushSize * 1.2;
          const a = (i * Math.PI) / 5 - Math.PI / 2;
          if (i === 0) ctx.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
          else ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
        }
        ctx.closePath();
        ctx.fill();
      }
      pushHistory();
      return;
    }

    drawingRef.current = true;
    ctx.strokeStyle = tool === 'eraser' ? '#fffbeb' : color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const { x, y } = getCoords(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handlePointerUp = () => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    pushHistory();
  };

  const handleClear = () => {
    const c = canvasRef.current;
    const ctx = c?.getContext('2d');
    if (!c || !ctx) return;
    ctx.fillStyle = '#fffbeb';
    ctx.fillRect(0, 0, c.width, c.height);
    pushHistory();
  };

  const handleSave = () => {
    const c = canvasRef.current;
    if (!c || !onSaveArtwork) return;
    const dataUrl = c.toDataURL('image/png');
    onSaveArtwork(title.trim() || 'Lukisan Ceria', dataUrl);
    sound3d.playMissionComplete();
    setSavedNotice('Lukisan tersimpan dan langsung dipajang di Kanvas Galeri 3D!');
  };

  const colors = ['#ef4444', '#facc15', '#2563eb', '#16a34a', '#f97316', '#9333ea', '#0f172a'];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {colors.map((cHex) => (
            <button
              key={cHex}
              type="button"
              onClick={() => {
                setColor(cHex);
                if (tool === 'eraser') setTool('brush');
              }}
              aria-label={`Warna ${cHex}`}
              className={`w-7 h-7 rounded-full border-2 cursor-pointer ${
                color === cHex && tool !== 'eraser'
                  ? 'border-slate-900 scale-110'
                  : 'border-white shadow'
              }`}
              style={{ backgroundColor: cHex }}
            />
          ))}
          <button
            type="button"
            onClick={() => setTool('eraser')}
            className={`px-2 py-1 rounded-lg border text-xs font-bold flex items-center gap-1 cursor-pointer ${
              tool === 'eraser' ? 'bg-slate-900 text-white' : 'bg-white text-slate-700'
            }`}
          >
            <Eraser className="w-3.5 h-3.5" />
            <span>Hapus</span>
          </button>
        </div>

        <div className="flex items-center gap-1">
          {(
            [
              ['brush', 'Kuas'],
              ['circle', '● Lingkaran'],
              ['square', '■ Kotak'],
              ['star', '★ Bintang'],
            ] as const
          ).map(([tId, tLabel]) => (
            <button
              key={tId}
              type="button"
              onClick={() => setTool(tId)}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                tool === tId ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              {tLabel}
            </button>
          ))}
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={480}
        height={280}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="w-full h-56 rounded-xl border-2 border-purple-200 bg-amber-50 cursor-crosshair touch-none"
      />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700">Ukuran:</span>
          {[4, 8, 16].map((sz) => (
            <button
              key={sz}
              type="button"
              onClick={() => setBrushSize(sz)}
              className={`px-2 py-1 rounded text-xs font-bold cursor-pointer ${
                brushSize === sz ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              {sz === 4 ? 'Kecil' : sz === 8 ? 'Sedang' : 'Besar'}
            </button>
          ))}
          <button
            type="button"
            onClick={handleUndo}
            className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span>Undo</span>
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Bersihkan</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={24}
            placeholder="Judul Karya"
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold w-36"
          />
          <button
            type="button"
            onClick={handleSave}
            className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Pajang di Galeri 3D</span>
          </button>
        </div>
      </div>

      {savedNotice && (
        <p className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
          {savedNotice}
        </p>
      )}
    </div>
  );
}

// =========================================================================
// 3. PLAYABLE 8-NOTE MUSICAL INSTRUMENT + BERNYANYI BERSAMA FOLLOW MODE
// =========================================================================
const SING_ALONG_SONGS = [
  {
    id: 'pelangi',
    title: 'Pelangi-Pelangi',
    notes: [2, 2, 1, 0, 2, 4, 4, 5, 4, 2, 1, 0],
    lyrics: ['Pe', 'la', 'ngi', 'pe', 'la', 'ngi', 'a', 'lang', 'kah', 'in', 'dah', 'mu'],
  },
  {
    id: 'bintang',
    title: 'Bintang Kecil',
    notes: [4, 2, 1, 0, 4, 2, 1, 0, 2, 3, 4, 5, 4],
    lyrics: ['Bin', 'tang', 'ke', 'cil', 'di', 'la', 'ngit', 'yang', 'bi', 'ru', 'ti', 'ng', 'gi'],
  },
] as const;

function PlayableInstrumentPanel({
  defaultTimber = 'xylophone',
}: {
  defaultTimber?: 'xylophone' | 'angklung';
}) {
  const [timber, setTimber] = useState<'xylophone' | 'angklung'>(defaultTimber);
  const [singSongIdx, setSingSongIdx] = useState(0);
  const [singStep, setSingStep] = useState(0);
  const [singActive, setSingActive] = useState(false);

  const notes = [
    { idx: 0, label: 'Do', color: 'bg-rose-500' },
    { idx: 1, label: 'Re', color: 'bg-orange-500' },
    { idx: 2, label: 'Mi', color: 'bg-amber-400 text-slate-950' },
    { idx: 3, label: 'Fa', color: 'bg-emerald-500' },
    { idx: 4, label: 'Sol', color: 'bg-cyan-500' },
    { idx: 5, label: 'La', color: 'bg-blue-600' },
    { idx: 6, label: 'Si', color: 'bg-violet-600' },
    { idx: 7, label: 'Do²', color: 'bg-pink-500' },
  ];

  const activeSong = SING_ALONG_SONGS[singSongIdx];
  const expectedNote = singActive ? activeSong.notes[singStep] : null;

  const playPattern = () => {
    activeSong.notes.forEach((n, i) => {
      window.setTimeout(() => sound3d.playInstrumentNote(n, timber), i * 260);
    });
  };

  const handlePressNote = (idx: number) => {
    sound3d.playInstrumentNote(idx, timber);
    if (!singActive) return;
    if (idx === expectedNote) {
      if (singStep + 1 >= activeSong.notes.length) {
        sound3d.playMissionComplete();
        setSingStep(0);
        setSingActive(false);
      } else {
        setSingStep((s) => s + 1);
      }
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setTimber('xylophone')}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold cursor-pointer ${
              timber === 'xylophone' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            Gambang Pelangi
          </button>
          <button
            type="button"
            onClick={() => setTimber('angklung')}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold cursor-pointer ${
              timber === 'angklung' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            Angklung Bambu
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={playPattern}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Music className="w-3.5 h-3.5" />
            <span>Dengar Lagu</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setSingActive((prev) => !prev);
              setSingStep(0);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold cursor-pointer ${
              singActive
                ? 'bg-emerald-600 text-white'
                : 'bg-amber-400 hover:bg-amber-300 text-slate-950'
            }`}
          >
            {singActive ? 'Bernyanyi Bersama Aktif' : 'Bernyanyi Bersama'}
          </button>
        </div>
      </div>

      {singActive && (
        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              {SING_ALONG_SONGS.map((song, idx) => (
                <button
                  key={song.id}
                  type="button"
                  onClick={() => {
                    setSingSongIdx(idx);
                    setSingStep(0);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold cursor-pointer ${
                    singSongIdx === idx
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-white border border-amber-200 text-slate-700'
                  }`}
                >
                  {song.title}
                </button>
              ))}
            </div>
            <span className="font-mono text-[11px] font-bold text-amber-900">
              Ketuk nada yang berkilau ({singStep + 1}/{activeSong.notes.length})
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {activeSong.lyrics.map((syl, idx) => (
              <span
                key={`${syl}-${idx}`}
                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  idx === singStep
                    ? 'bg-slate-900 text-amber-300'
                    : idx < singStep
                    ? 'bg-emerald-200 text-emerald-900'
                    : 'bg-white text-slate-500'
                }`}
              >
                {syl}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
        {notes.map((n) => {
          const isTarget = expectedNote === n.idx;
          return (
            <button
              key={n.idx}
              type="button"
              onClick={() => handlePressNote(n.idx)}
              className={`${n.color} h-24 rounded-xl text-white font-extrabold text-sm shadow active:scale-95 transition-transform flex flex-col items-center justify-end pb-2.5 cursor-pointer ${
                isTarget ? 'ring-4 ring-slate-900 -translate-y-1' : ''
              }`}
            >
              {isTarget && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-950/80 text-amber-300 mb-1">
                  Ketuk!
                </span>
              )}
              <span>{n.label}</span>
            </button>
          );
        })}
      </div>
      <p className="text-xs text-slate-600">
        {singActive
          ? `Ikuti lirik "${activeSong.title}" dengan menekan bilah nada bertanda Ketuk!`
          : 'Panduan melodi sederhana: Mi - Mi - Mi - Re - Do · Sol - Mi - Re - Do'}
      </p>
    </div>
  );
}

// =========================================================================
// 4. SHAPE & COLOR SORTING LAB (GRADE 1)
// =========================================================================
const SHAPE_COLOR_CHALLENGES = [
  { id: 'sc-1', name: 'Lingkaran Merah', shape: 'circle', color: 'merah', hex: '#EF4444' },
  { id: 'sc-2', name: 'Persegi Biru', shape: 'square', color: 'biru', hex: '#2563EB' },
  { id: 'sc-3', name: 'Segitiga Kuning', shape: 'triangle', color: 'kuning', hex: '#FACC15' },
  { id: 'sc-4', name: 'Kubus Hijau', shape: 'cube', color: 'hijau', hex: '#16A34A' },
  { id: 'sc-5', name: 'Bola Kuning', shape: 'sphere', color: 'kuning', hex: '#EAB308' },
] as const;

function ShapeColorSortingLab({
  sortedCount,
  onSortedSuccess,
}: {
  sortedCount: number;
  onSortedSuccess: (label: string) => void;
}) {
  const [challengeIdx, setChallengeIdx] = useState(0);
  const [pickedColor, setPickedColor] = useState<string>('merah');
  const [pickedShape, setPickedShape] = useState<string>('circle');
  const [feedback, setFeedback] = useState<string | null>(null);

  const item = SHAPE_COLOR_CHALLENGES[challengeIdx % SHAPE_COLOR_CHALLENGES.length];

  const handleCheck = () => {
    if (pickedColor === item.color && pickedShape === item.shape) {
      sound3d.playSortSuccess();
      onSortedSuccess(item.name);
      setFeedback(`Benar! ${item.name} berhasil disortir ke kotak yang tepat!`);
      setChallengeIdx((i) => (i + 1) % SHAPE_COLOR_CHALLENGES.length);
    } else {
      sound3d.playAlertCue();
      setFeedback(
        `Belum tepat! Perhatikan bentuk dan warna target (${item.name}), lalu coba lagi.`
      );
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-3 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-between gap-2 text-xs">
        <span className="font-bold text-cyan-950">
          Cocokkan warna dan bentuk benda di bawah ini!
        </span>
        <span className="font-mono font-extrabold text-cyan-700">
          Tersortir: {sortedCount}
        </span>
      </div>

      <div className="p-5 rounded-2xl bg-slate-900 text-white flex flex-col items-center justify-center gap-3">
        <p className="text-[11px] font-bold text-amber-300 uppercase">
          Benda Target #{(challengeIdx % SHAPE_COLOR_CHALLENGES.length) + 1}
        </p>
        <svg width="92" height="92" viewBox="0 0 100 100" aria-label={item.name}>
          {item.shape === 'circle' && (
            <circle cx="50" cy="50" r="36" fill={item.hex} stroke="#ffffff" strokeWidth="4" />
          )}
          {item.shape === 'square' && (
            <rect x="16" y="16" width="68" height="68" rx="8" fill={item.hex} stroke="#ffffff" strokeWidth="4" />
          )}
          {item.shape === 'triangle' && (
            <polygon points="50,14 86,84 14,84" fill={item.hex} stroke="#ffffff" strokeWidth="4" />
          )}
          {item.shape === 'cube' && (
            <g stroke="#ffffff" strokeWidth="3">
              <polygon points="50,12 84,30 50,48 16,30" fill={item.hex} />
              <polygon points="16,30 50,48 50,86 16,68" fill={item.hex} opacity="0.85" />
              <polygon points="84,30 50,48 50,86 84,68" fill={item.hex} opacity="0.68" />
            </g>
          )}
          {item.shape === 'sphere' && (
            <g>
              <circle cx="50" cy="50" r="36" fill={item.hex} stroke="#ffffff" strokeWidth="4" />
              <ellipse cx="40" cy="36" rx="12" ry="7" fill="#ffffff" opacity="0.35" />
            </g>
          )}
        </svg>
        <p className="font-display text-lg font-extrabold">{item.name}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <p className="text-xs font-extrabold text-slate-800">1. Pilih Warna</p>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { id: 'merah', label: 'Merah', dot: 'bg-red-500' },
              { id: 'kuning', label: 'Kuning', dot: 'bg-yellow-400' },
              { id: 'biru', label: 'Biru', dot: 'bg-blue-600' },
              { id: 'hijau', label: 'Hijau', dot: 'bg-green-600' },
            ].map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setPickedColor(c.id)}
                className={`px-2.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer border ${
                  pickedColor === c.id
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-800 border-slate-200'
                }`}
              >
                <span className={`w-3.5 h-3.5 rounded-full ${c.dot} shrink-0`} />
                <span>{c.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <p className="text-xs font-extrabold text-slate-800">2. Pilih Bentuk</p>
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'circle', label: 'Lingkaran' },
              { id: 'square', label: 'Persegi' },
              { id: 'triangle', label: 'Segitiga' },
              { id: 'cube', label: 'Kubus' },
              { id: 'sphere', label: 'Bola' },
            ].map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setPickedShape(s.id)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer border ${
                  pickedShape === s.id
                    ? 'bg-cyan-600 text-white border-cyan-600'
                    : 'bg-white text-slate-800 border-slate-200'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={handleCheck}
        className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs cursor-pointer"
      >
        Cocokkan Bentuk & Warna!
      </button>

      {feedback && (
        <p className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-bold text-slate-800">
          {feedback}
        </p>
      )}
    </div>
  );
}

// =========================================================================
// 5. WORD-TO-SENTENCE BUILDER LAB (GRADE 1)
// =========================================================================
const SENTENCE_SETS = [
  {
    target: ['Budi', 'membeli', 'lima', 'apel'],
    tiles: ['lima', 'Budi', 'apel', 'membeli'],
    meaning: 'Kalimat cerita belanja buah di Pasar Sahabat.',
  },
  {
    target: ['Siti', 'menyiram', 'bunga', 'merah'],
    tiles: ['bunga', 'menyiram', 'merah', 'Siti'],
    meaning: 'Kalimat merawat tanaman di Kebun Pengetahuan.',
  },
  {
    target: ['Ibu', 'guru', 'membaca', 'buku'],
    tiles: ['buku', 'membaca', 'Ibu', 'guru'],
    meaning: 'Kalimat belajar bersama di Perpustakaan Ceria.',
  },
];

function SentenceBuilderLab({
  builtCount,
  onSentenceComplete,
}: {
  builtCount: number;
  onSentenceComplete: (sentence: string) => void;
}) {
  const [setIdx, setSetIdx] = useState(0);
  const [chosenIndices, setChosenIndices] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);

  const puzzle = SENTENCE_SETS[setIdx % SENTENCE_SETS.length];
  const assembledWords = chosenIndices.map((i) => puzzle.tiles[i]);

  const handleToggleTile = (tileIdx: number) => {
    setFeedback(null);
    if (chosenIndices.includes(tileIdx)) {
      setChosenIndices((prev) => prev.filter((i) => i !== tileIdx));
    } else {
      setChosenIndices((prev) => [...prev, tileIdx]);
    }
  };

  const handleVerify = () => {
    const joined = assembledWords.join(' ');
    const expected = puzzle.target.join(' ');
    if (joined === expected) {
      sound3d.playMissionComplete();
      onSentenceComplete(expected);
      setFeedback(`Hebat! Kalimat "${expected}." tersusun benar! (${puzzle.meaning})`);
      setChosenIndices([]);
      setSetIdx((i) => (i + 1) % SENTENCE_SETS.length);
    } else {
      sound3d.playAlertCue();
      setFeedback(
        `Susunan saat ini: "${joined || '...'}". Coba susun menjadi kalimat yang runtut!`
      );
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-between text-xs">
        <span className="font-bold text-sky-950">
          Susun kartu kata menjadi kalimat lengkap yang benar!
        </span>
        <span className="font-mono font-extrabold text-sky-700">
          Kalimat: {builtCount}
        </span>
      </div>

      <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2 min-h-[84px]">
        <p className="text-[11px] font-bold text-amber-300">Hasil Susunan Kalimat:</p>
        <p className="font-display text-lg sm:text-xl font-extrabold min-h-[28px]">
          {assembledWords.length > 0 ? `${assembledWords.join(' ')}.` : 'Ketuk kata di bawah berurutan...'}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {puzzle.tiles.map((word, idx) => {
          const picked = chosenIndices.includes(idx);
          return (
            <button
              key={`${word}-${idx}`}
              type="button"
              onClick={() => handleToggleTile(idx)}
              className={`px-4 py-2.5 rounded-xl font-extrabold text-sm border cursor-pointer transition-colors ${
                picked
                  ? 'bg-amber-400 border-amber-500 text-slate-950'
                  : 'bg-white border-slate-300 hover:border-sky-500 text-slate-900'
              }`}
            >
              {word}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setChosenIndices([]);
            setFeedback(null);
          }}
          className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Ulang</span>
        </button>
        <button
          type="button"
          disabled={assembledWords.length < puzzle.target.length}
          onClick={handleVerify}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold cursor-pointer ${
            assembledWords.length === puzzle.target.length
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
              : 'bg-slate-200 text-slate-500 cursor-not-allowed'
          }`}
        >
          Periksa Kalimat
        </button>
      </div>

      {feedback && (
        <p className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-bold text-slate-800">
          {feedback}
        </p>
      )}
    </div>
  );
}

// =========================================================================
// 6. MARKET SHOPPING, SELLING FRUITS & RUPIAH COIN MATH LAB
// =========================================================================
const MARKET_CATALOG = [
  { id: 'apel', name: 'Apel Segar', priceRp: 500, coinCost: 5, emoji: '🍎' },
  { id: 'pensil', name: 'Pensil Warna', priceRp: 1000, coinCost: 10, emoji: '✏️' },
  { id: 'buku', name: 'Buku Tulis', priceRp: 2000, coinCost: 20, emoji: '📘' },
  { id: 'tas', name: 'Tas Sekolah', priceRp: 5000, coinCost: 40, emoji: '🎒' },
] as const;

const RUPIAH_COINS = [100, 200, 500, 1000, 2000, 5000] as const;

function MarketMoneyShopLab({
  goodFruits,
  marketPurchases,
  playerCoins,
  onSellFruits,
  onPurchaseSuccess,
}: {
  goodFruits: number;
  marketPurchases: number;
  playerCoins: number;
  onSellFruits: (fruitsCount: number, earnedCoins: number) => void;
  onPurchaseSuccess: (itemName: string, changeRp: number, coinDelta: number) => void;
}) {
  const [selectedItemIdx, setSelectedItemIdx] = useState(0);
  const [paidRp, setPaidRp] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);

  const item = MARKET_CATALOG[selectedItemIdx];
  const isEnoughRp = paidRp >= item.priceRp;
  const changeRp = Math.max(0, paidRp - item.priceRp);

  const handleCheckout = () => {
    if (!isEnoughRp) {
      sound3d.playAlertCue();
      setFeedback(
        `Uang Rupiah belum cukup! Harga ${item.name} Rp ${item.priceRp.toLocaleString('id-ID')}, kamu baru membayar Rp ${paidRp.toLocaleString('id-ID')}.`
      );
      return;
    }
    if (playerCoins < item.coinCost) {
      sound3d.playAlertCue();
      setFeedback(
        `Koin Ilmumu (${playerCoins}) kurang untuk membeli ${item.name} (${item.coinCost} Koin). Jual buah panen atau selesaikan misi dulu!`
      );
      return;
    }
    sound3d.playCashRegister();
    onPurchaseSuccess(item.name, changeRp, -item.coinCost);
    setFeedback(
      changeRp > 0
        ? `Berhasil membeli ${item.name}! Kembalianmu: Rp ${changeRp.toLocaleString('id-ID')}. (+20 XP)`
        : `Berhasil membeli ${item.name} dengan uang pas Rp ${item.priceRp.toLocaleString('id-ID')}! (+20 XP)`
    );
    setPaidRp(0);
  };

  return (
    <div className="space-y-4">
      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div>
          <p className="font-extrabold text-amber-950">
            Dompet Koinmu: {playerCoins} Koin · Buah Segar di Tas: {goodFruits} · Transaksi: {marketPurchases}
          </p>
          <p className="text-amber-800">
            Jual buah segar hasil kebun atau bayar barang belanja memakai pecahan Rupiah!
          </p>
        </div>
        <button
          type="button"
          disabled={goodFruits <= 0}
          onClick={() => {
            const earned = goodFruits * 6;
            onSellFruits(goodFruits, earned);
            setFeedback(
              `Berhasil menjual ${goodFruits} buah segar ke Pasar Sahabat! (+${earned} Koin, +15 XP)`
            );
          }}
          className={`px-3.5 py-2 rounded-xl font-extrabold text-xs cursor-pointer ${
            goodFruits > 0
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
              : 'bg-slate-200 text-slate-500 cursor-not-allowed'
          }`}
        >
          Jual Semua Buah ({goodFruits} × 6 Koin)
        </button>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-extrabold text-slate-800">1. Pilih Barang Belanja</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {MARKET_CATALOG.map((it, idx) => (
            <button
              key={it.id}
              type="button"
              onClick={() => {
                setSelectedItemIdx(idx);
                setPaidRp(0);
                setFeedback(null);
              }}
              className={`p-2.5 rounded-xl border text-left cursor-pointer ${
                selectedItemIdx === idx
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white border-slate-200 hover:border-amber-400 text-slate-900'
              }`}
            >
              <span className="text-xl">{it.emoji}</span>
              <p className="font-extrabold text-xs mt-1">{it.name}</p>
              <p className={`text-[11px] font-mono ${selectedItemIdx === idx ? 'text-amber-300' : 'text-amber-700'}`}>
                Rp {it.priceRp.toLocaleString('id-ID')} ({it.coinCost} Koin)
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-extrabold text-slate-800">
            2. Klik Koin/Uang Kertas Rupiah untuk Membayar
          </p>
          <button
            type="button"
            onClick={() => setPaidRp(0)}
            className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
          >
            Kosongkan Uang
          </button>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
          {RUPIAH_COINS.map((nominal) => (
            <button
              key={nominal}
              type="button"
              onClick={() => {
                sound3d.playCoin();
                setPaidRp((p) => p + nominal);
              }}
              className="py-2 px-2 rounded-xl bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-950 font-mono font-extrabold text-xs cursor-pointer"
            >
              +Rp {nominal.toLocaleString('id-ID')}
            </button>
          ))}
        </div>
      </div>

      <div className="p-3.5 rounded-xl bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs space-y-0.5">
          <p className="text-slate-300">
            Harga {item.name}: <strong className="text-white">Rp {item.priceRp.toLocaleString('id-ID')}</strong>
          </p>
          <p className="text-amber-300 font-mono font-extrabold">
            Uang Dibayar: Rp {paidRp.toLocaleString('id-ID')} · Kembalian: Rp {changeRp.toLocaleString('id-ID')}
          </p>
        </div>
        <button
          type="button"
          onClick={handleCheckout}
          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs cursor-pointer"
        >
          Bayar Sekarang
        </button>
      </div>

      {feedback && (
        <p className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-bold text-slate-800">
          {feedback}
        </p>
      )}
    </div>
  );
}

// =========================================================================
// 7. PJOK 3D BODY MOTION COACH LAB
// =========================================================================
const PJOK_MOVES: Array<{
  id: 'jump-jack' | 'balance' | 'stretch' | 'march';
  title: string;
  desc: string;
}> = [
  { id: 'jump-jack', title: 'Lompat Bintang', desc: 'Buka tangan dan kaki sambil melompat ceria!' },
  { id: 'balance', title: 'Sikap Bangau Seimbang', desc: 'Rentangkan tangan dan angkat satu kaki dengan tenang.' },
  { id: 'stretch', title: 'Peregangan Tangan', desc: 'Angkat kedua lengan tinggi ke langit untuk melemaskan otot.' },
  { id: 'march', title: 'Jalan di Tempat', desc: 'Ayunkan lengan dan lutut bergantian mengikuti hitungan 1–8.' },
];

function PjokMotionCoachLab({
  posesDone,
  onTriggerPose,
}: {
  posesDone: number;
  onTriggerPose: (pose: 'jump-jack' | 'balance' | 'stretch' | 'march', title: string) => void;
}) {
  const [lastMove, setLastMove] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <div className="p-3 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-between text-xs">
        <span className="font-bold text-orange-950">
          Klik salah satu gerakan di bawah untuk menggerakkan karakter 3D!
        </span>
        <span className="font-mono font-extrabold text-orange-700">
          Gerakan: {posesDone}x
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {PJOK_MOVES.map((mv) => (
          <button
            key={mv.id}
            type="button"
            onClick={() => {
              onTriggerPose(mv.id, mv.title);
              setLastMove(`Karakter 3D sedang melakukan gerakan "${mv.title}"! (+5 Koin, +10 XP)`);
            }}
            className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
              lastMove?.includes(mv.title)
                ? 'bg-orange-600 text-white border-orange-700'
                : 'bg-white border-slate-200 hover:border-orange-400 text-slate-900'
            }`}
          >
            <p className="font-extrabold text-xs">{mv.title}</p>
            <p
              className={`text-[11px] mt-0.5 ${
                lastMove?.includes(mv.title) ? 'text-orange-100' : 'text-slate-600'
              }`}
            >
              {mv.desc}
            </p>
          </button>
        ))}
      </div>

      {lastMove && (
        <p className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-900">
          {lastMove}
        </p>
      )}
    </div>
  );
}

// =========================================================================
// MAIN MODAL DISPATCHER FOR ALL 9 SUBJECT LABS
// =========================================================================
export function Grade1InteractiveLabModal({
  labKind,
  subjectId,
  chapterNumber,
  chapterTitle,
  activityMode,
  religion,
  localRegion,
  bag,
  playerCoins = 0,
  onClose,
  onSelectReligion,
  onSelectLocalRegion,
  onSaveArtwork,
  onReward,
  onEarnOrSpendCoins,
  onTriggerHeroPose,
  onStartCombinedExam,
  onMutateBag,
}: Grade1LabModalProps) {
  const [seniTab, setSeniTab] = useState<'lukis' | 'musik'>('lukis');
  const [wordPick, setWordPick] = useState<[string, string]>(['bo', 'la']);
  const [wordFeedback, setWordFeedback] = useState<string | null>(null);
  const [englishHeardSet, setEnglishHeardSet] = useState<string[]>([]);
  const [matterClassified, setMatterClassified] = useState<Record<string, 'padat' | 'cair'>>({});
  const [lampOn, setLampOn] = useState(false);
  const [scalePick, setScalePick] = useState<'semangka' | 'pensil' | null>(null);
  const [ruleChecked, setRuleChecked] = useState<string[]>([]);

  const relMeta = RELIGION_SANCTUARY_META[religion];
  const regMeta = LOCAL_REGION_WORLD_META[localRegion];

  return (
    <div
      className="absolute inset-0 z-30 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-300 shrink-0" />
            <div>
              <p className="text-[10px] font-bold text-amber-300 uppercase">
                Aktivitas Praktik Interaktif Kelas 1
              </p>
              <h2 className="font-display text-base sm:text-lg font-extrabold">
                {labKind === 'math-orchard-cube'
                  ? 'Kebun Buah Hitung & Kubus 3D'
                  : labKind === 'seni-studio-music'
                  ? 'Studio Gambar Kanvas & Alat Musik'
                  : labKind === 'english-voice-cards'
                  ? 'Kartu Suara Bahasa Inggris'
                  : labKind === 'word-builder'
                  ? 'Papan Rangkai Suku Kata'
                  : labKind === 'sentence-builder'
                  ? 'Papan Susun Kalimat Cerita'
                  : labKind === 'shape-color-sort'
                  ? 'Plaza Sortir Bentuk & Warna'
                  : labKind === 'market-money-shop'
                  ? 'Pasar Sahabat & Hitung Rupiah'
                  : labKind === 'pjok-motion-coach'
                  ? 'Pelatih Gerak Tubuh 3D'
                  : labKind === 'combined-exam'
                  ? 'Ujian Akhir Kelas 1 · Kerajaan Ilmu'
                  : labKind === 'pancasila-sort'
                  ? 'Lab Pilah Sampah & 5 Sila'
                  : labKind === 'ipas-nature-lab'
                  ? 'Jurnal Kebun Alam & Pancaindra'
                  : labKind === 'pjok-health-lab'
                  ? 'Catatan Gerak Sehat & Pelatih 3D'
                  : labKind === 'agama-practice'
                  ? `Bimbingan Agama: ${relMeta.sanctuaryName}`
                  : `Kampung Budaya: ${regMeta.regionName}`}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup Lab"
            className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {chapterTitle && (
            <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-extrabold text-slate-900">
                Fokus Bab {chapterNumber ?? 1}: {chapterTitle}
              </span>
              {activityMode && (
                <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-900 font-bold text-[11px]">
                  Lab Terarah
                </span>
              )}
            </div>
          )}

          {labKind === 'math-orchard-cube' && (
            <>
              {activityMode === 'measure-length-weight' && (
                <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 space-y-2">
                  <p className="font-extrabold text-sky-950">
                    Timbangan & Panjang Benda: Mana yang lebih BERAT antara Semangka dan Pensil?
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(['semangka', 'pensil'] as const).map((pick) => (
                      <button
                        key={pick}
                        type="button"
                        onClick={() => {
                          setScalePick(pick);
                          if (pick === 'semangka') {
                            onReward(5, 30, 10, 'Benar! Semangka lebih berat dari pensil.');
                          }
                        }}
                        className={`min-h-[40px] px-3.5 py-1.5 rounded-xl border text-xs font-extrabold cursor-pointer ${
                          scalePick === pick
                            ? pick === 'semangka'
                              ? 'bg-emerald-600 border-emerald-700 text-white'
                              : 'bg-rose-600 border-rose-700 text-white'
                            : 'bg-white border-sky-300 text-slate-800'
                        }`}
                      >
                        {pick === 'semangka' ? '🍉 Semangka Besar' : '✏️ Pensil Kayu'}
                      </button>
                    ))}
                  </div>
                  {scalePick && (
                    <p className="text-xs font-bold text-slate-800">
                      {scalePick === 'semangka'
                        ? 'Tepat! Buah semangka jauh lebih berat daripada pensil. Penggaris dipakai untuk mengukur panjang!'
                        : 'Coba pegang di tanganmu: pensil ringan sekali, semangka besar yang lebih berat!'}
                    </p>
                  )}
                </div>
              )}

              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-extrabold text-emerald-900">
                    Tas Panen Kebun: {bag.goodFruits} Buah Segar · {bag.rottenFruits} Buah Busuk · {bag.eatenFruits} Dimakan
                  </p>
                  <p className="text-xs text-emerald-800">
                    {activityMode === 'addition-orchard'
                      ? 'Hitung jumlah buah segar + buah di meja kebun untuk melatih penjumlahan!'
                      : activityMode === 'subtraction-orchard'
                      ? 'Coba makan 1 buah segar lalu amati pengurangan jumlah buah di tasmu!'
                      : 'Coba makan 1 buah segar atau putar jaring-jaring Kubus & Balok 3D di bawah!'}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={bag.goodFruits <= 0}
                  onClick={() => {
                    onMutateBag('eat-fruit');
                    onReward(2, 15, 5, 'Nyam! Kamu makan 1 buah segar. Jumlah buah berkurang 1!');
                  }}
                  className={`min-h-[40px] px-3.5 py-2 rounded-xl font-extrabold text-xs cursor-pointer ${
                    bag.goodFruits > 0
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  Makan 1 Buah (-1)
                </button>
              </div>
              <CubeFoldingLab
                onInspectComplete={() => {
                  onMutateBag('cube-done');
                  onReward(10, 60, 15, 'Hebat! Kamu membuka jaring-jaring 6 sisi Kubus & Balok 3D!');
                }}
              />
            </>
          )}

          {labKind === 'seni-studio-music' && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSeniTab('lukis')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer ${
                    seniTab === 'lukis' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  <Palette className="w-4 h-4" />
                  <span>Studio Gambar Kanvas</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSeniTab('musik')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer ${
                    seniTab === 'musik' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  <Music className="w-4 h-4" />
                  <span>Mainkan Alat Musik</span>
                </button>
              </div>

              {seniTab === 'lukis' ? (
                <DrawingCanvasStudio onSaveArtwork={onSaveArtwork} />
              ) : (
                <PlayableInstrumentPanel defaultTimber="xylophone" />
              )}
            </div>
          )}

          {labKind === 'english-voice-cards' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-600">
                Ketuk tombol speaker biru pada kartu kosakata Bab {chapterNumber ?? 1} untuk mendengar pengucapan Bahasa Inggrisnya!
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {(chapterNumber === 1
                  ? [
                      { en: 'Good Morning', id: 'Selamat Pagi', emoji: '☀️' },
                      { en: 'Thank You', id: 'Terima Kasih', emoji: '🙏' },
                      { en: 'One Two Three', id: 'Satu Dua Tiga', emoji: '🔢' },
                      { en: 'My Name Is', id: 'Nama Saya', emoji: '👋' },
                      { en: 'Five Books', id: 'Lima Buku', emoji: '📚' },
                      { en: 'Ten Stars', id: 'Sepuluh Bintang', emoji: '⭐' },
                    ]
                  : chapterNumber === 2
                  ? [
                      { en: 'Red Pencil', id: 'Pensil Merah', emoji: '✏️' },
                      { en: 'Yellow Bag', id: 'Tas Kuning', emoji: '🎒' },
                      { en: 'Blue Book', id: 'Buku Biru', emoji: '📘' },
                      { en: 'Green Table', id: 'Meja Hijau', emoji: '🪑' },
                      { en: 'White Eraser', id: 'Penghapus Putih', emoji: '🧽' },
                      { en: 'Ruler', id: 'Penggaris', emoji: '📏' },
                    ]
                  : chapterNumber === 3
                  ? [
                      { en: 'Mother', id: 'Ibu', emoji: '👩' },
                      { en: 'Father', id: 'Ayah', emoji: '👨' },
                      { en: 'Happy Cat', id: 'Kucing Ceria', emoji: '🐱' },
                      { en: 'Little Bird', id: 'Burung Kecil', emoji: '🐦' },
                      { en: 'Fish', id: 'Ikan', emoji: '🐟' },
                      { en: 'Sister', id: 'Saudara Perempuan', emoji: '👧' },
                    ]
                  : [
                      { en: 'Apple', id: 'Apel', emoji: '🍎' },
                      { en: 'Banana', id: 'Pisang', emoji: '🍌' },
                      { en: 'Orange', id: 'Jeruk', emoji: '🍊' },
                      { en: 'Jump', id: 'Lompat', emoji: '🤸' },
                      { en: 'Read a Book', id: 'Membaca Buku', emoji: '📖' },
                      { en: 'Water', id: 'Air Minum', emoji: '💧' },
                    ]
                ).map((card) => {
                  const heard = englishHeardSet.includes(card.en);
                  return (
                    <button
                      key={card.en}
                      type="button"
                      onClick={() => {
                        sound3d.speakEnglish(card.en);
                        if (!heard) {
                          setEnglishHeardSet((p) => [...p, card.en]);
                          onMutateBag('english-done');
                          onReward(4, 25, 8, `Speaking practice: "${card.en}" = ${card.id}!`);
                        }
                      }}
                      className={`p-3 rounded-xl border text-left space-y-1 cursor-pointer transition-colors ${
                        heard
                          ? 'bg-indigo-50 border-indigo-400'
                          : 'bg-white border-slate-200 hover:border-indigo-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xl">{card.emoji}</span>
                        <Volume2 className="w-4 h-4 text-indigo-600" />
                      </div>
                      <p className="font-extrabold text-slate-900">{card.en}</p>
                      <p className="text-xs text-slate-600">= {card.id}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {labKind === 'word-builder' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-700">
                Gabungkan <strong>Suku Kata Awal</strong> + <strong>Suku Kata Akhir</strong> menjadi kata benda yang bermakna!
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 space-y-2">
                  <p className="text-xs font-extrabold text-sky-900">1. Suku Kata Awal</p>
                  <div className="flex flex-wrap gap-1.5">
                    {['bo', 'bu', 'ba', 'ma', 'ro'].map((syl) => (
                      <button
                        key={syl}
                        type="button"
                        onClick={() => setWordPick([syl, wordPick[1]])}
                        className={`px-3 py-1.5 rounded-lg font-extrabold text-xs uppercase cursor-pointer ${
                          wordPick[0] === syl ? 'bg-sky-600 text-white' : 'bg-white border border-sky-200'
                        }`}
                      >
                        {syl}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
                  <p className="text-xs font-extrabold text-amber-900">2. Suku Kata Akhir</p>
                  <div className="flex flex-wrap gap-1.5">
                    {['la', 'ku', 'ju', 'ta', 'da'].map((syl) => (
                      <button
                        key={syl}
                        type="button"
                        onClick={() => setWordPick([wordPick[0], syl])}
                        className={`px-3 py-1.5 rounded-lg font-extrabold text-xs uppercase cursor-pointer ${
                          wordPick[1] === syl ? 'bg-amber-500 text-slate-950' : 'bg-white border border-amber-200'
                        }`}
                      >
                        {syl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 text-white flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] text-amber-300 font-bold">Gabungan Kata:</p>
                  <p className="font-display text-2xl font-extrabold tracking-wide uppercase">
                    {wordPick[0]} + {wordPick[1]} = {wordPick[0] + wordPick[1]}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const combined = wordPick[0] + wordPick[1];
                    const validWords: Record<string, string> = {
                      bola: 'BOLA dipakai bermain di lapangan!',
                      buku: 'BUKU sumber ilmu pengetahuan di perpustakaan!',
                      baju: 'BAJU seragam bersih dipakai ke sekolah!',
                      mata: 'MATA digunakan untuk melihat keindahan dunia!',
                      roda: 'RODA membantu sepeda melaju kencang!',
                      bata: 'BATA disusun rapi membangun dinding rumah!',
                      baku: 'BAKU berarti kata sesuai kaidah bahasa!',
                      kuda: 'Lihat — kalau ku + da menjadi KUDA! Ayo coba kata lainnya!',
                    };
                    if (validWords[combined]) {
                      sound3d.playMissionComplete();
                      onMutateBag('word-done');
                      onReward(8, 50, 12, `Kata "${combined.toUpperCase()}" terbentuk!`);
                      setWordFeedback(`Benar! ${validWords[combined]}`);
                    } else {
                      sound3d.playAlertCue();
                      setWordFeedback(
                        `Kata "${combined.toUpperCase()}" belum menjadi kata benda target. Coba gabungkan BO+LA, BU+KU, BA+JU, MA+TA, atau RO+DA!`
                      );
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs cursor-pointer"
                >
                  Cek Kata
                </button>
              </div>
              {wordFeedback && (
                <p className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-bold text-slate-800">
                  {wordFeedback}
                </p>
              )}
            </div>
          )}

          {labKind === 'pancasila-sort' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-950">
                <strong>Progres Kerja Bakti:</strong> {bag.trashCollected} sampah dipungut · {bag.trashSorted} sampah berhasil dipilah ke Tong Organik/Anorganik!
              </div>

              {activityMode === 'rules-harmony' && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
                  <p className="font-extrabold text-xs text-amber-950">
                    Ceklis Kebiasaan Tertib di Rumah & Sekolah:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      'Merapikan mainan & buku setelah belajar',
                      'Antre tertib dan ucapkan tolong/terima kasih',
                      'Membuang sampah pada tempatnya',
                      'Menghormati pendapat teman saat berdiskusi',
                    ].map((rule) => {
                      const done = ruleChecked.includes(rule);
                      return (
                        <button
                          key={rule}
                          type="button"
                          onClick={() => {
                            if (!done) {
                              setRuleChecked((p) => [...p, rule]);
                              onReward(3, 20, 6, `Sikap baik dicatat: ${rule}`);
                            }
                          }}
                          className={`p-2.5 rounded-xl border text-left text-xs font-bold cursor-pointer ${
                            done
                              ? 'bg-emerald-600 border-emerald-700 text-white'
                              : 'bg-white border-amber-300 text-slate-800'
                          }`}
                        >
                          {done ? '✓ ' : '○ '}
                          {rule}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  ['⭐ Sila 1 · Bintang Emas', 'Ketuhanan Yang Maha Esa'],
                  ['⛓️ Sila 2 · Rantai Baja', 'Kemanusiaan yang Adil dan Beradab'],
                  ['🌳 Sila 3 · Pohon Beringin', 'Persatuan Indonesia'],
                  ['🐃 Sila 4 · Kepala Banteng', 'Kerakyatan yang Dipimpin Hikmat Kebijaksanaan'],
                  ['🌾 Sila 5 · Padi dan Kapas', 'Keadilan Sosial bagi Seluruh Rakyat Indonesia'],
                ].map(([sila, desc]) => (
                  <div key={sila} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="font-extrabold text-slate-900 text-xs">{sila}</p>
                    <p className="text-[11px] text-slate-600">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {labKind === 'ipas-nature-lab' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-1">
                <p className="font-extrabold">
                  Status Kebun Alam: {bag.seedsPlanted}/3 Benih Bertunas · {bag.plantsBloomed}/3 Mekar · Zona Aman: {bag.inSafeZone ? 'TERLINDUNGI ✅' : 'Di Luar Zona Aman'}
                </p>
                <p>Siram petak tanaman dengan air sumur agar mekar, atau kunjungi Laboratorium Ilmuwan Muda untuk eksperimen benda & cahaya!</p>
              </div>

              {activityMode === 'matter-states' && (
                <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 space-y-2.5">
                  <p className="font-extrabold text-xs text-teal-950">
                    Eksperimen Benda Padat & Cair (Laboratorium Ilmuwan Muda):
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      { id: 'batu', label: '🪨 Batu Kayu / Balok', answer: 'padat' as const },
                      { id: 'air', label: '💧 Air di Gelas', answer: 'cair' as const },
                      { id: 'buku', label: '📘 Buku Tulis', answer: 'padat' as const },
                      { id: 'susu', label: '🥛 Susu Segar', answer: 'cair' as const },
                    ].map((obj) => {
                      const picked = matterClassified[obj.id];
                      const correct = picked === obj.answer;
                      return (
                        <div key={obj.id} className="p-2.5 rounded-xl bg-white border border-teal-200 space-y-1.5">
                          <p className="font-extrabold text-xs text-slate-900">{obj.label}</p>
                          <div className="flex gap-1.5">
                            {(['padat', 'cair'] as const).map((kind) => (
                              <button
                                key={kind}
                                type="button"
                                onClick={() => {
                                  setMatterClassified((prev) => ({ ...prev, [obj.id]: kind }));
                                  if (kind === obj.answer && picked !== obj.answer) {
                                    onReward(4, 25, 8, `Benar! ${obj.label} adalah benda ${obj.answer}!`);
                                  }
                                }}
                                className={`flex-1 py-1.5 rounded-lg text-[11px] font-extrabold cursor-pointer border ${
                                  picked === kind
                                    ? correct
                                      ? 'bg-emerald-600 text-white border-emerald-700'
                                      : 'bg-rose-600 text-white border-rose-700'
                                    : 'bg-slate-50 text-slate-700 border-slate-200'
                                }`}
                              >
                                Benda {kind === 'padat' ? 'Padat' : 'Cair'}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activityMode === 'light-energy' && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <p className="font-extrabold text-xs text-amber-950">
                      Uji Lampu & Hemat Listrik: {lampOn ? '💡 Lampu Menyala Terang!' : '🌑 Lampu Dimatikan (Hemat Listrik)'}
                    </p>
                    <p className="text-[11px] text-amber-900">
                      Cahaya membuat kita melihat benda & bayangan. Matikan lampu saat siang hari!
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !lampOn;
                      setLampOn(next);
                      onReward(3, 20, 6, next ? 'Lampu dinyalakan untuk melihat benda!' : 'Bagus! Mematikan lampu saat tidak dipakai menghemat listrik.');
                    }}
                    className={`min-h-[40px] px-4 py-2 rounded-xl text-xs font-extrabold cursor-pointer ${
                      lampOn ? 'bg-amber-400 text-slate-950' : 'bg-slate-900 text-white'
                    }`}
                  >
                    {lampOn ? 'Matikan Saklar' : 'Nyalakan Lampu'}
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  ['👀 Mata', 'Melihat benda & warna'],
                  ['👂 Telinga', 'Mendengar suara alam'],
                  ['👃 Hidung', 'Mencium aroma bunga'],
                  ['👅 Lidah', 'Mengecap rasa makanan'],
                  ['✋ Kulit', 'Meraba halus & dingin'],
                ].map(([indera, fn]) => (
                  <div key={indera} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="font-extrabold text-xs">{indera}</p>
                    <p className="text-[11px] text-slate-600">{fn}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {labKind === 'pjok-health-lab' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-orange-50 border border-orange-200 text-xs text-orange-950 space-y-1">
                <p className="font-extrabold">
                  Rekor Gerak Sehatmu: {bag.hurdlesJumped}/3 Gawang Dilompati · Titian Seimbang: {bag.balanceSuccess ? 'Lulus ✅' : 'Belum'} · Cuci Tangan: {bag.handWashed ? 'Bersih ✅' : 'Belum'}
                </p>
                <p>Pastikan selalu pemanasan sebelum lari, berhati-hati saat melompat, dan cuci tangan pakai sabun setelah berolahraga!</p>
              </div>
              <PjokMotionCoachLab
                posesDone={bag.pjokPosesDone}
                onTriggerPose={(pose, title) => {
                  onTriggerHeroPose?.(pose);
                  onReward(5, 30, 10, `Gerak Sehat "${title}" berhasil dilakukan!`);
                }}
              />
            </div>
          )}

          {labKind === 'pjok-motion-coach' && (
            <PjokMotionCoachLab
              posesDone={bag.pjokPosesDone}
              onTriggerPose={(pose, title) => {
                onTriggerHeroPose?.(pose);
                onReward(5, 30, 10, `Gerak Sehat "${title}" berhasil dilakukan!`);
              }}
            />
          )}

          {labKind === 'shape-color-sort' && (
            <ShapeColorSortingLab
              sortedCount={bag.shapesColorsSorted}
              onSortedSuccess={(label) => {
                onMutateBag('shape-color-sorted');
                onReward(6, 40, 12, `Sortir Bentuk & Warna: ${label} tepat!`);
              }}
            />
          )}

          {labKind === 'sentence-builder' && (
            <SentenceBuilderLab
              builtCount={bag.sentencesBuilt}
              onSentenceComplete={(sentence) => {
                onMutateBag('sentence-built');
                onReward(8, 50, 15, `Kalimat "${sentence}" selesai disusun!`);
              }}
            />
          )}

          {labKind === 'market-money-shop' && (
            <MarketMoneyShopLab
              goodFruits={bag.goodFruits}
              marketPurchases={bag.marketPurchases}
              playerCoins={playerCoins}
              onSellFruits={(count, earnedCoins) => {
                onMutateBag('sell-good-fruits');
                onEarnOrSpendCoins?.(
                  earnedCoins,
                  15,
                  `Terjual ${count} buah segar di Pasar Sahabat (+${earnedCoins} Koin)!`
                );
              }}
              onPurchaseSuccess={(itemName, _changeRp, coinDelta) => {
                onMutateBag('market-purchased');
                onEarnOrSpendCoins?.(
                  coinDelta,
                  20,
                  `Berhasil membeli ${itemName} di Pasar Sahabat!`
                );
              }}
            />
          )}

          {labKind === 'combined-exam' && (
            <div className="p-4 rounded-2xl bg-violet-50 border border-violet-200 space-y-3 text-center">
              <p className="font-display text-lg font-extrabold text-violet-950">
                Ujian Akhir Gabungan Kelas 1 · Kerajaan Ilmu
              </p>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                Uji seluruh penguasaanmu pada semua mata pelajaran Kelas 1 (Bahasa Indonesia, Matematika, Pendidikan Pancasila, IPAS, PJOK, Seni Budaya, Agama, Bahasa Inggris, dan Muatan Lokal)!
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onStartCombinedExam?.();
                }}
                className="px-5 py-3 rounded-xl bg-violet-700 hover:bg-violet-800 text-white font-extrabold text-sm cursor-pointer shadow"
              >
                Mulai Ujian Akhir Kelas 1 Sekarang!
              </button>
            </div>
          )}

          {labKind === 'agama-practice' && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-teal-50 border border-teal-200">
                <div>
                  <p className="text-xs font-extrabold text-teal-900">
                    Agama Terpilih (Terisolasi Penuh):
                  </p>
                  <p className="font-bold text-slate-900">{relMeta.sanctuaryName}</p>
                </div>
                {onSelectReligion && (
                  <select
                    value={religion}
                    onChange={(e) => onSelectReligion(e.target.value as ReligionId)}
                    className="px-3 py-1.5 rounded-lg border border-teal-300 bg-white text-xs font-bold cursor-pointer"
                  >
                    {RELIGIONS.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="space-y-2">
                {relMeta.practiceStations.map((st) => {
                  const done = bag.stepsDiscovered.includes(st.id);
                  return (
                    <div
                      key={st.id}
                      className={`p-3 rounded-xl border ${
                        done ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-extrabold text-xs text-slate-900">{st.title}</p>
                        {done && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                      </div>
                      <p className="text-xs text-slate-700 mt-0.5">{st.lesson}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {labKind === 'mulok-culture-cards' && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200">
                <div>
                  <p className="text-xs font-extrabold text-amber-900">
                    Daerah Muatan Lokal Aktif:
                  </p>
                  <p className="font-bold text-slate-900">
                    {regMeta.regionName} · {regMeta.houseName}
                  </p>
                </div>
                {onSelectLocalRegion && (
                  <select
                    value={localRegion}
                    onChange={(e) => onSelectLocalRegion(e.target.value as LocalRegionId)}
                    className="px-3 py-1.5 rounded-lg border border-amber-300 bg-white text-xs font-bold cursor-pointer"
                  >
                    {LOCAL_REGIONS.map((lr) => (
                      <option key={lr.id} value={lr.id}>
                        {lr.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {regMeta.vocabPairs.map((vp) => (
                  <div key={vp.local} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="font-extrabold text-xs text-amber-900">"{vp.local}"</p>
                    <p className="text-xs font-bold text-slate-900">= {vp.indo}</p>
                    <p className="text-[11px] text-slate-600">{vp.meaning}</p>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <p className="font-extrabold text-slate-900">
                  Kuliner Khas: {regMeta.foodName}
                </p>
                <p className="text-slate-700">{regMeta.foodDesc}</p>
              </div>

              <PlayableInstrumentPanel defaultTimber="angklung" />
            </div>
          )}
        </div>

        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500">
            Mapel Aktif: {subjectId.toUpperCase()}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
          >
            Kembali ke Dunia 3D
          </button>
        </div>
      </div>
    </div>
  );
}
