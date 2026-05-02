'use client';

import '@xyflow/react/dist/style.css';

import { useEffect, useMemo } from 'react';
import {
  Background,
  Controls,
  Handle,
  MarkerType,
  MiniMap,
  Position,
  ReactFlow,
  ReactFlowProvider,
  type Edge,
  type Node,
  type NodeProps,
  useReactFlow,
} from '@xyflow/react';
import type {
  AttackSurfaceApiEdge,
  AttackSurfaceApiNode,
  AttackSurfaceGraph,
} from '@/lib/attack-surface-layout';
import { layoutAttackSurfacePositions } from '@/lib/attack-surface-layout';

type AttackNodeData = {
  label: string;
  subtitle?: string;
  kind: AttackSurfaceApiNode['kind'];
};

function AttackSurfaceNode({ data }: NodeProps<Node<AttackNodeData>>) {
  const accent =
    data.kind === 'domain'
      ? 'border-emerald-500/35 shadow-emerald-950/30 ring-emerald-500/25'
      : data.kind === 'subdomain'
        ? 'border-sky-500/30 shadow-sky-950/25 ring-sky-500/20'
        : data.kind === 'ip'
          ? 'border-violet-500/30 shadow-violet-950/25 ring-violet-500/20'
          : 'border-amber-500/35 shadow-amber-950/25 ring-amber-500/25';

  const badge =
    data.kind === 'domain'
      ? 'Domain'
      : data.kind === 'subdomain'
        ? 'Host'
        : data.kind === 'ip'
          ? 'IP'
          : 'Service';

  return (
    <div
      className={`relative min-w-[168px] max-w-[220px] rounded-xl border bg-zinc-950/90 px-3.5 py-3 shadow-xl ring-1 backdrop-blur-sm ${accent}`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!size-2.5 !border-0 !bg-zinc-500"
      />
      <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-zinc-500">{badge}</p>
      <p className="mt-1 break-all font-semibold leading-snug tracking-tight text-zinc-50">
        {data.label}
      </p>
      {data.subtitle ? (
        <p className="mt-1.5 break-words text-[11px] leading-relaxed text-zinc-400">{data.subtitle}</p>
      ) : null}
      <Handle
        type="source"
        position={Position.Right}
        className="!size-2.5 !border-0 !bg-zinc-500"
      />
    </div>
  );
}

const nodeTypes = { attack: AttackSurfaceNode };

function FitView({ nodeCount }: { nodeCount: number }) {
  const { fitView } = useReactFlow();
  useEffect(() => {
    const t = requestAnimationFrame(() => {
      fitView({ padding: 0.18, duration: 280 });
    });
    return () => cancelAnimationFrame(t);
  }, [fitView, nodeCount]);
  return null;
}

function mapMiniMapColor(kind: string | undefined) {
  switch (kind) {
    case 'domain':
      return '#10b981';
    case 'subdomain':
      return '#38bdf8';
    case 'ip':
      return '#a78bfa';
    case 'service':
      return '#fbbf24';
    default:
      return '#71717a';
  }
}

export default function AttackSurfaceFlow({ graph }: { graph: AttackSurfaceGraph }) {
  const positions = useMemo(
    () => layoutAttackSurfacePositions(graph.nodes, graph.edges),
    [graph.nodes, graph.edges],
  );

  const rfNodes: Node<AttackNodeData>[] = useMemo(
    () =>
      graph.nodes.map((n) => ({
        id: n.id,
        type: 'attack',
        position: positions.get(n.id) ?? { x: 0, y: 0 },
        data: { label: n.label, subtitle: n.subtitle, kind: n.kind },
      })),
    [graph.nodes, positions],
  );

  const rfEdges: Edge[] = useMemo(() => {
    const subSvcDirect = new Set<string>();
    for (const e of graph.edges) {
      if (e.source.startsWith('s:') && e.target.startsWith('svc:')) {
        subSvcDirect.add(`${e.source}|${e.target}`);
      }
    }
    return graph.edges.map((e: AttackSurfaceApiEdge, i: number) => {
      const direct = subSvcDirect.has(`${e.source}|${e.target}`);
      return {
        id: `e-${i}-${e.source}-${e.target}`,
        source: e.source,
        target: e.target,
        type: 'smoothstep',
        animated: false,
        style: {
          stroke: direct ? '#71717a' : '#52525b',
          strokeWidth: direct ? 1.25 : 1.5,
          strokeDasharray: direct ? '6 4' : undefined,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 18,
          height: 18,
          color: direct ? '#71717a' : '#52525b',
        },
      };
    });
  }, [graph.edges]);

  return (
    <div className="h-[min(68vh,720px)] min-h-[420px] w-full rounded-2xl border border-white/[0.07] bg-zinc-950/40 [&_.react-flow\_\_attribution]:hidden">
      <ReactFlowProvider>
        <ReactFlow
          nodes={rfNodes}
          edges={rfEdges}
          nodeTypes={nodeTypes}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={true}
          panOnScroll
          zoomOnScroll
          minZoom={0.35}
          maxZoom={1.6}
          proOptions={{ hideAttribution: true }}
          defaultEdgeOptions={{ type: 'smoothstep' }}
        >
          <Background gap={22} size={1} color="#27272a" />
          <Controls className="!m-3 !overflow-hidden !rounded-xl !border !border-white/[0.08] !bg-zinc-900/95 !shadow-xl [&_button]:!border-white/[0.06] [&_button]:!bg-zinc-900 [&_button]:hover:!bg-zinc-800" />
          <MiniMap
            className="!m-3 !overflow-hidden !rounded-xl !border !border-white/[0.08] !bg-zinc-950/90"
            maskColor="rgba(9, 9, 11, 0.82)"
            nodeStrokeWidth={3}
            nodeColor={(n) => mapMiniMapColor((n.data as AttackNodeData | undefined)?.kind)}
          />
          <FitView nodeCount={rfNodes.length} />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
}
