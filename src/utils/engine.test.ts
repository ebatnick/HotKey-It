import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeKey,
  isModifierKey,
  parseTargetKeys,
  calculateSPM,
  calculateAccuracy,
  checkShortcutMatch,
  getSymbolForDisplay
} from './engine';
import { ShortcutDefinition } from '../types';

test('normalizeKey handles common modifier variations and special keys', () => {
  assert.equal(normalizeKey('ctrl'), 'Control');
  assert.equal(normalizeKey('cmd'), 'Meta');
  assert.equal(normalizeKey('opt'), 'Alt');
  assert.equal(normalizeKey('return'), 'Enter');
  assert.equal(normalizeKey('esc'), 'Escape');
  assert.equal(normalizeKey('arrowup'), 'ArrowUp');
  assert.equal(normalizeKey('k'), 'k');
});

test('isModifierKey accurately identifies modifiers', () => {
  assert.equal(isModifierKey('Control'), true);
  assert.equal(isModifierKey('Shift'), true);
  assert.equal(isModifierKey('Meta'), true);
  assert.equal(isModifierKey('Alt'), true);
  assert.equal(isModifierKey('p'), false);
  assert.equal(isModifierKey('Enter'), false);
});

test('parseTargetKeys correctly separates modifiers from main key', () => {
  const result = parseTargetKeys(['Meta', 'Shift', 'P']);
  assert.equal(result.hasMeta, true);
  assert.equal(result.hasShift, true);
  assert.equal(result.hasCtrl, false);
  assert.equal(result.hasAlt, false);
  assert.equal(result.mainKey, 'p');
});

test('checkShortcutMatch validates correct shortcut combo on Mac', () => {
  const def: ShortcutDefinition = {
    id: 'vscode-command-palette',
    name: 'Command Palette',
    description: 'Open quick command palette',
    preset: 'vscode',
    category: 'Navigation',
    keys: {
      mac: ['Meta', 'Shift', 'P'],
      win: ['Control', 'Shift', 'P']
    },
    display: {
      mac: '⌘ ⇧ P',
      win: 'Ctrl + Shift + P'
    }
  };

  // Simulated KeyboardEvent matching Mac Cmd+Shift+P
  const mockEventMatch = {
    key: 'P',
    code: 'KeyP',
    metaKey: true,
    shiftKey: true,
    ctrlKey: false,
    altKey: false
  } as KeyboardEvent;

  const result1 = checkShortcutMatch(mockEventMatch, def, 'mac');
  assert.equal(result1.isMatch, true);
  assert.equal(result1.isModifierOnly, false);

  // Simulated missing Shift
  const mockEventNoShift = {
    key: 'p',
    code: 'KeyP',
    metaKey: true,
    shiftKey: false,
    ctrlKey: false,
    altKey: false
  } as KeyboardEvent;

  const result2 = checkShortcutMatch(mockEventNoShift, def, 'mac');
  assert.equal(result2.isMatch, false);

  // Simulated pressing Shift alone
  const mockEventShiftOnly = {
    key: 'Shift',
    code: 'ShiftLeft',
    metaKey: true,
    shiftKey: true,
    ctrlKey: false,
    altKey: false
  } as KeyboardEvent;

  const result3 = checkShortcutMatch(mockEventShiftOnly, def, 'mac');
  assert.equal(result3.isModifierOnly, true);
  assert.equal(result3.isMatch, false);
});

test('checkShortcutMatch validates correct shortcut combo on Windows', () => {
  const def: ShortcutDefinition = {
    id: 'vscode-quick-open',
    name: 'Quick Open File',
    description: 'Go to file',
    preset: 'vscode',
    category: 'Navigation',
    keys: {
      mac: ['Meta', 'P'],
      win: ['Control', 'P']
    },
    display: {
      mac: '⌘ P',
      win: 'Ctrl + P'
    }
  };

  const mockWinEvent = {
    key: 'p',
    code: 'KeyP',
    ctrlKey: true,
    metaKey: false,
    shiftKey: false,
    altKey: false
  } as KeyboardEvent;

  const result = checkShortcutMatch(mockWinEvent, def, 'win');
  assert.equal(result.isMatch, true);
});

test('calculateSPM and calculateAccuracy output expected metrics', () => {
  // 30 correct shortcuts in 30 seconds = 60 SPM
  assert.equal(calculateSPM(30, 30), 60);
  // 15 correct in 60 seconds = 15 SPM
  assert.equal(calculateSPM(15, 60), 15);
  // 0 duration returns 0
  assert.equal(calculateSPM(10, 0), 0);

  // 18 correct out of 20 attempts = 90%
  assert.equal(calculateAccuracy(18, 20), 90);
  // 0 attempts returns 100
  assert.equal(calculateAccuracy(0, 0), 100);
});

test('checkShortcutMatch handles Shift + [ resulting in { on keyboard', () => {
  const foldShortcut: ShortcutDefinition = {
    id: 'vsc-fold',
    preset: 'vscode',
    category: 'Folding',
    name: 'Fold Region',
    description: 'Collapse code block',
    keys: {
      mac: ['Alt', 'Meta', '['],
      win: ['Control', 'Shift', '[']
    },
    display: { mac: '⌥ ⌘ [', win: 'Ctrl + Shift + [' }
  };

  // KeyboardEvent when physical Shift + [ is pressed: e.key is '{', e.code is 'BracketLeft'
  const mockFoldEvent = {
    key: '{',
    code: 'BracketLeft',
    ctrlKey: true,
    shiftKey: true,
    altKey: false,
    metaKey: false
  } as KeyboardEvent;

  const result = checkShortcutMatch(mockFoldEvent, foldShortcut, 'win');
  assert.equal(result.isMatch, true);
  assert.equal(result.isModifierOnly, false);
});

test('getSymbolForDisplay returns clean readable words instead of unicode arrows/symbols', () => {
  assert.equal(getSymbolForDisplay('Shift', 'win'), 'Shift');
  assert.equal(getSymbolForDisplay('Shift', 'mac'), 'Shift');
  assert.equal(getSymbolForDisplay('ArrowUp', 'win'), 'Up');
  assert.equal(getSymbolForDisplay('ArrowDown', 'win'), 'Down');
  assert.equal(getSymbolForDisplay('Control', 'win'), 'Ctrl');
  assert.equal(getSymbolForDisplay('Meta', 'win'), 'Win');
  assert.equal(getSymbolForDisplay('Meta', 'mac'), 'Cmd');
  assert.equal(getSymbolForDisplay('Alt', 'mac'), 'Option');
  assert.equal(getSymbolForDisplay('Enter', 'win'), 'Enter');
});

