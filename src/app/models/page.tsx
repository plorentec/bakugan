'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import bakuganData from '@/data/raw/bakugan.json';
import { getModelPath } from '@/lib/model-paths';
import ArenaBackground from '@/ui/components/ArenaBackground';
import dynamic from 'next/dynamic';

const BakuganViewer = dynamic(() => import("@/ui/components/BakuganViewer"), { ssr: false });

/* ------------------------------------------------------------------ */
/*  Attribute colors                                                    */
/* ------------------------------------------------------------------ */

const ATTRIBUTE_COLORS: Record<string, string> = {
  pyrus: '#dc2626',
  aquos: '#2563eb',
  subterra: '#d97706',
  haos: '#eab308',
  darkus: '#7c3aed',
  ventus: '#16a34a',
};

/* ------------------------------------------------------------------ */
/*  Attribute filter                                                    */
/* ------------------------------------------------------------------ */

const ATTRIBUTES = ['all', 'pyrus', 'aquos', 'subterra', 'haos', 'darkus', 'ventus'];

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */

export default function ModelsPage() {
  const [selectedBakugan, setSelectedBakugan] = useState<any>(null);
  const [filter, setFilter] = useState<string>('all');
  const [rotation, setRotation] = useState(true);

  const bakugan = bakuganData as any[];
  const filtered = filter === 'all' ? bakugan : bakugan.filter((b: any) => b.attributes.includes(filter));

  // Auto-select first Bakugan
  useEffect(() => {
    if (filtered.length > 0 && !selectedBakugan) {
      setSelectedBakugan(filtered[0]);
    }
  }, [filtered, selectedBakugan]);

  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      <ArenaBackground attribute={selectedBakugan?.attributes?.[0] || 'standard'} />
      
      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <a href="/" className="text-gray-400 hover:text-white text-sm mb-2 inline-block">
              ← Volver
            </a>
            <h1 className="text-3xl font-bold">Modelos 3D</h1>
            <p className="text-gray-400">Explora los Bakugan en 3D</p>
          </div>
        </div>

        <div className="flex gap-6">
          {/* 3D Viewer */}
          <div className="flex-1">
            <div className="bg-black/60 backdrop-blur rounded-xl border border-gray-700 p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">
                  {selectedBakugan?.name || 'Selecciona un Bakugan'}
                </h2>
                <button
                  onClick={() => setRotation(!rotation)}
                  className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded transition"
                >
                  {rotation ? '⏸ Pausar' : '▶ Rotar'}
                </button>
              </div>

              {/* 3D Viewer */}
              <div className="flex justify-center items-center h-[400px] bg-gray-900/50 rounded-lg border border-gray-800">
                {selectedBakugan ? (
                  <BakuganViewer
                    name={selectedBakugan.name}
                    attribute={selectedBakugan.attributes[0]}
                    size={300}
                    autoRotate={rotation}
                    interactive={true}
                    showName={true}
                  />
                ) : (
                  <div className="text-gray-500">Selecciona un Bakugan</div>
                )}
              </div>

              {/* Info */}
              {selectedBakugan && (
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-gray-400 mb-1">Estadísticas</h3>
                    <div className="grid grid-cols-5 gap-1">
                      {(['speed', 'defense', 'control', 'steering', 'magnet'] as const).map((stat) => (
                        <div key={stat} className="text-center">
                          <div className="text-[9px] text-gray-500 uppercase">{stat.slice(0, 3)}</div>
                          <div className="flex justify-center gap-0.5">
                            {Array.from({ length: 4 }, (_, i) => (
                              <div
                                key={i}
                                className="w-1.5 h-2 rounded-sm"
                                style={{
                                  backgroundColor: i < selectedBakugan.stats[stat]
                                    ? ATTRIBUTE_COLORS[selectedBakugan.attributes[0]]
                                    : '#374151',
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-400 mb-1">G-Power</h3>
                    <div className="text-lg font-bold" style={{ color: ATTRIBUTE_COLORS[selectedBakugan.attributes[0]] }}>
                      {selectedBakugan.base_g_power} / {selectedBakugan.max_g_power} G
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      Atributo: {selectedBakugan.attributes[0]}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bakugan List */}
          <div className="w-80">
            <div className="bg-black/60 backdrop-blur rounded-xl border border-gray-700 p-4">
              <h2 className="text-lg font-bold mb-3">Bakugan ({filtered.length})</h2>

              {/* Filter */}
              <div className="flex flex-wrap gap-1 mb-3">
                {ATTRIBUTES.map((attr) => (
                  <button
                    key={attr}
                    onClick={() => setFilter(attr)}
                    className={`px-2 py-1 rounded text-xs font-semibold transition ${
                      filter === attr
                        ? 'text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                    style={filter === attr ? { backgroundColor: attr === 'all' ? '#6b7280' : ATTRIBUTE_COLORS[attr] } : {}}
                  >
                    {attr === 'all' ? 'Todos' : attr}
                  </button>
                ))}
              </div>

              {/* List */}
              <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto">
                {filtered.map((b: any) => {
                  const hasModel = !!getModelPath(b.name);
                  const isSelected = selectedBakugan?.id === b.id;

                  return (
                    <button
                      key={b.id}
                      onClick={() => setSelectedBakugan(b)}
                      className={`flex items-center gap-3 p-2 rounded-lg border transition text-left ${
                        isSelected
                          ? 'border-orange-500 bg-orange-500/10'
                          : 'border-gray-700 bg-gray-800/50 hover:border-gray-500'
                      }`}
                    >
                      {/* Mini preview */}
                      <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                        <BakuganViewer
                          name={b.name}
                          attribute={b.attributes[0]}
                          size={40}
                          autoRotate={false}
                          interactive={false}
                          showName={false}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold truncate">{b.name}</div>
                        <div className="text-[10px] text-gray-400">
                          {b.attributes[0]} • {b.base_g_power} G
                        </div>
                      </div>

                      {/* Status badge */}
                      <div className={`text-[9px] px-1.5 py-0.5 rounded ${
                        hasModel 
                          ? 'bg-green-900/50 text-green-400' 
                          : 'bg-gray-700 text-gray-500'
                      }`}>
                        {hasModel ? '3D' : 'SVG'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
