export const PRESET_COLORS = [
  '#000000', '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899', '#ffffff',
];

export const FONTS = [
  'DM Sans',
  'Bebas Neue',
  'Playfair Display',
  'Righteous',
  'Black Ops One',
  'Permanent Marker',
  'Rubik Mono One',
  'Pacifico',
  'Oswald',
  'Archivo Black',
] as const;

export const ANIMATIONS = ['none', 'float', 'spin', 'pulse', 'wobble', 'spinFloat', 'swing'] as const;
export const MATERIALS = ['default', 'plastic', 'metal', 'glass', 'rubber', 'chrome', 'gold', 'clay', 'emissive', 'holographic'] as const;
export type AnimationType = typeof ANIMATIONS[number];
export type MaterialPreset = typeof MATERIALS[number];

export const MATERIAL_DEFAULTS: Record<MaterialPreset, {
  metalness: number;
  roughness: number;
  opacity: number;
}> = {
  default: { metalness: 0.15, roughness: 0.35, opacity: 1 },
  plastic: { metalness: 0, roughness: 0.3, opacity: 1 },
  metal: { metalness: 0.9, roughness: 0.2, opacity: 1 },
  glass: { metalness: 0.1, roughness: 0.05, opacity: 0.35 },
  rubber: { metalness: 0, roughness: 0.9, opacity: 1 },
  chrome: { metalness: 1, roughness: 0.05, opacity: 1 },
  gold: { metalness: 1, roughness: 0.25, opacity: 1 },
  clay: { metalness: 0, roughness: 1, opacity: 1 },
  emissive: { metalness: 0, roughness: 0.5, opacity: 1 },
  holographic: { metalness: 0.8, roughness: 0.1, opacity: 0.7 },
};

export const STAR_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="black"/></svg>`;

export const DEFAULT_SVG = STAR_SVG;

export const DEFAULT_SETTINGS = {
  // Input
  activePanel: 'draw' as 'draw' | 'text' | 'code' | 'upload' | 'model' | null,
  contentMode: 'svg' as 'svg' | 'text' | 'model',
  svgString: '' as string,
  pixelGrid: Array.from({ length: 24 }, () => Array(24).fill(false)) as boolean[][],
  textInput: '',
  selectedFont: 'DM Sans',
  modelUrl: undefined as string | undefined,
  modelFileName: undefined as string | undefined,
  modelFormat: undefined as 'glb' | 'gltf' | 'obj' | undefined,
  useOriginalModelMaterials: true,

  // Object
  objectColor: '#e11d48',
  depth: 1.0,
  smoothness: 0.6,
  zoom: 8.0,

  // Background
  backgroundColor: '#0f172a',

  // Material
  material: 'default' as MaterialPreset,
  metalness: undefined as number | undefined,
  roughness: undefined as number | undefined,
  opacity: undefined as number | undefined,
  wireframe: false,

  // Texture
  texture: undefined as string | undefined,
  textureRepeat: 1,
  textureRotation: 0,
  textureOffset: [0, 0] as [number, number],

  // Animation
  animation: 'float' as AnimationType,
  animationSpeed: 1.0,
  animateReverse: false,

  // Lighting
  lightPosition: [5, 8, 5] as [number, number, number],
  lightIntensity: 1.2,
  ambientIntensity: 0.3,
  shadow: true,

  // Interaction
  interactive: true,
  cursorOrbit: true,
  orbitStrength: 0.15,
  draggable: true,
  scrollZoom: false,
  resetOnIdle: false,
  resetDelay: 2,

  // UI
  settingsOpen: false,
  exportMode: 'image' as 'image' | 'video' | 'auto',
  isRecording: false,
  embedModalOpen: false,
  feedbackOpen: false,
  isLoading: false,
  loadingProgress: 0,
  resetKey: 0,
};

export type AppState = typeof DEFAULT_SETTINGS;
