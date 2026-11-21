import { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export function PWAInstallButton() {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        title="Pasang sebagai Aplikasi"
        aria-label="Pasang Aplikasi"
        className="h-10 px-3 rounded-xl border border-sky-300 bg-sky-50 hover:bg-sky-100 text-sky-900 font-bold text-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
      >
        <Download className="w-4 h-4 text-sky-700 shrink-0" />
        <span className="hidden sm:inline">Pasang App</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          title="Pasang di iPhone / iPad"
          aria-label="Pasang di iOS"
          className="h-10 px-3 rounded-xl border border-sky-300 bg-sky-50 hover:bg-sky-100 text-sky-900 font-bold text-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
        >
          <Smartphone className="w-4 h-4 text-sky-700 shrink-0" />
          <span className="hidden sm:inline">Pasang iOS</span>
        </button>

        {showIOSGuide && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ios-install-title"
          >
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <h3
                  id="ios-install-title"
                  className="font-display text-lg font-extrabold text-slate-900"
                >
                  Pasang di iPhone / iPad
                </h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  aria-label="Tutup panduan pasang"
                  className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                1. Ketuk tombol <strong>Bagikan (Share)</strong> di bilah Safari.
                <br />
                2. Gulir ke bawah dan pilih{' '}
                <strong>Tambah ke Layar Utama (Add to Home Screen)</strong>.
              </p>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="w-full min-h-[44px] rounded-xl bg-emerald-600 hover:bg-emerald-700 py-2.5 text-sm font-extrabold text-white cursor-pointer"
              >
                Mengerti
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
}
