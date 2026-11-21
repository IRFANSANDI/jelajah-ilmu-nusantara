import React from 'react';
import { ArrowLeft, Award, Check, Coins, Lock, ShoppingBag } from 'lucide-react';
import { AccessoryId, PlayerState } from '../types/game';
import { BADGES, SHOP_ITEMS } from '../data/rewards';
import { ExplorerSprite } from './ExplorerSprite';
import { soundEngine } from '../utils/sound';

interface RewardsViewProps {
  player: PlayerState;
  onBuyAccessory: (itemId: AccessoryId, price: number) => void;
  onEquipAccessory: (itemId: AccessoryId) => void;
  onBackHome: () => void;
}

export const RewardsView: React.FC<RewardsViewProps> = ({
  player,
  onBuyAccessory,
  onEquipAccessory,
  onBackHome,
}) => {
  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <p className="text-xs font-semibold text-amber-700">
            Toko Penjelajah & Koleksi Prestasi
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5">
            Hadiah, Kostum & Lencana Nusantara
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200 font-mono text-sm font-bold text-amber-900 tabular-nums">
            <Coins className="w-4 h-4 text-amber-600" />
            <span>{player.coins} Koin</span>
          </div>
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              onBackHome();
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold whitespace-nowrap shrink-0 cursor-pointer min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Home</span>
          </button>
        </div>
      </div>

      {/* Live Character Preview */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-5">
          <ExplorerSprite
            avatar={player.avatar}
            accessory={player.equippedAccessory}
            size="lg"
          />
          <div className="space-y-1">
            <h2 className="font-display text-xl font-extrabold text-slate-900">
              Tampilan Karakter {player.name}
            </h2>
            <p className="text-sm text-slate-600">
              Aksesoris yang dipasang akan langsung terlihat saat kamu menggerakkan karakter di semua dunia petualangan.
            </p>
          </div>
        </div>

        {player.equippedAccessory !== 'none' && (
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              onEquipAccessory('none');
            }}
            className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 whitespace-nowrap shrink-0 cursor-pointer min-h-[40px]"
          >
            Lepas Aksesoris
          </button>
        )}
      </section>

      {/* Shop Accessories Grid */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-emerald-600" />
          <h2 className="font-display text-xl font-extrabold text-slate-900">
            Toko Aksesoris Penjelajah
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SHOP_ITEMS.map((item) => {
            const owned = player.unlockedAccessories.includes(item.id);
            const equipped = player.equippedAccessory === item.id;
            const affordable = player.coins >= item.price;

            return (
              <div
                key={item.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-sm"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-display font-extrabold text-lg"
                      style={{ backgroundColor: item.colorHex }}
                    >
                      {item.name.slice(0, 1)}
                    </div>
                    <span className="font-mono text-sm font-bold text-amber-700 tabular-nums">
                      {owned ? 'Sudah Dimiliki' : `${item.price} Koin`}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-extrabold text-slate-900">
                      {item.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1">
                      {item.description}
                    </p>
                  </div>
                </div>

                {owned ? (
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      onEquipAccessory(equipped ? 'none' : item.id);
                    }}
                    className={`w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 cursor-pointer min-h-[44px] ${
                      equipped
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                    }`}
                  >
                    {equipped ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Sedang Dipakai</span>
                      </>
                    ) : (
                      <span>Pakai Aksesoris</span>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={!affordable}
                    onClick={() => {
                      if (!affordable) return;
                      soundEngine.playUnlock();
                      onBuyAccessory(item.id, item.price);
                    }}
                    className={`w-full py-2.5 rounded-xl text-sm font-bold min-h-[44px] ${
                      affordable
                        ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 cursor-pointer'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {affordable ? `Tukar ${item.price} Koin` : 'Koin Belum Cukup'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Nusantara Badges */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-sky-600" />
          <h2 className="font-display text-xl font-extrabold text-slate-900">
            Koleksi Lencana Prestasi ({player.unlockedBadges.length}/{BADGES.length})
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {BADGES.map((badge) => {
            const unlocked = player.unlockedBadges.includes(badge.id);
            return (
              <div
                key={badge.id}
                className={`p-5 rounded-2xl border flex items-start gap-4 ${
                  unlocked
                    ? 'bg-white border-slate-200 shadow-sm'
                    : 'bg-slate-50 border-slate-200 opacity-75'
                }`}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0"
                  style={{ backgroundColor: unlocked ? badge.accentHex : '#94A3B8' }}
                >
                  {unlocked ? <Award className="w-6 h-6" /> : <Lock className="w-5 h-5" />}
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-900">{badge.name}</p>
                  <p className="text-xs text-slate-600">{badge.description}</p>
                  <p className="text-[11px] font-semibold text-slate-500 pt-1">
                    {unlocked ? 'Berhasil diraih' : `Syarat: ${badge.criteriaText}`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
};
