import saved from './data.json';
import type { ReportData } from './types';

// The exporter and evidence tests validate the JSON against the reviewed run records.
export const data = saved as unknown as ReportData;
export const houseAliases = ['P13', 'P14', 'P17'] as const;
export const modeNames = ['No contact', 'Up to 8 neighbors', 'Up to 24 neighbors'] as const;
