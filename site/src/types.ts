export type Color = [number, number, number] | null;
export type Message = [round: number, from: number, to: number, textId: number];
export type Mode = 0 | 1 | 2;
export type Direction = 'sent' | 'received';
export interface Run {
  alias: string;
  subject: string;
  approach: 'pixels' | 'neighbors' | 'single';
  radius: Mode;
  rounds: number;
  seconds: number;
  valid: number;
  messageCount: number;
  colors: Color[];
  messages: Message[];
}
export interface Exchange {
  title: string;
  run: string;
  from: [number, number];
  to: [number, number];
  question: string;
  reply: string;
}
export interface ReportData { runs: Record<string, Run>; texts: string[]; exchanges: Exchange[] }
export interface Link { from: number; to: number; count: number }
export interface MessageGroup { round: number; from: number; text: number; to: number[] }
