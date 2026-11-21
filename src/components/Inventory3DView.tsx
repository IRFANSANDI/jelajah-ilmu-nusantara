import { Backpack, Check, Coins, Gift, Lock, Sparkles } from 'lucide-react';
import { PlayerProgress3D } from '../game3d/curriculumData';
import { Accessory3DId, SHOP_ACCESSORIES } from '../game3d/inventoryData';

interface Inventory3DViewProps {
  progress: PlayerProgress3D;
  onBuyAccessory: (id: Accessory3DId, price: number) => void;
  onEquipAccessory: (id: Accessory3DId) => void;
}

export function Inventory3DView({
  progress,
  onBuyAccessory,
  onEquipAccessory,
}: Inventory3DViewProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
            <Backpack className="w-7 h-7 text-amber-600" />
            <span>Inventaris & Perlengkapan 3D</span>
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Gunakan Koin Ilmu untuk membeli perlengkapan 3D yang langsung muncul di karaktermu saat menjelajahi pulau!
          </p>
        </div>

        <div className="px-4 py-2.5 rounded-2xl bg-amber-100 border border-amber-300 text-amber-900 font-mono text-sm font-extrabold flex items-center gap-2">
          <Coins className="w-5 h-5 text-amber-600" />
          <span>Saldo: {progress.coins} Koin</span>
        </div>
      </div>

      {/* 3D Equippable Gear Shop */}
      <section className="space-y-4">
        <h3 className="font-display text-lg font-extrabold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-sky-600" />
          <span>Perlengkapan Karakter 3D</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SHOP_ACCESSORIES.map((item) => {
            const owned = progress.ownedAccessories.includes(item.id);
            const equipped = progress.equippedAccessory === item.id;
            const canAfford = progress.coins >= item.price;

            return (
              <div
                key={item.id}
                className={`rounded-2xl bg-white border p-5 shadow-sm flex flex-col justify-between gap-4 ${
                  equipped ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="px-2.5 py-0.5 rounded-md text-white text-[11px] font-extrabold"
                      style={{ backgroundColor: item.colorHex }}
                    >
                      {item.bonusText}
                    </span>
                    <span className="font-mono text-xs font-extrabold text-amber-700">
                      {owned ? 'Dimiliki' : `${item.price} Koin`}
                    </span>
                  </div>

                  <h4 className="font-display text-base font-extrabold text-slate-900">
                    {item.name}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {owned ? (
                  <button
                    type="button"
                    onClick={() => onEquipAccessory(equipped ? 'none' : item.id)}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                      equipped
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{equipped ? 'Terpasang (Lepas)' : 'Pasang di Karakter 3D'}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={!canAfford}
                    onClick={() => onBuyAccessory(item.id, item.price)}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 ${
                      canAfford
                        ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 cursor-pointer'
                        : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {canAfford ? <Coins className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                    <span>{canAfford ? `Beli (${item.price} Koin)` : `Butuh ${item.price} Koin`}</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Earned Bab Treasures */}
      <section className="space-y-4">
        <h3 className="font-display text-lg font-extrabold text-slate-900 flex items-center gap-2">
          <Gift className="w-5 h-5 text-emerald-600" />
          <span>Koleksi Hadiah Bab ({progress.collectedTreasures.length})</span>
        </h3>

        {progress.collectedTreasures.length === 0 ? (
          <div className="rounded-2xl bg-white border border-slate-200 p-6 text-center text-sm text-slate-600">
            Belum ada hadiah bab yang terkumpul. Masuklah ke Dunia 3D dan selesaikan misi Bab untuk memperoleh lencana dan trofi eksklusif!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {progress.collectedTreasures.map((treasure, idx) => (
              <div
                key={`${treasure}-${idx}`}
                className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-display text-sm font-extrabold text-slate-900">
                    {treasure}
                  </p>
                  <p className="text-[11px] font-semibold text-emerald-700">
                    Hadiah Penyelesaian Bab
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
