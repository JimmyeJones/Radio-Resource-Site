export interface PrefixEntry {
  prefixes: string[]; // ordered most-specific first
  country: string;
  flag: string;
  ituZone?: number;
  cqZone?: number;
  continent?: 'NA' | 'SA' | 'EU' | 'AF' | 'AS' | 'OC' | 'AN';
}

// Curated subset of ITU prefix block → country mapping. Prefixes are matched
// longest-first, so list more specific prefixes before general ones for the
// same country (e.g. "KH6" before "K").
export const PREFIXES: PrefixEntry[] = [
  { prefixes: ['KH6', 'WH6', 'NH6', 'AH6'], country: 'Hawaii', flag: '🇺🇸', cqZone: 31, ituZone: 61, continent: 'OC' },
  { prefixes: ['KL7', 'WL7', 'NL7', 'AL7'], country: 'Alaska', flag: '🇺🇸', cqZone: 1, ituZone: 1, continent: 'NA' },
  { prefixes: ['KP4', 'WP4', 'NP4'], country: 'Puerto Rico', flag: '🇵🇷', cqZone: 8, ituZone: 11, continent: 'NA' },
  { prefixes: ['K', 'W', 'N', 'AA', 'AB', 'AC', 'AD', 'AE', 'AF', 'AG', 'AI', 'AJ', 'AK'], country: 'United States', flag: '🇺🇸', cqZone: 5, ituZone: 8, continent: 'NA' },
  { prefixes: ['VE', 'VA', 'VO', 'VY'], country: 'Canada', flag: '🇨🇦', cqZone: 5, ituZone: 9, continent: 'NA' },
  { prefixes: ['XE', 'XF', '4A', '4B', '4C', '6D', '6E', '6F', '6G', '6H', '6I', '6J'], country: 'Mexico', flag: '🇲🇽', cqZone: 6, ituZone: 10, continent: 'NA' },
  { prefixes: ['G', 'M', '2E', '2I', '2J', '2M', '2U', '2W'], country: 'United Kingdom', flag: '🇬🇧', cqZone: 14, ituZone: 27, continent: 'EU' },
  { prefixes: ['EI', 'EJ'], country: 'Ireland', flag: '🇮🇪', cqZone: 14, ituZone: 27, continent: 'EU' },
  { prefixes: ['DL', 'DA', 'DB', 'DC', 'DD', 'DF', 'DG', 'DH', 'DJ', 'DK', 'DM', 'DO', 'DP'], country: 'Germany', flag: '🇩🇪', cqZone: 14, ituZone: 28, continent: 'EU' },
  { prefixes: ['F'], country: 'France', flag: '🇫🇷', cqZone: 14, ituZone: 27, continent: 'EU' },
  { prefixes: ['I', 'IZ', 'IK', 'IW'], country: 'Italy', flag: '🇮🇹', cqZone: 15, ituZone: 28, continent: 'EU' },
  { prefixes: ['EA', 'EB', 'EC'], country: 'Spain', flag: '🇪🇸', cqZone: 14, ituZone: 37, continent: 'EU' },
  { prefixes: ['CT'], country: 'Portugal', flag: '🇵🇹', cqZone: 14, ituZone: 37, continent: 'EU' },
  { prefixes: ['ON', 'OO', 'OP', 'OQ', 'OR', 'OS', 'OT'], country: 'Belgium', flag: '🇧🇪', cqZone: 14, ituZone: 27, continent: 'EU' },
  { prefixes: ['PA', 'PB', 'PC', 'PD', 'PE', 'PF', 'PG', 'PH', 'PI'], country: 'Netherlands', flag: '🇳🇱', cqZone: 14, ituZone: 27, continent: 'EU' },
  { prefixes: ['HB'], country: 'Switzerland', flag: '🇨🇭', cqZone: 14, ituZone: 28, continent: 'EU' },
  { prefixes: ['OE'], country: 'Austria', flag: '🇦🇹', cqZone: 15, ituZone: 28, continent: 'EU' },
  { prefixes: ['SM', 'SA', 'SB', 'SC', 'SD', 'SE', 'SF', 'SG', 'SH', 'SI', 'SJ', 'SK', 'SL'], country: 'Sweden', flag: '🇸🇪', cqZone: 14, ituZone: 18, continent: 'EU' },
  { prefixes: ['LA', 'LB', 'LC', 'LD', 'LE', 'LF', 'LG', 'LH', 'LI', 'LJ', 'LK', 'LL', 'LM', 'LN'], country: 'Norway', flag: '🇳🇴', cqZone: 14, ituZone: 18, continent: 'EU' },
  { prefixes: ['OZ', '5P', '5Q'], country: 'Denmark', flag: '🇩🇰', cqZone: 14, ituZone: 18, continent: 'EU' },
  { prefixes: ['OH'], country: 'Finland', flag: '🇫🇮', cqZone: 15, ituZone: 18, continent: 'EU' },
  { prefixes: ['SP', 'HF', '3Z'], country: 'Poland', flag: '🇵🇱', cqZone: 15, ituZone: 28, continent: 'EU' },
  { prefixes: ['OK', 'OL'], country: 'Czech Republic', flag: '🇨🇿', cqZone: 15, ituZone: 28, continent: 'EU' },
  { prefixes: ['OM'], country: 'Slovakia', flag: '🇸🇰', cqZone: 15, ituZone: 28, continent: 'EU' },
  { prefixes: ['HA', 'HG'], country: 'Hungary', flag: '🇭🇺', cqZone: 15, ituZone: 28, continent: 'EU' },
  { prefixes: ['UA', 'UB', 'UC', 'UD', 'UE', 'UF', 'UG', 'UH', 'UI', 'R'], country: 'Russia', flag: '🇷🇺', cqZone: 16, ituZone: 29, continent: 'EU' },
  { prefixes: ['UR', 'UT', 'UU', 'UV', 'UW', 'UX', 'UY', 'UZ', 'EM', 'EN', 'EO'], country: 'Ukraine', flag: '🇺🇦', cqZone: 16, ituZone: 29, continent: 'EU' },
  { prefixes: ['JA', 'JE', 'JF', 'JG', 'JH', 'JI', 'JJ', 'JK', 'JL', 'JM', 'JN', 'JO', 'JP', 'JQ', 'JR', 'JS', '7J', '7K', '7L', '7M', '7N', '8J', '8N'], country: 'Japan', flag: '🇯🇵', cqZone: 25, ituZone: 45, continent: 'AS' },
  { prefixes: ['BY', 'BG', 'BH', 'BD', 'BA', 'BT', 'BZ', 'B0', 'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9'], country: 'China', flag: '🇨🇳', cqZone: 24, ituZone: 44, continent: 'AS' },
  { prefixes: ['BV'], country: 'Taiwan', flag: '🇹🇼', cqZone: 24, ituZone: 44, continent: 'AS' },
  { prefixes: ['HL', 'DS', 'D7', 'D8', 'D9', '6K', '6L', '6M', '6N'], country: 'South Korea', flag: '🇰🇷', cqZone: 25, ituZone: 44, continent: 'AS' },
  { prefixes: ['VK'], country: 'Australia', flag: '🇦🇺', cqZone: 30, ituZone: 55, continent: 'OC' },
  { prefixes: ['ZL'], country: 'New Zealand', flag: '🇳🇿', cqZone: 32, ituZone: 60, continent: 'OC' },
  { prefixes: ['ZS', 'ZR', 'ZU'], country: 'South Africa', flag: '🇿🇦', cqZone: 38, ituZone: 57, continent: 'AF' },
  { prefixes: ['LU'], country: 'Argentina', flag: '🇦🇷', cqZone: 13, ituZone: 14, continent: 'SA' },
  { prefixes: ['PY', 'PP', 'PQ', 'PR', 'PS', 'PT', 'PU', 'PV', 'PW', 'PX', 'ZV', 'ZW', 'ZX', 'ZY', 'ZZ'], country: 'Brazil', flag: '🇧🇷', cqZone: 11, ituZone: 15, continent: 'SA' },
  { prefixes: ['CE', 'CA', 'CB', 'CC', 'CD', '3G', 'XQ', 'XR'], country: 'Chile', flag: '🇨🇱', cqZone: 12, ituZone: 14, continent: 'SA' },
  { prefixes: ['VU'], country: 'India', flag: '🇮🇳', cqZone: 22, ituZone: 41, continent: 'AS' },
  { prefixes: ['9V'], country: 'Singapore', flag: '🇸🇬', cqZone: 28, ituZone: 54, continent: 'AS' },
  { prefixes: ['9M2', '9M4'], country: 'West Malaysia', flag: '🇲🇾', cqZone: 28, ituZone: 54, continent: 'AS' },
  { prefixes: ['9M6', '9M8'], country: 'East Malaysia', flag: '🇲🇾', cqZone: 28, ituZone: 54, continent: 'OC' },
  { prefixes: ['HS', 'E2'], country: 'Thailand', flag: '🇹🇭', cqZone: 26, ituZone: 49, continent: 'AS' },
  { prefixes: ['DU', 'DV', 'DW', 'DX', 'DY', 'DZ', '4D', '4E', '4F', '4G', '4H', '4I'], country: 'Philippines', flag: '🇵🇭', cqZone: 27, ituZone: 50, continent: 'OC' },
  { prefixes: ['4X', '4Z'], country: 'Israel', flag: '🇮🇱', cqZone: 20, ituZone: 39, continent: 'AS' },
  { prefixes: ['TA', 'TB', 'TC', 'YM'], country: 'Türkiye', flag: '🇹🇷', cqZone: 20, ituZone: 39, continent: 'AS' },
  { prefixes: ['SU'], country: 'Egypt', flag: '🇪🇬', cqZone: 34, ituZone: 38, continent: 'AF' },
  { prefixes: ['CN', '5C', '5D', '5E', '5F', '5G'], country: 'Morocco', flag: '🇲🇦', cqZone: 33, ituZone: 37, continent: 'AF' },
];

export function parsePrefix(call: string): string {
  const c = call.toUpperCase().replace(/\s+/g, '');
  // Strip portable suffixes like /P, /M, /MM, /AM, /QRP after a slash
  const slash = c.indexOf('/');
  const core = slash >= 0 && c.length - slash <= 4 ? c.slice(0, slash) : c;
  // The prefix is letters + leading digit(s) before the suffix letters.
  // E.g. KH6XYZ → prefix "KH6"; W1AW → "W1"; G0ABC → "G0"; JA1XYZ → "JA1"; 2E0ABC → "2E0".
  const m = core.match(/^([A-Z0-9]+?\d)/);
  return m ? m[1] : core;
}

export function lookupCallsign(call: string): { entry: PrefixEntry | null; matchedPrefix: string | null } {
  const c = call.toUpperCase().replace(/\s+/g, '');
  // Try progressively shorter prefixes from front.
  for (let n = Math.min(c.length, 5); n >= 1; n--) {
    const candidate = c.slice(0, n);
    for (const entry of PREFIXES) {
      if (entry.prefixes.includes(candidate)) {
        return { entry, matchedPrefix: candidate };
      }
    }
  }
  return { entry: null, matchedPrefix: null };
}
