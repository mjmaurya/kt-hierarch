import { KtDependencyGraphConfig, KtDependencyGraphNode, KtDependencyGraphNodeStyle } from 'kt-hierarch';

/*
 * Everything visual here is the consumer's choice — <kt-dependency-graph> only lays it out.
 * This sample colours nodes and edges by a made-up "health" value to show how.
 */

type Health = 'critical' | 'warning' | 'ok' | 'offline';

const PALETTE: { [h in Health]: { bg: string; border: string; edge: string } } = {
  critical: { bg: '#fbe3e4', border: '#d9464b', edge: '#d23f3f' },
  warning: { bg: '#fdf3cd', border: '#e3a13b', edge: '#d9852b' },
  ok: { bg: '#e7f6eb', border: '#3ea35c', edge: '#3ea35c' },
  offline: { bg: '#f2f2f3', border: '#b4b6ba', edge: '#a3a6ab' },
};

function nodeStyle(health: Health, borderRadius: number): KtDependencyGraphNodeStyle {
  return {
    backgroundColor: PALETTE[health].bg,
    borderColor: PALETTE[health].border,
    borderWidth: 1.5,
    borderRadius,
    subTitle: { color: '#5b616b' },
  };
}

/** [health, node] — health only drives the styles below; kt-dependency-graph never sees it. */
const ITEMS: Array<[Health, KtDependencyGraphNode]> = [
  [
    'critical',
    {
      id: 'sensor-A1',
      title: 'sensor-A1',
      subTitle: 'Pump 1 · 8.4 d',
      customHtml: '<small>Last reading 2 min ago<br>Trend: <b>falling</b></small>',
    },
  ],
  ['critical', { id: 'sensor-A2', title: 'sensor-A2', subTitle: 'Pump 1 · 14 d' }],
  ['warning', { id: 'sensor-B1', title: 'sensor-B1', subTitle: 'Tank 2 · 41 d' }],
  ['offline', { id: 'sensor-B2', title: 'sensor-B2', subTitle: 'Tank 2 · offline' }],
  ['ok', { id: 'sensor-C1', title: 'sensor-C1', subTitle: 'Valve 3 · 62 d' }],

  ['warning', { id: 'vote', title: '2 of 3', subTitle: 'voting', width: 80 }],

  ['critical', { id: 'pump-1', title: 'Pump 1 trip', subTitle: 'Equipment', badge: { text: 'NEW', position: 'bottom-right' } }],
  ['warning', { id: 'tank-2', title: 'Tank 2 trip', subTitle: 'Equipment' }],
  ['ok', { id: 'valve-3', title: 'Valve 3 trip', subTitle: 'Equipment' }],

  [
    'critical',
    {
      id: 'area-north',
      title: 'North area trip',
      subTitle: 'Area',
      customHtml: '<small>Caused by: <b>Pump 1</b>, <b>Tank 2</b></small>',
      badge: { text: '3', style: { backgroundColor: '#d9464b' } },
    },
  ],
  ['ok', { id: 'area-south', title: 'South area trip', subTitle: 'Area' }],

  ['critical', { id: 'plant', title: 'Plant shutdown', subTitle: 'Station', badge: { text: 'L1', position: 'top-left', style: { backgroundColor: '#111827' } } }],
];

const HEALTH = new Map(ITEMS.map(([h, n]) => [n.id, h]));

const NODES: KtDependencyGraphNode[] = ITEMS.map(([health, n]) => {
  const style = nodeStyle(health, n.id.startsWith('sensor') ? 999 : 4);
  if (n.id.startsWith('sensor')) style.title = { fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 12.5 };
  if (n.id === 'vote') Object.assign(style, { textAlign: 'center', title: { fontWeight: 700 } });
  if (n.id === 'plant') style.boxShadow = `0 0 0 3px ${PALETTE[health].bg}, 0 0 0 4.5px ${PALETTE[health].border}`;
  return { ...n, style };
});

const LINKS: Array<[string, string]> = [
  ['sensor-A1', 'pump-1'],
  ['sensor-A2', 'vote'],
  ['sensor-B1', 'vote'],
  ['sensor-B2', 'vote'],
  ['vote', 'pump-1'],
  ['sensor-B1', 'tank-2'],
  ['sensor-C1', 'valve-3'],
  ['pump-1', 'area-north'],
  ['tank-2', 'area-north'],
  ['valve-3', 'area-south'],
  ['area-north', 'plant'],
  ['area-south', 'plant'],
];

export const SAMPLE_GRAPH: KtDependencyGraphConfig = {
  selectedIds: ['pump-1'],
  nodes: NODES,
  // Edges take the colour of their source; critical paths are solid and thicker.
  edges: LINKS.map(([from, to]) => {
    const h = HEALTH.get(from)!;
    return { from, to, style: { color: PALETTE[h].edge, dashed: h !== 'critical', width: h === 'critical' ? 2 : 1.6 } };
  }),
  legend: (Object.keys(PALETTE) as Health[]).map((h) => ({
    label: h[0].toUpperCase() + h.slice(1),
    style: { backgroundColor: PALETTE[h].bg, borderColor: PALETTE[h].border },
  })),
};
