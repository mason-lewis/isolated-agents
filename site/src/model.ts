import type { Color, Link, Message, MessageGroup, Run } from './types.ts';

export const coordinate = (index: number): [number, number] => [index % 16, Math.floor(index / 16)];
export const coord = (index: number) => `(${coordinate(index).join(', ')})`;
export const rgb = (color: Color) => color ? `rgb(${color.join(',')})` : '#ef8e9d';
export const fmt = (value: number) => value.toLocaleString('en-US');
export function neighbors(index: number, radius: number): number[] {
  const [x, y] = coordinate(index);
  return Array.from({ length: 256 }, (_, i) => i).filter(i => {
    const [xx, yy] = coordinate(i);
    return i !== index && Math.max(Math.abs(x - xx), Math.abs(y - yy)) <= radius;
  });
}
export const messages = (run: Run, round = -1) => run.messages.filter(m => round < 0 || m[0] === round);
export function links(list: Message[]): Link[] {
  const map = new Map<string, Link>();
  for (const m of list) {
    const key = `${m[1]}:${m[2]}`;
    const edge = map.get(key) ?? { from: m[1], to: m[2], count: 0 };
    edge.count++;
    map.set(key, edge);
  }
  return [...map.values()];
}
export function stats(run: Run, index: number, round = -1) {
  const all = messages(run, round), sent = all.filter(m => m[1] === index), received = all.filter(m => m[2] === index);
  return {
    sent, received, outgoing: new Set(sent.map(m => m[2])).size, incoming: new Set(received.map(m => m[1])).size,
    allowed: neighbors(index, run.radius).length, total: all.length, links: links(all).length,
  };
}
export function groups(list: Message[]): MessageGroup[] {
  const grouped = new Map<string, MessageGroup>();
  for (const m of list) {
    const key = `${m[0]}:${m[1]}:${m[3]}`;
    const group = grouped.get(key) ?? { round: m[0], from: m[1], text: m[3], to: [] };
    group.to.push(m[2]);
    grouped.set(key, group);
  }
  return [...grouped.values()].sort((a, b) => a.round - b.round || a.from - b.from);
}
