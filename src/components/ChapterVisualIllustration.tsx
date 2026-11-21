import { useState } from 'react';
import { VisualTypeId } from '../game3d/curriculum/types';

interface ChapterVisualIllustrationProps {
  visualType: VisualTypeId;
  caption: string;
  accentHex?: string;
}

export function ChapterVisualIllustration({
  visualType,
  caption,
  accentHex = '#059669',
}: ChapterVisualIllustrationProps) {
  const [interactiveToggle, setInteractiveToggle] = useState<boolean>(true);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const renderGraphic = () => {
    switch (visualType) {
      case 'alphabet':
        return (
          <svg viewBox="0 0 360 150" className="w-full h-40">
            <rect width="360" height="150" rx="14" fill="#F0F9FF" />
            {[
              { l: 'A', w: 'Apel', c: '#EF4444', x: 18 },
              { l: 'I', w: 'Ikan', c: '#0284C7', x: 84 },
              { l: 'U', w: 'Ular', c: '#059669', x: 150 },
              { l: 'E', w: 'Elang', c: '#D97706', x: 216 },
              { l: 'O', w: 'Obor', c: '#9333EA', x: 282 },
            ].map((item, idx) => (
              <g key={item.l} onClick={() => setSelectedIndex(idx)} className="cursor-pointer">
                <rect
                  x={item.x}
                  y="24"
                  width="56"
                  height="86"
                  rx="12"
                  fill={selectedIndex === idx ? item.c : '#FFFFFF'}
                  stroke={item.c}
                  strokeWidth="2.5"
                />
                <text
                  x={item.x + 28}
                  y="66"
                  textAnchor="middle"
                  fontSize="30"
                  fontWeight="800"
                  fill={selectedIndex === idx ? '#FFFFFF' : item.c}
                >
                  {item.l}
                </text>
                <text
                  x={item.x + 28}
                  y="94"
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="700"
                  fill={selectedIndex === idx ? '#FEF3C7' : '#334155'}
                >
                  {item.w}
                </text>
              </g>
            ))}
            <text x="180" y="135" textAnchor="middle" fontSize="11" fontWeight="700" fill="#0369A1">
              5 Huruf Vokal (a, i, u, e, o) + 21 Konsonan = 26 Huruf Abjad
            </text>
          </svg>
        );

      case 'syllables':
        return (
          <svg viewBox="0 0 360 150" className="w-full h-40">
            <rect width="360" height="150" rx="14" fill="#ECFDF5" />
            <rect x="24" y="34" width="76" height="54" rx="12" fill="#059669" />
            <text x="62" y="68" textAnchor="middle" fontSize="22" fontWeight="800" fill="#FFFFFF">bu</text>
            <text x="116" y="68" textAnchor="middle" fontSize="24" fontWeight="800" fill="#059669">+</text>
            <rect x="132" y="34" width="76" height="54" rx="12" fill="#0284C7" />
            <text x="170" y="68" textAnchor="middle" fontSize="22" fontWeight="800" fill="#FFFFFF">ku</text>
            <text x="224" y="68" textAnchor="middle" fontSize="24" fontWeight="800" fill="#0F172A">=</text>
            <rect x="242" y="30" width="96" height="62" rx="14" fill="#F59E0B" />
            <text x="290" y="69" textAnchor="middle" fontSize="24" fontWeight="800" fill="#FFFFFF">bu-ku</text>
            <text x="180" y="124" textAnchor="middle" fontSize="12" fontWeight="700" fill="#065F46">
              Gabungkan suku kata teratur agar lancar membaca kata!
            </text>
          </svg>
        );

      case 'numbers':
        return (
          <svg viewBox="0 0 360 150" className="w-full h-40">
            <rect width="360" height="150" rx="14" fill="#F0FDF4" />
            <line x1="28" y1="78" x2="332" y2="78" stroke="#0F172A" strokeWidth="3" />
            <polygon points="334,78 324,72 324,84" fill="#0F172A" />
            <polygon points="26,78 36,72 36,84" fill="#0F172A" />
            {[-2, -1, 0, 1, 2, 3, 4].map((n, idx) => {
              const cx = 56 + idx * 41;
              const isZero = n === 0;
              return (
                <g key={n}>
                  <line x1={cx} y1="68" x2={cx} y2="88" stroke="#334155" strokeWidth="2.5" />
                  <circle
                    cx={cx}
                    cy="52"
                    r="14"
                    fill={n < 0 ? '#EF4444' : isZero ? '#F59E0B' : '#059669'}
                  />
                  <text x={cx} y="57" textAnchor="middle" fontSize="13" fontWeight="800" fill="#FFFFFF">
                    {n}
                  </text>
                </g>
              );
            })}
            <text x="180" y="124" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="#166534">
              Garis Bilangan: Makin ke kanan nilainya makin besar →
            </text>
          </svg>
        );

      case 'addition':
        return (
          <svg viewBox="0 0 360 150" className="w-full h-40">
            <rect width="360" height="150" rx="14" fill="#FEFCE8" />
            {[0, 1, 2, 3].map((i) => (
              <circle key={`a${i}`} cx={38 + (i % 2) * 28} cy={44 + Math.floor(i / 2) * 28} r="11" fill="#EF4444" />
            ))}
            <text x="108" y="68" textAnchor="middle" fontSize="28" fontWeight="900" fill="#D97706">+</text>
            {[0, 1, 2].map((i) => (
              <circle key={`b${i}`} cx={140 + i * 28} cy="58" r="11" fill="#0284C7" />
            ))}
            <text x="236" y="68" textAnchor="middle" fontSize="26" fontWeight="900" fill="#0F172A">=</text>
            <rect x="262" y="34" width="72" height="52" rx="12" fill="#059669" />
            <text x="298" y="68" textAnchor="middle" fontSize="26" fontWeight="900" fill="#FFFFFF">7</text>
            <text x="180" y="124" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="#92400E">
              4 + 3 = 7 · Penjumlahan menggabungkan, pengurangan mengambil bagian
            </text>
          </svg>
        );

      case 'geometry':
        return (
          <svg viewBox="0 0 360 150" className="w-full h-40">
            <rect width="360" height="150" rx="14" fill="#EFF6FF" />
            <rect x="28" y="30" width="66" height="66" rx="6" fill="#3B82F6" />
            <text x="61" y="116" textAnchor="middle" fontSize="11" fontWeight="700" fill="#1E3A8A">Persegi (s×s)</text>
            <polygon points="180,28 138,96 222,96" fill="#10B981" />
            <text x="180" y="116" textAnchor="middle" fontSize="11" fontWeight="700" fill="#065F46">Segitiga (½at)</text>
            <circle cx="294" cy="63" r="34" fill="#F59E0B" />
            <line x1="294" y1="63" x2="328" y2="63" stroke="#FFFFFF" strokeWidth="2.5" />
            <text x="311" y="57" textAnchor="middle" fontSize="11" fontWeight="800" fill="#FFFFFF">r</text>
            <text x="294" y="116" textAnchor="middle" fontSize="11" fontWeight="700" fill="#92400E">Lingkaran (πr²)</text>
          </svg>
        );

      case 'clock-money':
        return (
          <svg viewBox="0 0 360 150" className="w-full h-40">
            <rect width="360" height="150" rx="14" fill="#FFFBEB" />
            <circle cx="95" cy="70" r="46" fill="#FFFFFF" stroke="#D97706" strokeWidth="4" />
            <line x1="95" y1="70" x2="95" y2="40" stroke="#0F172A" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="95" y1="70" x2="122" y2="70" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" />
            <circle cx="95" cy="70" r="4" fill="#0F172A" />
            <text x="95" y="135" textAnchor="middle" fontSize="11" fontWeight="700" fill="#92400E">Pukul 03.00 / J-K-W</text>
            <rect x="180" y="34" width="150" height="66" rx="10" fill="#10B981" />
            <rect x="190" y="42" width="130" height="50" rx="6" fill="#ECFDF5" />
            <text x="255" y="72" textAnchor="middle" fontSize="18" fontWeight="900" fill="#047857">Rp10.000</text>
            <text x="255" y="135" textAnchor="middle" fontSize="11" fontWeight="700" fill="#065F46">Nilai Uang & Persen</text>
          </svg>
        );

      case 'pancasila-symbol':
        return (
          <svg viewBox="0 0 360 150" className="w-full h-40">
            <rect width="360" height="150" rx="14" fill="#FEF2F2" />
            {[
              { title: '1. Bintang', bg: '#0F172A', fg: '#FBBF24' },
              { title: '2. Rantai', bg: '#DC2626', fg: '#FDE68A' },
              { title: '3. Beringin', bg: '#16A34A', fg: '#FFFFFF' },
              { title: '4. Banteng', bg: '#991B1B', fg: '#FFFFFF' },
              { title: '5. Padi-Kapas', bg: '#D97706', fg: '#FEF3C7' },
            ].map((s, idx) => (
              <g key={s.title} onClick={() => setSelectedIndex(idx)} className="cursor-pointer">
                <rect
                  x={16 + idx * 67}
                  y="24"
                  width="60"
                  height="78"
                  rx="12"
                  fill={s.bg}
                  stroke={selectedIndex === idx ? '#F59E0B' : 'transparent'}
                  strokeWidth="3"
                />
                <circle cx={46 + idx * 67} cy="56" r="14" fill={s.fg} />
                <text x={46 + idx * 67} y="60" textAnchor="middle" fontSize="12" fontWeight="900" fill={s.bg}>
                  {idx + 1}
                </text>
                <text x={46 + idx * 67} y="122" textAnchor="middle" fontSize="9.5" fontWeight="800" fill="#7F1D1D">
                  {s.title}
                </text>
              </g>
            ))}
            <text x="180" y="140" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#991B1B">
              Bhinneka Tunggal Ika · Lima Sila Pemersatu Bangsa Indonesia
            </text>
          </svg>
        );

      case 'fraction':
        return (
          <svg viewBox="0 0 360 150" className="w-full h-40">
            <rect width="360" height="150" rx="14" fill="#ECFDF5" />
            {/* 1/2 circle */}
            <circle cx="80" cy="65" r="38" fill="#E2E8F0" stroke="#059669" strokeWidth="2.5" />
            <path d="M80,27 A38,38 0 0,1 80,103 Z" fill="#059669" />
            <text x="80" y="126" textAnchor="middle" fontSize="12" fontWeight="800" fill="#065F46">1/2 = 50%</text>
            {/* 1/4 circle */}
            <circle cx="180" cy="65" r="38" fill="#E2E8F0" stroke="#0284C7" strokeWidth="2.5" />
            <path d="M180,65 L180,27 A38,38 0 0,1 218,65 Z" fill="#0284C7" />
            <text x="180" y="126" textAnchor="middle" fontSize="12" fontWeight="800" fill="#0369A1">1/4 = 0,25</text>
            {/* 3/4 circle */}
            <circle cx="280" cy="65" r="38" fill="#E2E8F0" stroke="#D97706" strokeWidth="2.5" />
            <path d="M280,65 L280,27 A38,38 0 1,1 242,65 Z" fill="#F59E0B" />
            <text x="280" y="126" textAnchor="middle" fontSize="12" fontWeight="800" fill="#92400E">3/4 = 75%</text>
          </svg>
        );

      case 'plant-parts':
        return (
          <svg viewBox="0 0 360 150" className="w-full h-40">
            <rect width="360" height="150" rx="14" fill="#F0FDF4" />
            <rect x="0" y="114" width="360" height="36" fill="#92400E" rx="0" />
            <line x1="120" y1="116" x2="120" y2="38" stroke="#15803D" strokeWidth="6" strokeLinecap="round" />
            <path d="M120,116 Q105,132 95,140 M120,116 Q135,134 148,140" stroke="#FDE68A" strokeWidth="3" fill="none" />
            <ellipse cx="92" cy="72" rx="22" ry="10" fill="#22C55E" transform="rotate(-20 92 72)" />
            <ellipse cx="148" cy="66" rx="22" ry="10" fill="#22C55E" transform="rotate(20 148 66)" />
            <circle cx="120" cy="34" r="14" fill="#F43F5E" />
            <circle cx="120" cy="34" r="6" fill="#FBBF24" />
            <text x="195" y="40" fontSize="11.5" fontWeight="700" fill="#BE123C">• Bunga: Perkembangbiakan</text>
            <text x="195" y="65" fontSize="11.5" fontWeight="700" fill="#15803D">• Daun: Fotosintesis (O₂)</text>
            <text x="195" y="90" fontSize="11.5" fontWeight="700" fill="#166534">• Batang: Menyalurkan air</text>
            <text x="195" y="135" fontSize="11.5" fontWeight="700" fill="#FEF3C7">• Akar: Serap air & mineral</text>
          </svg>
        );

      case 'food-chain':
        return (
          <svg viewBox="0 0 360 150" className="w-full h-40">
            <rect width="360" height="150" rx="14" fill="#ECFDF5" />
            {[
              { t: 'Padi', r: 'Produsen', bg: '#16A34A', x: 16 },
              { t: 'Tikus', r: 'Kons. I', bg: '#0284C7', x: 102 },
              { t: 'Ular', r: 'Kons. II', bg: '#D97706', x: 188 },
              { t: 'Elang', r: 'Puncak', bg: '#DC2626', x: 274 },
            ].map((node, i) => (
              <g key={node.t}>
                <rect x={node.x} y="34" width="68" height="62" rx="12" fill={node.bg} />
                <text x={node.x + 34} y="62" textAnchor="middle" fontSize="13" fontWeight="800" fill="#FFFFFF">{node.t}</text>
                <text x={node.x + 34} y="82" textAnchor="middle" fontSize="10" fontWeight="700" fill="#FEF3C7">{node.r}</text>
                {i < 3 && (
                  <text x={node.x + 77} y="70" textAnchor="middle" fontSize="18" fontWeight="900" fill="#0F172A">→</text>
                )}
              </g>
            ))}
            <text x="180" y="128" textAnchor="middle" fontSize="11" fontWeight="700" fill="#065F46">
              Aliran Energi Rantai Makanan → Diuraikan Pengurai (Dekomposer)
            </text>
          </svg>
        );

      case 'water-cycle':
        return (
          <svg viewBox="0 0 360 150" className="w-full h-40">
            <rect width="360" height="150" rx="14" fill="#E0F2FE" />
            <circle cx="52" cy="36" r="20" fill="#FBBF24" />
            <ellipse cx="215" cy="38" rx="48" ry="20" fill="#FFFFFF" />
            <ellipse cx="242" cy="42" rx="34" ry="16" fill="#CBD5E1" />
            <rect x="0" y="112" width="360" height="38" fill="#0284C7" />
            <path d="M90,106 L90,56" stroke="#F59E0B" strokeWidth="3" strokeDasharray="4 4" />
            <text x="112" y="84" fontSize="10.5" fontWeight="800" fill="#B45309">1. Evaporasi</text>
            <text x="215" y="20" textAnchor="middle" fontSize="10.5" fontWeight="800" fill="#1E293B">2. Kondensasi</text>
            <line x1="205" y1="62" x2="200" y2="96" stroke="#0369A1" strokeWidth="2.5" strokeDasharray="4 3" />
            <line x1="230" y1="62" x2="225" y2="96" stroke="#0369A1" strokeWidth="2.5" strokeDasharray="4 3" />
            <text x="275" y="84" fontSize="10.5" fontWeight="800" fill="#0369A1">3. Presipitasi</text>
            <text x="180" y="136" textAnchor="middle" fontSize="11" fontWeight="700" fill="#FFFFFF">
              Air menguap → Membentuk awan → Turun hujan → Mengalir ke laut
            </text>
          </svg>
        );

      case 'circuit':
        return (
          <svg viewBox="0 0 360 150" className="w-full h-40">
            <rect width="360" height="150" rx="14" fill="#0F172A" />
            <rect x="52" y="34" width="256" height="72" rx="12" fill="none" stroke="#38BDF8" strokeWidth="3" />
            <rect x="34" y="54" width="36" height="32" rx="6" fill="#F59E0B" />
            <text x="52" y="74" textAnchor="middle" fontSize="11" fontWeight="800" fill="#FFFFFF">+ −</text>
            <g onClick={() => setInteractiveToggle((p) => !p)} className="cursor-pointer">
              <circle cx="290" cy="70" r="20" fill={interactiveToggle ? '#FDE047' : '#475569'} />
              <text x="290" y="74" textAnchor="middle" fontSize="11" fontWeight="800" fill="#0F172A">
                {interactiveToggle ? 'NYALA' : 'MATI'}
              </text>
            </g>
            <rect x="132" y="20" width="96" height="26" rx="8" fill={interactiveToggle ? '#10B981' : '#EF4444'} onClick={() => setInteractiveToggle((p) => !p)} className="cursor-pointer" />
            <text x="180" y="37" textAnchor="middle" fontSize="10.5" fontWeight="800" fill="#FFFFFF" onClick={() => setInteractiveToggle((p) => !p)} className="cursor-pointer">
              Saklar: {interactiveToggle ? 'TUTUP' : 'BUKA'}
            </text>
            <text x="180" y="132" textAnchor="middle" fontSize="11" fontWeight="700" fill="#BAE6FD">
              Klik Saklar di atas: Arus mengalir saat rangkaian tertutup!
            </text>
          </svg>
        );

      case 'solar-system':
        return (
          <svg viewBox="0 0 360 150" className="w-full h-40">
            <rect width="360" height="150" rx="14" fill="#0F172A" />
            <circle cx="34" cy="70" r="28" fill="#F59E0B" />
            {[
              { n: 'Me', r: 5, x: 78, c: '#94A3B8' },
              { n: 'Ve', r: 7, x: 102, c: '#FCD34D' },
              { n: 'Bu', r: 8, x: 130, c: '#38BDF8' },
              { n: 'Ma', r: 6, x: 158, c: '#EF4444' },
              { n: 'Ju', r: 16, x: 196, c: '#FB923C' },
              { n: 'Sa', r: 13, x: 242, c: '#FDE68A', ring: true },
              { n: 'Ur', r: 10, x: 286, c: '#67E8F9' },
              { n: 'Ne', r: 10, x: 324, c: '#3B82F6' },
            ].map((p) => (
              <g key={p.n}>
                <circle cx={p.x} cy="70" r={p.r} fill={p.c} />
                {p.ring && (
                  <ellipse cx={p.x} cy="70" rx="22" ry="5" fill="none" stroke="#FEF3C7" strokeWidth="2" />
                )}
                <text x={p.x} y="106" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#E2E8F0">
                  {p.n}
                </text>
              </g>
            ))}
            <text x="180" y="134" textAnchor="middle" fontSize="11" fontWeight="700" fill="#FDE68A">
              Matahari + 8 Planet Tata Surya (Merkurius → Neptunus)
            </text>
          </svg>
        );

      case 'volume-cube':
        return (
          <svg viewBox="0 0 360 150" className="w-full h-40">
            <rect width="360" height="150" rx="14" fill="#EEF2FF" />
            <polygon points="80,45 140,45 140,105 80,105" fill="#4F46E5" />
            <polygon points="80,45 105,25 165,25 140,45" fill="#818CF8" />
            <polygon points="140,45 165,25 165,85 140,105" fill="#3730A3" />
            <text x="250" y="54" textAnchor="middle" fontSize="13" fontWeight="800" fill="#312E81">
              Volume Kubus = s × s × s
            </text>
            <text x="250" y="78" textAnchor="middle" fontSize="13" fontWeight="800" fill="#4338CA">
              Volume Balok = p × l × t
            </text>
            <text x="250" y="102" textAnchor="middle" fontSize="12" fontWeight="700" fill="#059669">
              1 dm³ = 1 Liter = 1.000 cm³
            </text>
          </svg>
        );

      case 'bar-chart':
        return (
          <svg viewBox="0 0 360 150" className="w-full h-40">
            <rect width="360" height="150" rx="14" fill="#F8FAFC" />
            <line x1="48" y1="24" x2="48" y2="112" stroke="#334155" strokeWidth="2.5" />
            <line x1="48" y1="112" x2="320" y2="112" stroke="#334155" strokeWidth="2.5" />
            {[
              { label: 'Sen', h: 40, c: '#0284C7', x: 72 },
              { label: 'Sel', h: 64, c: '#059669', x: 132 },
              { label: 'Rab', h: 78, c: '#F59E0B', x: 192 },
              { label: 'Kam', h: 54, c: '#9333EA', x: 252 },
            ].map((b) => (
              <g key={b.label}>
                <rect x={b.x} y={112 - b.h} width="34" height={b.h} rx="6" fill={b.c} />
                <text x={b.x + 17} y="128" textAnchor="middle" fontSize="11" fontWeight="700" fill="#334155">
                  {b.label}
                </text>
              </g>
            ))}
          </svg>
        );

      case 'magnet':
        return (
          <svg viewBox="0 0 360 150" className="w-full h-40">
            <rect width="360" height="150" rx="14" fill="#F1F5F9" />
            <rect x="44" y="48" width="60" height="36" rx="4" fill="#DC2626" />
            <rect x="104" y="48" width="60" height="36" rx="4" fill="#2563EB" />
            <text x="74" y="71" textAnchor="middle" fontSize="15" fontWeight="900" fill="#FFFFFF">U</text>
            <text x="134" y="71" textAnchor="middle" fontSize="15" fontWeight="900" fill="#FFFFFF">S</text>
            <rect x="196" y="48" width="60" height="36" rx="4" fill="#DC2626" />
            <rect x="256" y="48" width="60" height="36" rx="4" fill="#2563EB" />
            <text x="226" y="71" textAnchor="middle" fontSize="15" fontWeight="900" fill="#FFFFFF">U</text>
            <text x="286" y="71" textAnchor="middle" fontSize="15" fontWeight="900" fill="#FFFFFF">S</text>
            <text x="180" y="118" textAnchor="middle" fontSize="12" fontWeight="800" fill="#0F172A">
              Kutub Berbeda (S ↔ U) Tarik-Menarik · Senama Tolak-Menolak
            </text>
          </svg>
        );

      case 'indonesia-map':
        return (
          <svg viewBox="0 0 360 150" className="w-full h-40">
            <rect width="360" height="150" rx="14" fill="#E0F2FE" />
            <path d="M26,48 L64,74 L76,92 L48,88 Z" fill="#16A34A" />
            <path d="M78,94 L142,102 L144,112 L78,106 Z" fill="#15803D" />
            <path d="M126,38 L174,36 L178,74 L128,74 Z" fill="#22C55E" />
            <path d="M196,46 L228,44 L224,84 L198,82 Z" fill="#10B981" />
            <path d="M276,66 L334,76 L330,104 L284,94 Z" fill="#059669" />
            <text x="180" y="134" textAnchor="middle" fontSize="11.5" fontWeight="800" fill="#0369A1">
              Kepulauan Nusantara Indonesia · Kaya Suku, Budaya & Sumber Daya
            </text>
          </svg>
        );

      case 'sport-pose':
        return (
          <svg viewBox="0 0 360 150" className="w-full h-40">
            <rect width="360" height="150" rx="14" fill="#FFF7ED" />
            <circle cx="96" cy="40" r="14" fill="#EA580C" />
            <line x1="96" y1="54" x2="96" y2="90" stroke="#EA580C" strokeWidth="6" strokeLinecap="round" />
            <line x1="96" y1="64" x2="66" y2="52" stroke="#EA580C" strokeWidth="5" strokeLinecap="round" />
            <line x1="96" y1="64" x2="128" y2="52" stroke="#EA580C" strokeWidth="5" strokeLinecap="round" />
            <line x1="96" y1="90" x2="74" y2="122" stroke="#0F172A" strokeWidth="5" strokeLinecap="round" />
            <line x1="96" y1="90" x2="118" y2="122" stroke="#0F172A" strokeWidth="5" strokeLinecap="round" />
            <text x="235" y="56" textAnchor="middle" fontSize="13" fontWeight="800" fill="#9A3412">
              Pemanasan → Gerak Inti → Pendinginan
            </text>
            <text x="235" y="82" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="#C2410C">
              Tubuh Bugar, Tangkas & Sportif!
            </text>
          </svg>
        );

      case 'art-palette':
        return (
          <svg viewBox="0 0 360 150" className="w-full h-40">
            <rect width="360" height="150" rx="14" fill="#FAF5FF" />
            <circle cx="88" cy="64" r="24" fill="#EF4444" opacity="0.85" />
            <circle cx="122" cy="64" r="24" fill="#3B82F6" opacity="0.85" />
            <circle cx="105" cy="92" r="24" fill="#FACC15" opacity="0.85" />
            <text x="248" y="58" textAnchor="middle" fontSize="13" fontWeight="800" fill="#6B21A8">
              Warna Primer & Sekunder
            </text>
            <text x="248" y="82" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="#7E22CE">
              Irama Musik · Tari · Ragam Hias
            </text>
          </svg>
        );

      case 'english-cards':
        return (
          <svg viewBox="0 0 360 150" className="w-full h-40">
            <rect width="360" height="150" rx="14" fill="#EEF2FF" />
            <rect x="26" y="30" width="140" height="80" rx="14" fill="#4F46E5" />
            <text x="96" y="64" textAnchor="middle" fontSize="16" fontWeight="800" fill="#FFFFFF">Good Morning!</text>
            <text x="96" y="88" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="#C7D2FE">Selamat Pagi</text>
            <rect x="194" y="30" width="140" height="80" rx="14" fill="#0284C7" />
            <text x="264" y="64" textAnchor="middle" fontSize="16" fontWeight="800" fill="#FFFFFF">Thank You!</text>
            <text x="264" y="88" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="#BAE6FD">Terima Kasih</text>
            <text x="180" y="135" textAnchor="middle" fontSize="11" fontWeight="700" fill="#312E81">
              Practice English Daily · Listen, Speak, Read & Write
            </text>
          </svg>
        );

      case 'agama-values':
        return (
          <svg viewBox="0 0 360 150" className="w-full h-40">
            <rect width="360" height="150" rx="14" fill="#F0FDFA" />
            {[
              { t: 'Syukur', c: '#0D9488', x: 24 },
              { t: 'Jujur', c: '#0284C7', x: 108 },
              { t: 'Kasih', c: '#D97706', x: 192 },
              { t: 'Rukun', c: '#059669', x: 276 },
            ].map((v) => (
              <g key={v.t}>
                <circle cx={v.x + 30} cy="62" r="30" fill={v.c} />
                <text x={v.x + 30} y="67" textAnchor="middle" fontSize="13" fontWeight="800" fill="#FFFFFF">
                  {v.t}
                </text>
              </g>
            ))}
            <text x="180" y="128" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="#115E59">
              Akhlak Mulia · Beribadah Tekun · Toleransi Antarumat Beragama
            </text>
          </svg>
        );

      case 'muatan-lokal-culture':
        return (
          <svg viewBox="0 0 360 150" className="w-full h-40">
            <rect width="360" height="150" rx="14" fill="#FFFBEB" />
            {/* Rumah Adat Joglo / Gadang silhouette */}
            <polygon points="36,78 90,34 144,78" fill="#B45309" />
            <polygon points="62,48 90,22 118,48" fill="#92400E" />
            <rect x="48" y="78" width="84" height="44" rx="4" fill="#FEF3C7" stroke="#B45309" strokeWidth="2" />
            <rect x="78" y="92" width="24" height="30" rx="3" fill="#78350F" />
            {/* Honai */}
            <ellipse cx="204" cy="96" rx="28" ry="24" fill="#FDE68A" stroke="#0F766E" strokeWidth="2" />
            <path d="M172,82 Q204,34 236,82 Z" fill="#D97706" />
            <rect x="196" y="98" width="16" height="22" rx="3" fill="#78350F" />
            {/* Angklung */}
            <rect x="266" y="42" width="10" height="62" rx="3" fill="#15803D" />
            <rect x="284" y="50" width="10" height="54" rx="3" fill="#16A34A" />
            <rect x="302" y="58" width="10" height="46" rx="3" fill="#22C55E" />
            <line x1="258" y1="88" x2="322" y2="88" stroke="#78350F" strokeWidth="4" strokeLinecap="round" />
            <text x="180" y="138" textAnchor="middle" fontSize="11" fontWeight="800" fill="#92400E">
              Rumah Adat · Bahasa Daerah · Makanan Khas · Budaya Nusantara
            </text>
          </svg>
        );

      case 'writing-steps':
      default:
        return (
          <svg viewBox="0 0 360 150" className="w-full h-40">
            <rect width="360" height="150" rx="14" fill="#F8FAFC" />
            {[
              { n: '1. Baca', c: '#0284C7', x: 20 },
              { n: '2. Catat Ide', c: '#059669', x: 106 },
              { n: '3. Susun', c: '#D97706', x: 192 },
              { n: '4. Sunting', c: '#9333EA', x: 278 },
            ].map((step) => (
              <g key={step.n}>
                <rect x={step.x} y="38" width="72" height="58" rx="12" fill={step.c} />
                <text x={step.x + 36} y="72" textAnchor="middle" fontSize="11.5" fontWeight="800" fill="#FFFFFF">
                  {step.n}
                </text>
              </g>
            ))}
            <text x="180" y="128" textAnchor="middle" fontSize="11" fontWeight="700" fill="#334155">
              Langkah Literasi: Pahami Teks → Temukan Ide Pokok → Tulis Rapi EYD
            </text>
          </svg>
        );
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3.5 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span
          className="text-[11px] font-extrabold uppercase tracking-wider"
          style={{ color: accentHex }}
        >
          Ilustrasi & Alat Bantu Visual Belajar
        </span>
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-100">
        {renderGraphic()}
      </div>
      <p className="text-xs font-bold text-slate-700 text-center">{caption}</p>
    </div>
  );
}
