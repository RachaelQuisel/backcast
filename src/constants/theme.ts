/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

/* -------------------------------------------------------------------------
 * Backcast design tokens (see docs/design-plan.md)
 *
 * The template exports above (Colors, Fonts) only serve the unused Expo
 * template components. Screens migrate to the tokens below one at a time;
 * the goals screen is the pilot.
 * ---------------------------------------------------------------------- */

/**
 * Color encodes time: `today` (green) is anything about now and the user's
 * actions; `future` (ochre) is anything about their goal age. Never swap
 * them, never use them as decoration.
 *
 * Every text pair passes WCAG AA (4.5:1). Ratios are noted against `paper`.
 */
export const Palette = {
  light: {
    paper: '#F3F5F2', // background: cool chalk, not cream
    ink: '#1D2B2A', // primary text, 13.38:1
    muted: '#56635F', // secondary text, 5.73:1
    today: '#1F6F5C', // actions and "now", 5.49:1; white text on it 6.02:1
    onToday: '#FFFFFF', // text on a `today` fill
    future: '#8A5D0B', // goal-age text, 5.25:1
    futureFill: '#E9B949', // goal-age markers and fills; never text on paper
    onFuture: '#1D2B2A', // text on a `futureFill`, 8.04:1
    line: '#C9D1CC', // dividers only (decorative)
  },
  dark: {
    paper: '#141B1A',
    ink: '#E8EDEA', // 14.76:1
    muted: '#9AA8A3', // 7.08:1
    today: '#5FC3A6', // 8.19:1
    onToday: '#141B1A', // 8.19:1
    future: '#F0C25A', // 10.46:1
    futureFill: '#F0C25A',
    onFuture: '#141B1A', // 10.46:1
    line: '#2C3836',
  },
} as const;

export type PaletteColors = { [K in keyof typeof Palette.light]: string };

/**
 * One family: Atkinson Hyperlegible Next, designed by the Braille Institute
 * for low-vision readers. Each weight is its own family name because custom
 * fonts on iOS/Android ignore `fontWeight`; loaded in `src/app/_layout.tsx`.
 */
export const FontFamily = {
  regular: 'AtkinsonHyperlegibleNext_400Regular',
  medium: 'AtkinsonHyperlegibleNext_500Medium',
  semibold: 'AtkinsonHyperlegibleNext_600SemiBold',
  bold: 'AtkinsonHyperlegibleNext_700Bold',
  extrabold: 'AtkinsonHyperlegibleNext_800ExtraBold',
} as const;

/**
 * Type scale from Bringhurst's classic scale, sized up for older eyes.
 * 14px is the floor anywhere in the app. Sentence case only.
 */
export const Type = {
  numeral: { fontFamily: FontFamily.extrabold, fontSize: 72, lineHeight: 72 },
  title: { fontFamily: FontFamily.bold, fontSize: 36, lineHeight: 42 },
  heading: { fontFamily: FontFamily.bold, fontSize: 24, lineHeight: 30 },
  cardTitle: { fontFamily: FontFamily.semibold, fontSize: 21, lineHeight: 28 },
  body: { fontFamily: FontFamily.regular, fontSize: 18, lineHeight: 27 },
  small: { fontFamily: FontFamily.medium, fontSize: 14, lineHeight: 20 },
} as const;

/** Three radii, tied to hierarchy (replaces the 11 values in use today). */
export const Radius = {
  row: 6, // rows, inputs, buttons
  sheet: 14, // sheets and modals
  round: 999, // checkboxes and pills
} as const;

/** Minimum touch target, per Apple and Android accessibility guidance. */
export const MinTouch = 44;
