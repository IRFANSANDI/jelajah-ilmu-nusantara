import {
  Armchair,
  BookOpen,
  Compass,
  DoorOpen,
  FlaskConical,
  Gamepad2,
  Lightbulb,
  Sparkles,
  X,
} from 'lucide-react';

interface BeginnerTutorialModalProps {
  playerName: string;
  onClose: () => void;
}

const TUTORIAL_STEPS = [
  {
    icon: Gamepad2,
    color: 'bg-sky-100 text-sky-700 border-sky-200',
    title: '1. Gerak, Lari & Lompat',
    desc: 'Gunakan tombol WASD atau Panah untuk berjalan, tahan Shift untuk berlari, dan tekan Spasi untuk melompat! Di layar sentuh, gunakan joystick kiri & tombol kanan bawah.',
  },
  {
    icon: Armchair,
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    title: '2. Duduk di Kursi, Bangku & Tempat Ibadah',
    desc: 'Dekati bangku taman, kursi kelas, bangku lab, atau sajadah/kursi ibadah lalu tekan [E] untuk duduk rapi. Saat duduk, kamu bisa memilih pose Baca Buku, Menulis, Angkat Tangan, Tepuk Tangan, atau Berdoa!',
  },
  {
    icon: DoorOpen,
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    title: '3. Masuk ke 8 Bangunan Interaktif',
    desc: 'Dekati pintu Rumah Ceria, Sekolah Nusantara, Perpustakaan Ceria, Pasar Sahabat, Rumah Ibadah, Kerajaan Ilmu, dan Laboratorium Ilmuwan Muda lalu tekan [E]. Daun pintu akan berayun terbuka!',
  },
  {
    icon: FlaskConical,
    color: 'bg-teal-100 text-teal-700 border-teal-200',
    title: '4. Laboratorium Ilmuwan Muda & 8 Kawasan',
    desc: 'Jelajahi semua 8 kawasan Open World Kelas 1. Kunjungi Laboratorium Ilmuwan Muda untuk mencoba eksperimen benda padat-cair, cahaya, dan jaring-jaring kubus 3D!',
  },
  {
    icon: Lightbulb,
    color: 'bg-violet-100 text-violet-700 border-violet-200',
    title: '5. Kuis Ramah Anak dengan 2 Petunjuk',
    desc: 'Kalau salah menjawab di percobaan pertama, jangan takut! Kamu akan mendapat Petunjuk Guru 1 & 2 serta kesempatan mencoba lagi dan mengulang dengan Soal Variasi Baru.',
  },
];

export function BeginnerTutorialModal({
  playerName,
  onClose,
}: BeginnerTutorialModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tutorial-pemula-title"
    >
      <div className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-700 to-teal-700 text-white flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Compass className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-200 uppercase tracking-wider">
                Panduan Pemula Petualang Kelas 1
              </p>
              <h2 id="tutorial-pemula-title" className="font-display text-lg sm:text-xl font-extrabold">
                Selamat Datang, {playerName}!
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup panduan"
            className="w-10 h-10 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-3 overflow-y-auto">
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Sebelum menjelajah Dunia Huruf dan Angka Kelas 1, kenali 5 fitur utama petualanganmu agar makin seru belajarnya:
          </p>

          <div className="space-y-2.5">
            {TUTORIAL_STEPS.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.title}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3"
                >
                  <div
                    className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${step.color}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="font-display text-sm font-extrabold text-slate-900">
                      {step.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <span className="text-xs text-slate-500 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>Kamu bisa membuka panduan ini lagi kapan saja dari menu utama.</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-extrabold flex items-center gap-2 shadow cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Selesai & Mulai Jelajah</span>
          </button>
        </div>
      </div>
    </div>
  );
}
