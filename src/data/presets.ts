import { ShortcutDefinition, PresetId } from '../types';

export interface PresetInfo {
  id: PresetId;
  name: string;
  tagline: string;
  icon: string;
  count: number;
}

export const PRESET_INFOS: PresetInfo[] = [
  {
    id: 'vscode',
    name: 'VS Code',
    tagline: 'Code editor hotkeys & multi-cursor magic',
    icon: 'Code2',
    count: 14
  },
  {
    id: 'figma',
    name: 'Figma',
    tagline: 'Vector, frame, and auto-layout mastery',
    icon: 'Palette',
    count: 14
  },
  {
    id: 'blender',
    name: 'Blender 3D',
    tagline: 'Mesh modeling, transforms & viewport navigation',
    icon: 'Box',
    count: 14
  },
  {
    id: 'excel',
    name: 'Excel / Sheets',
    tagline: 'Financial modeling, table manipulation & navigation',
    icon: 'Sheet',
    count: 13
  }
];

export const SHORTCUTS_DATA: Record<PresetId, ShortcutDefinition[]> = {
  vscode: [
    {
      id: 'vsc-cmd-pal',
      preset: 'vscode',
      category: 'Command',
      name: 'Command Palette',
      description: 'Open full command palette (Ctrl + Shift + P or F1)',
      keys: {
        mac: ['Meta', 'Shift', 'P'],
        win: ['Control', 'Shift', 'P']
      },
      altKeys: {
        mac: ['F1'],
        win: ['F1']
      },
      display: { mac: 'Cmd + Shift + P (or F1)', win: 'Ctrl + Shift + P (or F1)' },
      hint: 'F1 or Ctrl+Shift+P'
    },
    {
      id: 'vsc-quick-open',
      preset: 'vscode',
      category: 'Navigation',
      name: 'Quick Open File',
      description: 'Fuzzy-search and jump to any workspace file',
      keys: {
        mac: ['Meta', 'P'],
        win: ['Control', 'P']
      },
      display: { mac: 'Cmd + P', win: 'Ctrl + P' },
      hint: 'Global'
    },
    {
      id: 'vsc-dup-line-down',
      preset: 'vscode',
      category: 'Editing',
      name: 'Duplicate Line Down',
      description: 'Copy active line or selection immediately below',
      keys: {
        mac: ['Alt', 'Shift', 'ArrowDown'],
        win: ['Shift', 'Alt', 'ArrowDown']
      },
      display: { mac: 'Option + Shift + Down', win: 'Shift + Alt + Down' },
      hint: 'Editor'
    },
    {
      id: 'vsc-add-cursor-down',
      preset: 'vscode',
      category: 'Multi-Cursor',
      name: 'Insert Cursor Below',
      description: 'Add a secondary cursor directly on the line below',
      keys: {
        mac: ['Alt', 'Meta', 'ArrowDown'],
        win: ['Control', 'Alt', 'ArrowDown']
      },
      display: { mac: 'Option + Cmd + Down', win: 'Ctrl + Alt + Down' },
      hint: 'Editor'
    },
    {
      id: 'vsc-select-next',
      preset: 'vscode',
      category: 'Multi-Cursor',
      name: 'Select Next Occurrence',
      description: 'Select next matching word and add a new cursor',
      keys: {
        mac: ['Meta', 'D'],
        win: ['Control', 'D']
      },
      display: { mac: 'Cmd + D', win: 'Ctrl + D' },
      hint: 'Editor'
    },
    {
      id: 'vsc-terminal',
      preset: 'vscode',
      category: 'View',
      name: 'Toggle Terminal',
      description: 'Open or collapse integrated terminal panel',
      keys: {
        mac: ['Control', '`'],
        win: ['Control', '`']
      },
      display: { mac: 'Ctrl + `', win: 'Ctrl + `' },
      hint: 'Global'
    },
    {
      id: 'vsc-rename',
      preset: 'vscode',
      category: 'Refactoring',
      name: 'Rename Symbol',
      description: 'Safely refactor symbol name across codebase',
      keys: {
        mac: ['F2'],
        win: ['F2']
      },
      display: { mac: 'F2', win: 'F2' },
      hint: 'Editor'
    },
    {
      id: 'vsc-format',
      preset: 'vscode',
      category: 'Formatting',
      name: 'Format Document',
      description: 'Format active document with Prettier / default formatter',
      keys: {
        mac: ['Alt', 'Shift', 'F'],
        win: ['Shift', 'Alt', 'F']
      },
      display: { mac: 'Option + Shift + F', win: 'Shift + Alt + F' },
      hint: 'Editor'
    },
    {
      id: 'vsc-comment',
      preset: 'vscode',
      category: 'Editing',
      name: 'Toggle Line Comment',
      description: 'Toggle single-line comment on current line',
      keys: {
        mac: ['Meta', '/'],
        win: ['Control', '/']
      },
      display: { mac: 'Cmd + /', win: 'Ctrl + /' },
      hint: 'Editor'
    },
    {
      id: 'vsc-delete-line',
      preset: 'vscode',
      category: 'Editing',
      name: 'Delete Line',
      description: 'Instantly remove current line without copying',
      keys: {
        mac: ['Meta', 'Shift', 'K'],
        win: ['Control', 'Shift', 'K']
      },
      display: { mac: 'Cmd + Shift + K', win: 'Ctrl + Shift + K' },
      hint: 'Editor'
    },
    {
      id: 'vsc-split-editor',
      preset: 'vscode',
      category: 'View',
      name: 'Split Editor',
      description: 'Split current editor group into two columns',
      keys: {
        mac: ['Meta', '\\'],
        win: ['Control', '\\']
      },
      display: { mac: 'Cmd + \\', win: 'Ctrl + \\' },
      hint: 'Editor'
    },
    {
      id: 'vsc-goto-line',
      preset: 'vscode',
      category: 'Navigation',
      name: 'Go to Line',
      description: 'Quickly jump to a specific line and column number',
      keys: {
        mac: ['Control', 'G'],
        win: ['Control', 'G']
      },
      display: { mac: 'Ctrl + G', win: 'Ctrl + G' },
      hint: 'Editor'
    },
    {
      id: 'vsc-fold',
      preset: 'vscode',
      category: 'Folding',
      name: 'Fold Region',
      description: 'Collapse code block or indentation level',
      keys: {
        mac: ['Alt', 'Meta', '['],
        win: ['Control', 'Shift', '[']
      },
      display: { mac: 'Option + Cmd + [', win: 'Ctrl + Shift + [' },
      hint: 'Editor'
    },
    {
      id: 'vsc-file-explorer',
      preset: 'vscode',
      category: 'View',
      name: 'Focus Explorer',
      description: 'Show and focus primary sidebar file explorer',
      keys: {
        mac: ['Meta', 'Shift', 'E'],
        win: ['Control', 'Shift', 'E']
      },
      display: { mac: 'Cmd + Shift + E', win: 'Ctrl + Shift + E' },
      hint: 'Global'
    }
  ],

  figma: [
    {
      id: 'figma-autolayout',
      preset: 'figma',
      category: 'Layout',
      name: 'Add Auto Layout',
      description: 'Wrap selection in responsive flex container',
      keys: {
        mac: ['Shift', 'A'],
        win: ['Shift', 'A']
      },
      display: { mac: 'Shift + A', win: 'Shift + A' },
      hint: 'Selection'
    },
    {
      id: 'figma-remove-autolayout',
      preset: 'figma',
      category: 'Layout',
      name: 'Remove Auto Layout',
      description: 'Strip flex layout and revert to fixed coordinates',
      keys: {
        mac: ['Alt', 'Shift', 'A'],
        win: ['Alt', 'Shift', 'A']
      },
      display: { mac: 'Option + Shift + A', win: 'Alt + Shift + A' },
      hint: 'Frame'
    },
    {
      id: 'figma-frame',
      preset: 'figma',
      category: 'Creation',
      name: 'Create Frame',
      description: 'Activate the Frame drawing tool',
      keys: {
        mac: ['F'],
        win: ['F']
      },
      display: { mac: 'F', win: 'F' },
      hint: 'Canvas'
    },
    {
      id: 'figma-group',
      preset: 'figma',
      category: 'Organization',
      name: 'Group Selection',
      description: 'Bundle active items inside a group folder',
      keys: {
        mac: ['Meta', 'G'],
        win: ['Control', 'G']
      },
      display: { mac: 'Cmd + G', win: 'Ctrl + G' },
      hint: 'Selection'
    },
    {
      id: 'figma-component',
      preset: 'figma',
      category: 'Design System',
      name: 'Create Component',
      description: 'Turn selection into a reusable master component',
      keys: {
        mac: ['Alt', 'Meta', 'K'],
        win: ['Control', 'Alt', 'K']
      },
      display: { mac: 'Option + Cmd + K', win: 'Ctrl + Alt + K' },
      hint: 'Selection'
    },
    {
      id: 'figma-rulers',
      preset: 'figma',
      category: 'View',
      name: 'Toggle Rulers',
      description: 'Show or hide pixel measurement rulers and guide markers',
      keys: {
        mac: ['Shift', 'R'],
        win: ['Shift', 'R']
      },
      display: { mac: 'Shift + R', win: 'Shift + R' },
      hint: 'Canvas'
    },
    {
      id: 'figma-zoom-fit',
      preset: 'figma',
      category: 'Navigation',
      name: 'Zoom to Fit',
      description: 'Frame all canvas content within the viewport',
      keys: {
        mac: ['Shift', '1'],
        win: ['Shift', '1']
      },
      display: { mac: 'Shift + 1', win: 'Shift + 1' },
      hint: 'Canvas'
    },
    {
      id: 'figma-zoom-selection',
      preset: 'figma',
      category: 'Navigation',
      name: 'Zoom to Selection',
      description: 'Center and zoom directly on selected layers',
      keys: {
        mac: ['Shift', '2'],
        win: ['Shift', '2']
      },
      display: { mac: 'Shift + 2', win: 'Shift + 2' },
      hint: 'Selection'
    },
    {
      id: 'figma-toggle-ui',
      preset: 'figma',
      category: 'View',
      name: 'Show / Hide UI',
      description: 'Clean distraction-free full screen presentation view',
      keys: {
        mac: ['Meta', '\\'],
        win: ['Control', '\\']
      },
      display: { mac: 'Cmd + \\', win: 'Ctrl + \\' },
      hint: 'Canvas'
    },
    {
      id: 'figma-color-picker',
      preset: 'figma',
      category: 'Styling',
      name: 'Eyedropper / Pick Color',
      description: 'Sample fill color directly from any canvas pixel',
      keys: {
        mac: ['I'],
        win: ['I']
      },
      display: { mac: 'I', win: 'I' },
      hint: 'Canvas'
    },
    {
      id: 'figma-duplicate',
      preset: 'figma',
      category: 'Editing',
      name: 'Duplicate In-Place',
      description: 'Clone selected object with smart offset',
      keys: {
        mac: ['Meta', 'D'],
        win: ['Control', 'D']
      },
      display: { mac: 'Cmd + D', win: 'Ctrl + D' },
      hint: 'Selection'
    },
    {
      id: 'figma-flatten',
      preset: 'figma',
      category: 'Vector',
      name: 'Flatten Layers',
      description: 'Merge multiple vector nodes into a single vector layer',
      keys: {
        mac: ['Meta', 'E'],
        win: ['Control', 'E']
      },
      display: { mac: 'Cmd + E', win: 'Ctrl + E' },
      hint: 'Vectors'
    },
    {
      id: 'figma-detach',
      preset: 'figma',
      category: 'Design System',
      name: 'Detach Instance',
      description: 'Sever link from parent component to edit freely',
      keys: {
        mac: ['Alt', 'Meta', 'B'],
        win: ['Control', 'Alt', 'B']
      },
      display: { mac: 'Option + Cmd + B', win: 'Ctrl + Alt + B' },
      hint: 'Component Instance'
    },
    {
      id: 'figma-bring-front',
      preset: 'figma',
      category: 'Arrangement',
      name: 'Bring to Front',
      description: 'Elevate selected layer to highest stacking z-index',
      keys: {
        mac: ['Meta', ']'],
        win: ['Control', ']']
      },
      display: { mac: 'Cmd + ]', win: 'Ctrl + ]' },
      hint: 'Layer Stack'
    }
  ],

  blender: [
    {
      id: 'blender-extrude',
      preset: 'blender',
      category: 'Mesh Modeling',
      name: 'Extrude Region',
      description: 'Pull new geometry outward along normals',
      keys: {
        mac: ['E'],
        win: ['E']
      },
      display: { mac: 'E', win: 'E' },
      hint: 'Edit Mode'
    },
    {
      id: 'blender-loopcut',
      preset: 'blender',
      category: 'Mesh Modeling',
      name: 'Loop Cut & Slide',
      description: 'Insert an edge loop ring through quadrilateral faces',
      keys: {
        mac: ['Control', 'R'],
        win: ['Control', 'R']
      },
      display: { mac: 'Ctrl + R', win: 'Ctrl + R' },
      hint: 'Edit Mode'
    },
    {
      id: 'blender-inset',
      preset: 'blender',
      category: 'Mesh Modeling',
      name: 'Inset Faces',
      description: 'Create an internal concentric offset face loop',
      keys: {
        mac: ['I'],
        win: ['I']
      },
      display: { mac: 'I', win: 'I' },
      hint: 'Edit Mode'
    },
    {
      id: 'blender-bevel',
      preset: 'blender',
      category: 'Mesh Modeling',
      name: 'Bevel Edges / Vertices',
      description: 'Chamfer or round selected hard geometry edges',
      keys: {
        mac: ['Control', 'B'],
        win: ['Control', 'B']
      },
      display: { mac: 'Ctrl + B', win: 'Ctrl + B' },
      hint: 'Edit Mode'
    },
    {
      id: 'blender-shading',
      preset: 'blender',
      category: 'Viewport',
      name: 'Shading Pie Menu',
      description: 'Switch Wireframe, Solid, Material Preview & Rendered',
      keys: {
        mac: ['Z'],
        win: ['Z']
      },
      display: { mac: 'Z', win: 'Z' },
      hint: '3D Viewport'
    },
    {
      id: 'blender-snap',
      preset: 'blender',
      category: 'Snapping',
      name: 'Snap Pie Menu',
      description: 'Cursor to Selected, Selection to Grid / Cursor',
      keys: {
        mac: ['Shift', 'S'],
        win: ['Shift', 'S']
      },
      display: { mac: 'Shift + S', win: 'Shift + S' },
      hint: '3D Viewport'
    },
    {
      id: 'blender-knife',
      preset: 'blender',
      category: 'Mesh Modeling',
      name: 'Knife Tool',
      description: 'Freehand polygonal slice cutting across geometry',
      keys: {
        mac: ['K'],
        win: ['K']
      },
      display: { mac: 'K', win: 'K' },
      hint: 'Edit Mode'
    },
    {
      id: 'blender-search',
      preset: 'blender',
      category: 'Navigation',
      name: 'Menu Search / Operator',
      description: 'Search any tool, operator, modifier or script',
      keys: {
        mac: ['F3'],
        win: ['F3']
      },
      display: { mac: 'F3', win: 'F3' },
      hint: 'Global'
    },
    {
      id: 'blender-grab',
      preset: 'blender',
      category: 'Transform',
      name: 'Move / Translate',
      description: 'Activate translation transform manipulator',
      keys: {
        mac: ['G'],
        win: ['G']
      },
      display: { mac: 'G', win: 'G' },
      hint: '3D Viewport'
    },
    {
      id: 'blender-rotate',
      preset: 'blender',
      category: 'Transform',
      name: 'Rotate',
      description: 'Activate rotation transform around active pivot',
      keys: {
        mac: ['R'],
        win: ['R']
      },
      display: { mac: 'R', win: 'R' },
      hint: '3D Viewport'
    },
    {
      id: 'blender-scale',
      preset: 'blender',
      category: 'Transform',
      name: 'Scale',
      description: 'Activate scale proportional transform',
      keys: {
        mac: ['S'],
        win: ['S']
      },
      display: { mac: 'S', win: 'S' },
      hint: '3D Viewport'
    },
    {
      id: 'blender-apply',
      preset: 'blender',
      category: 'Transform',
      name: 'Apply Transforms',
      description: 'Bake scale, rotation or location into mesh data',
      keys: {
        mac: ['Control', 'A'],
        win: ['Control', 'A']
      },
      display: { mac: 'Ctrl + A', win: 'Ctrl + A' },
      hint: 'Object Mode'
    },
    {
      id: 'blender-duplicate',
      preset: 'blender',
      category: 'Creation',
      name: 'Duplicate Linked',
      description: 'Duplicate mesh or objects with live shared data block',
      keys: {
        mac: ['Shift', 'D'],
        win: ['Shift', 'D']
      },
      display: { mac: 'Shift + D', win: 'Shift + D' },
      hint: '3D Viewport'
    },
    {
      id: 'blender-join',
      preset: 'blender',
      category: 'Organization',
      name: 'Join Objects',
      description: 'Merge multiple selected objects into single active mesh',
      keys: {
        mac: ['Control', 'J'],
        win: ['Control', 'J']
      },
      display: { mac: 'Ctrl + J', win: 'Ctrl + J' },
      hint: 'Object Mode'
    }
  ],

  excel: [
    {
      id: 'excel-format-cells',
      preset: 'excel',
      category: 'Formatting',
      name: 'Format Cells Dialog',
      description: 'Open number, alignment, font, and border properties',
      keys: {
        mac: ['Meta', '1'],
        win: ['Control', '1']
      },
      display: { mac: 'Cmd + 1', win: 'Ctrl + 1' },
      hint: 'Workbook'
    },
    {
      id: 'excel-autosum',
      preset: 'excel',
      category: 'Formulas',
      name: 'Insert AutoSum',
      description: 'Automatically populate formula with =SUM(range)',
      keys: {
        mac: ['Alt', '='],
        win: ['Alt', '=']
      },
      display: { mac: 'Option + =', win: 'Alt + =' },
      hint: 'Active Cell'
    },
    {
      id: 'excel-select-col',
      preset: 'excel',
      category: 'Selection',
      name: 'Select Entire Column',
      description: 'Select all cells in the current column (A:A)',
      keys: {
        mac: ['Control', 'Space'],
        win: ['Control', 'Space']
      },
      display: { mac: 'Ctrl + Space', win: 'Ctrl + Space' },
      hint: 'Grid'
    },
    {
      id: 'excel-select-row',
      preset: 'excel',
      category: 'Selection',
      name: 'Select Entire Row',
      description: 'Select all cells in the current row (1:1)',
      keys: {
        mac: ['Shift', 'Space'],
        win: ['Shift', 'Space']
      },
      display: { mac: 'Shift + Space', win: 'Shift + Space' },
      hint: 'Grid'
    },
    {
      id: 'excel-edge-down',
      preset: 'excel',
      category: 'Navigation',
      name: 'Jump to Edge Down',
      description: 'Navigate straight to lowest continuous data boundary',
      keys: {
        mac: ['Meta', 'ArrowDown'],
        win: ['Control', 'ArrowDown']
      },
      display: { mac: 'Cmd + Down', win: 'Ctrl + Down' },
      hint: 'Data Block'
    },
    {
      id: 'excel-fill-down',
      preset: 'excel',
      category: 'Editing',
      name: 'Fill Down',
      description: 'Copy value and formula from upper cell into selection',
      keys: {
        mac: ['Meta', 'D'],
        win: ['Control', 'D']
      },
      display: { mac: 'Cmd + D', win: 'Ctrl + D' },
      hint: 'Column Selection'
    },
    {
      id: 'excel-insert-table',
      preset: 'excel',
      category: 'Data',
      name: 'Create / Convert Table',
      description: 'Convert range to structured Excel table with sorting',
      keys: {
        mac: ['Meta', 'T'],
        win: ['Control', 'T']
      },
      display: { mac: 'Cmd + T', win: 'Ctrl + T' },
      hint: 'Data Range'
    },
    {
      id: 'excel-new-sheet',
      preset: 'excel',
      category: 'Workbook',
      name: 'Insert New Worksheet',
      description: 'Add a fresh blank worksheet to current workbook',
      keys: {
        mac: ['Shift', 'F11'],
        win: ['Shift', 'F11']
      },
      display: { mac: 'Shift + F11', win: 'Shift + F11' },
      hint: 'Global'
    },
    {
      id: 'excel-edit-cell',
      preset: 'excel',
      category: 'Editing',
      name: 'Edit Active Cell',
      description: 'Position text cursor at end of cell contents',
      keys: {
        mac: ['F2'],
        win: ['F2']
      },
      display: { mac: 'F2', win: 'F2' },
      hint: 'Cell'
    },
    {
      id: 'excel-hide-col',
      preset: 'excel',
      category: 'Rows & Columns',
      name: 'Hide Current Column',
      description: 'Collapse selected column without deleting data',
      keys: {
        mac: ['Control', '0'],
        win: ['Control', '0']
      },
      display: { mac: 'Ctrl + 0', win: 'Ctrl + 0' },
      hint: 'Column'
    },
    {
      id: 'excel-current-date',
      preset: 'excel',
      category: 'Formulas',
      name: 'Insert Current Date',
      description: 'Timestamp static current date into active cell',
      keys: {
        mac: ['Control', ';'],
        win: ['Control', ';']
      },
      display: { mac: 'Ctrl + ;', win: 'Ctrl + ;' },
      hint: 'Cell'
    },
    {
      id: 'excel-strike',
      preset: 'excel',
      category: 'Formatting',
      name: 'Strikethrough Font',
      description: 'Toggle horizontal strikethrough line on font',
      keys: {
        mac: ['Meta', 'Shift', 'X'],
        win: ['Control', '5']
      },
      display: { mac: 'Cmd + Shift + X', win: 'Ctrl + 5' },
      hint: 'Formatting'
    },
    {
      id: 'excel-flash-fill',
      preset: 'excel',
      category: 'Data',
      name: 'Flash Fill / Pattern Fill',
      description: 'Intelligently infer and auto-complete column values',
      keys: {
        mac: ['Control', 'E'],
        win: ['Control', 'E']
      },
      display: { mac: 'Ctrl + E', win: 'Ctrl + E' },
      hint: 'Column'
    }
  ]
};
