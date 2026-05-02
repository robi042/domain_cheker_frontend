export type AttackSurfaceKind = 'domain' | 'subdomain' | 'ip' | 'service';

export type AttackSurfaceApiNode = {
  id: string;
  kind: AttackSurfaceKind;
  label: string;
  subtitle?: string;
};

export type AttackSurfaceApiEdge = { source: string; target: string };

export type AttackSurfaceGraph = {
  domainId: string;
  domainName: string;
  nodes: AttackSurfaceApiNode[];
  edges: AttackSurfaceApiEdge[];
};

const X = { domain: 0, subdomain: 280, ip: 560, service: 840 };
const ROW = 92;

/** Layered left-to-right positions for domain → subs → IPs → services. */
export function layoutAttackSurfacePositions(
  nodes: AttackSurfaceApiNode[],
  edges: AttackSurfaceApiEdge[],
): Map<string, { x: number; y: number }> {
  const pos = new Map<string, { x: number; y: number }>();

  const domain = nodes.find((n) => n.kind === 'domain');
  const subs = nodes
    .filter((n) => n.kind === 'subdomain')
    .sort((a, b) => a.label.localeCompare(b.label));

  subs.forEach((s, i) => {
    pos.set(s.id, { x: X.subdomain, y: 48 + i * ROW });
  });

  const domainY =
    subs.length > 0 ? 48 + ((subs.length - 1) * ROW) / 2 : 120;
  if (domain) {
    pos.set(domain.id, { x: X.domain, y: domainY });
  }

  const predsOf = (target: string) =>
    edges.filter((e) => e.target === target).map((e) => e.source);

  const yOf = (id: string) => pos.get(id)?.y ?? domainY;

  for (const n of nodes) {
    if (n.kind !== 'ip') continue;
    const preds = predsOf(n.id);
    const ys = preds.map(yOf).filter((y) => Number.isFinite(y));
    const y =
      ys.length > 0 ? ys.reduce((a, b) => a + b, 0) / ys.length : domainY;
    pos.set(n.id, { x: X.ip, y });
  }

  for (const n of nodes) {
    if (n.kind !== 'service') continue;
    const preds = predsOf(n.id);
    const pred = preds[0];
    const y = pred ? yOf(pred) : domainY;
    pos.set(n.id, { x: X.service, y });
  }

  return pos;
}
