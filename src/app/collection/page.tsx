'use client';

import { useState, useMemo } from 'react';
import bakuganData from '@/data/raw/bakugan.json';
import gateCardsData from '@/data/raw/gate-cards.json';
import abilityCardsData from '@/data/raw/ability-cards.json';
import BakuganImage from '@/ui/components/BakuganImage';
import ArenaBackground from '@/ui/components/ArenaBackground';

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

type TabKey = 'bakugan' | 'gate_cards' | 'ability_cards';
type AttributeFilter = 'all' | 'pyrus' | 'aquos' | 'subterra' | 'haos' | 'darkus' | 'ventus';
type ColorFilter = 'all' | 'red' | 'green' | 'blue';
type TierFilter = 'all' | 'gold' | 'silver' | 'copper';

interface CollectionState {
  ownedBakugan: Set<string>;
  ownedGateCards: Set<string>;
  ownedAbilityCards: Set<string>;
}

/* ------------------------------------------------------------------ */
/*  Bakudex Page                                                        */
/* ------------------------------------------------------------------ */

export default function BakudexPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('bakugan');
  const [attributeFilter, setAttributeFilter] = useState<AttributeFilter>('all');
  const [colorFilter, setColorFilter] = useState<ColorFilter>('all');
  const [tierFilter, setTierFilter] = useState<TierFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Placeholder owned state — would connect to save store in production
  const [collection] = useState<CollectionState>({
    ownedBakugan: new Set(bakuganData.map((b) => b.id)),
    ownedGateCards: new Set(gateCardsData.map((g) => g.id)),
    ownedAbilityCards: new Set(abilityCardsData.map((a) => a.id)),
  });

  /* ------------------------------------------------------------------ */
  /*  Statistics                                                          */
  /* ------------------------------------------------------------------ */

  const stats = useMemo(
    () => ({
      bakugan: { total: bakuganData.length, owned: collection.ownedBakugan.size },
      gateCards: { total: gateCardsData.length, owned: collection.ownedGateCards.size },
      abilityCards: { total: abilityCardsData.length, owned: collection.ownedAbilityCards.size },
      totalItems:
        bakuganData.length + gateCardsData.length + abilityCardsData.length,
      totalOwned:
        collection.ownedBakugan.size +
        collection.ownedGateCards.size +
        collection.ownedAbilityCards.size,
    }),
    [collection],
  );

  const completionPercent = Math.round(
    (stats.totalOwned / stats.totalItems) * 100,
  );

  /* ------------------------------------------------------------------ */
  /*  Filtered Data                                                       */
  /* ------------------------------------------------------------------ */

  const filteredBakugan = useMemo(() => {
    return bakuganData.filter((b) => {
      if (attributeFilter !== 'all' && !b.attributes.includes(attributeFilter as any))
        return false;
      if (searchQuery && !b.name.toLowerCase().includes(searchQuery.toLowerCase()))
        return false;
      return true;
    });
  }, [attributeFilter, searchQuery]);

  const filteredGateCards = useMemo(() => {
    return gateCardsData.filter((g) => {
      if (tierFilter !== 'all' && g.tier !== tierFilter) return false;
      if (attributeFilter !== 'all') {
        const bonuses = g.bonuses as Record<string, number>;
        if (!bonuses[attributeFilter] || bonuses[attributeFilter] === 0) return false;
      }
      if (searchQuery && !g.name.toLowerCase().includes(searchQuery.toLowerCase()))
        return false;
      return true;
    });
  }, [tierFilter, attributeFilter, searchQuery]);

  const filteredAbilityCards = useMemo(() => {
    return abilityCardsData.filter((a) => {
      if (colorFilter !== 'all' && a.color !== colorFilter) return false;
      if (searchQuery && !a.name.toLowerCase().includes(searchQuery.toLowerCase()))
        return false;
      return true;
    });
  }, [colorFilter, searchQuery]);

  /* ------------------------------------------------------------------ */
  /*  Render                                                              */
  /* ------------------------------------------------------------------ */

  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      <ArenaBackground attribute="haos" />
      <div className="relative z-10 p-6">
        <h1 className="text-3xl font-bold mb-2">Bakudex</h1>
        <p className="text-gray-400 mb-6">Rastreador de colección completo</p>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Total" value={stats.totalOwned} max={stats.totalItems} percent={completionPercent} />
        <StatCard label="Bakugan" value={stats.bakugan.owned} max={stats.bakugan.total} />
        <StatCard label="Gate Cards" value={stats.gateCards.owned} max={stats.gateCards.total} />
        <StatCard label="Ability Cards" value={stats.abilityCards.owned} max={stats.abilityCards.total} />
      </div>

      {/* Tab Bar */}
      <div className="flex gap-2 mb-4">
        {(['bakugan', 'gate_cards', 'ability_cards'] as TabKey[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded font-medium transition ${
              activeTab === tab
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {tab === 'bakugan' && `Bakugan (${filteredBakugan.length})`}
            {tab === 'gate_cards' && `Gate Cards (${filteredGateCards.length})`}
            {tab === 'ability_cards' && `Ability Cards (${filteredAbilityCards.length})`}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <input
          type="text"
          placeholder="Buscar..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-3 py-1 rounded bg-gray-700 border border-gray-600 text-white"
        />

        {/* Attribute Filter */}
        <select
          value={attributeFilter}
          onChange={(e) => setAttributeFilter(e.target.value as AttributeFilter)}
          className="px-3 py-1 rounded bg-gray-700 border border-gray-600"
        >
          <option value="all">Todos los Atributos</option>
          {['pyrus', 'aquos', 'subterra', 'haos', 'darkus', 'ventus'].map((a) => (
            <option key={a} value={a}>{a.charAt(0).toUpperCase() + a.slice(1)}</option>
          ))}
        </select>

        {/* Tier Filter (Gate Cards only) */}
        {activeTab === 'gate_cards' && (
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value as TierFilter)}
            className="px-3 py-1 rounded bg-gray-700 border border-gray-600"
          >
            <option value="all">Todas las Categorías</option>
            <option value="gold">Oro</option>
            <option value="silver">Plata</option>
            <option value="copper">Cobre</option>
          </select>
        )}

        {/* Color Filter (Ability Cards only) */}
        {activeTab === 'ability_cards' && (
          <select
            value={colorFilter}
            onChange={(e) => setColorFilter(e.target.value as ColorFilter)}
            className="px-3 py-1 rounded bg-gray-700 border border-gray-600"
          >
            <option value="all">Todos los Colores</option>
            <option value="red">Rojo</option>
            <option value="green">Verde</option>
            <option value="blue">Azul</option>
          </select>
        )}
      </div>

      {/* Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {activeTab === 'bakugan' &&
          filteredBakugan.map((b) => (
            <BakuganCard key={b.id} bakugan={b} owned={collection.ownedBakugan.has(b.id)} />
          ))}
        {activeTab === 'gate_cards' &&
          filteredGateCards.map((g) => (
            <GateCardEntry key={g.id} card={g} owned={collection.ownedGateCards.has(g.id)} />
          ))}
        {activeTab === 'ability_cards' &&
          filteredAbilityCards.map((a) => (
            <AbilityCardEntry key={a.id} card={a} owned={collection.ownedAbilityCards.has(a.id)} />
          ))}
      </div>

      {((activeTab === 'bakugan' && filteredBakugan.length === 0) ||
        (activeTab === 'gate_cards' && filteredGateCards.length === 0) ||
        (activeTab === 'ability_cards' && filteredAbilityCards.length === 0)) && (
        <p className="text-gray-500 text-center py-8">No hay elementos que coincidan con tus filtros.</p>
      )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                      */
/* ------------------------------------------------------------------ */

function StatCard({ label, value, max, percent }: {
  label: string;
  value: number;
  max: number;
  percent?: number;
}) {
  const pct = percent ?? Math.round((value / max) * 100);
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="text-sm text-gray-400">{label}</div>
      <div className="text-2xl font-bold">
        {value} <span className="text-sm text-gray-500">/ {max}</span>
      </div>
      <div className="mt-1 h-2 bg-gray-700 rounded">
        <div className="h-2 bg-blue-500 rounded" style={{ width: `${pct}%` }} />
      </div>
      <div className="text-xs text-gray-400 mt-1">{pct}% completo</div>
    </div>
  );
}

function BakuganCard({ bakugan, owned }: { bakugan: any; owned: boolean }) {
  return (
    <div className={`rounded-lg p-3 border ${owned ? 'bg-gray-800/80 backdrop-blur border-gray-600' : 'bg-gray-900/80 backdrop-blur border-gray-800 opacity-50'}`}>
      <div className="flex items-center gap-3 mb-1">
        <BakuganImage
          name={bakugan.name}
          attribute={bakugan.attributes[0]}
          size={48}
          showName={false}
        />
        <div>
          <span className="font-medium">{bakugan.name}</span>
          <div className="text-xs text-gray-400">
            {bakugan.attributes.map((a: string) => a.charAt(0).toUpperCase() + a.slice(1)).join(', ')}
          </div>
        </div>
      </div>
      <div className="text-xs">
        G-Power: {bakugan.base_g_power}–{bakugan.max_g_power}
      </div>
      <div className="text-xs text-gray-500">
        SPD {bakugan.stats.speed} | DEF {bakugan.stats.defense} | CTR {bakugan.stats.control} | STR {bakugan.stats.steering} | MAG {bakugan.stats.magnet}
      </div>
      <div className="text-xs text-gray-600 mt-1">
        {owned ? '✓ Obtenido' : '✗ Bloqueado'}
      </div>
    </div>
  );
}

function GateCardEntry({ card, owned }: { card: any; owned: boolean }) {
  const tierColor: Record<string, string> = {
    gold: '#ffd700',
    silver: '#c0c0c0',
    copper: '#cd7f32',
  };

  return (
    <div className={`rounded-lg p-3 border ${owned ? 'bg-gray-800 border-gray-600' : 'bg-gray-900 border-gray-800 opacity-50'}`}>
      <div className="flex items-center gap-2 mb-1">
        <span
          className="w-3 h-3 rounded"
          style={{ backgroundColor: tierColor[card.tier] ?? '#666' }}
        />
        <span className="font-medium">{card.name}</span>
        <span className="text-xs text-gray-500 capitalize">({card.tier})</span>
      </div>
      <div className="text-xs text-gray-400 mb-1">
        Batalla: {card.battle_type}
        {card.depicted_bakugan && ` | Representa: ${card.depicted_bakugan}`}
      </div>
      {card.effect && (
        <div className="text-xs text-gray-500 italic">{card.effect.description}</div>
      )}
      <div className="text-xs text-gray-600 mt-1">
        {owned ? '✓ Obtenido' : '✗ Bloqueado'}
      </div>
    </div>
  );
}

function AbilityCardEntry({ card, owned }: { card: any; owned: boolean }) {
  const colorMap: Record<string, string> = {
    red: '#cc3333',
    green: '#33aa33',
    blue: '#3366cc',
  };

  return (
    <div className={`rounded-lg p-3 border ${owned ? 'bg-gray-800 border-gray-600' : 'bg-gray-900 border-gray-800 opacity-50'}`}>
      <div className="flex items-center gap-2 mb-1">
        <span
          className="w-3 h-3 rounded"
          style={{ backgroundColor: colorMap[card.color] ?? '#666' }}
        />
        <span className="font-medium">{card.name}</span>
        <span className="text-xs text-gray-500 capitalize">({card.color})</span>
      </div>
      <div className="text-xs text-gray-400 mb-1">{card.description}</div>
      <div className="text-xs text-gray-600 mt-1">
        {owned ? '✓ Obtenido' : '✗ Bloqueado'}
      </div>
    </div>
  );
}
