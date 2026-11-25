import { Palette, type PaletteColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

/**
 * Backcast palette for the current color scheme. Light is the default,
 * including before web hydration (see use-color-scheme.web.ts).
 */
export function usePalette(): { colors: PaletteColors; scheme: 'light' | 'dark' } {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  return { colors: Palette[scheme], scheme };
}
