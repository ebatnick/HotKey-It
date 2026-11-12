import { ThemeColors } from '../types';

export const THEMES: ThemeColors[] = [
  {
    id: 'dracula',
    name: 'Dracula',
    bg: '#282a36',
    surface: '#21222c',
    border: '#44475a',
    text: '#f8f8f2',
    subText: '#6272a4',
    accent: '#bd93f9',
    accentSubtle: '#bd93f922',
    error: '#ff5555',
    keyBg: '#343746',
    keyBorder: '#4d5166',
    keyActiveBg: '#bd93f9',
    keyActiveText: '#282a36'
  },
  {
    id: 'nord',
    name: 'Nord Frost',
    bg: '#242933',
    surface: '#2e3440',
    border: '#3b4252',
    text: '#eceff4',
    subText: '#7b88a1',
    accent: '#88c0d0',
    accentSubtle: '#88c0d025',
    error: '#bf616a',
    keyBg: '#3b4252',
    keyBorder: '#4c566a',
    keyActiveBg: '#88c0d0',
    keyActiveText: '#2e3440'
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    bg: '#0c0d12',
    surface: '#151722',
    border: '#2a2e42',
    text: '#fcee0a',
    subText: '#71768e',
    accent: '#fcee0a',
    accentSubtle: '#fcee0a20',
    error: '#ff003c',
    keyBg: '#1c1f2e',
    keyBorder: '#2e334a',
    keyActiveBg: '#fcee0a',
    keyActiveText: '#0c0d12'
  },
  {
    id: 'obsidian',
    name: 'Obsidian Minimal',
    bg: '#09090b',
    surface: '#121215',
    border: '#27272a',
    text: '#f4f4f5',
    subText: '#71717a',
    accent: '#f59e0b',
    accentSubtle: '#f59e0b20',
    error: '#ef4444',
    keyBg: '#18181b',
    keyBorder: '#27272a',
    keyActiveBg: '#f59e0b',
    keyActiveText: '#09090b'
  },
  {
    id: 'retro-beige',
    name: 'Retro 80s Terminal',
    isLight: true,
    bg: '#ebe4d8',
    surface: '#ded5c5',
    border: '#c4b8a3',
    text: '#2c251e',
    subText: '#7a6f62',
    accent: '#c2410c',
    accentSubtle: '#c2410c22',
    error: '#b91c1c',
    keyBg: '#f5efe6',
    keyBorder: '#b5a791',
    keyActiveBg: '#c2410c',
    keyActiveText: '#ffffff'
  },
  {
    id: 'matcha',
    name: 'Matcha Moss',
    bg: '#141d18',
    surface: '#1c2922',
    border: '#2e4237',
    text: '#e8f0eb',
    subText: '#688c78',
    accent: '#4ade80',
    accentSubtle: '#4ade8020',
    error: '#f87171',
    keyBg: '#23332a',
    keyBorder: '#364e40',
    keyActiveBg: '#4ade80',
    keyActiveText: '#141d18'
  },
  {
    id: 'matrix',
    name: 'Phosphor Matrix',
    bg: '#050a06',
    surface: '#0b140d',
    border: '#15291b',
    text: '#00ff66',
    subText: '#235933',
    accent: '#00ff66',
    accentSubtle: '#00ff6622',
    error: '#ff3333',
    keyBg: '#0e1d12',
    keyBorder: '#1c3d25',
    keyActiveBg: '#00ff66',
    keyActiveText: '#050a06'
  }
];

export const DEFAULT_THEME_ID = 'obsidian';

export function getTheme(id: string): ThemeColors {
  return THEMES.find(t => t.id === id) || THEMES[3]; // default Obsidian
}
