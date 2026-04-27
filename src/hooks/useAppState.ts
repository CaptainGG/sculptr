'use client';

import { createContext, useContext, useReducer, useEffect, useRef, type ReactNode, createElement } from 'react';
import { DEFAULT_SETTINGS, type AppState } from '@/lib/defaults';
import { svgFromPixels, createEmptyGrid, createHeartGrid } from '@/lib/svgFromPixels';

type GridSnapshot = { pixelGrid: boolean[][]; svgString: string };
const MAX_HISTORY = 50;

type Action =
  | { type: 'SET_ACTIVE_PANEL'; panel: AppState['activePanel'] }
  | { type: 'SET_SVG'; svg: string }
  | { type: 'SET_MODEL'; url: string; fileName: string; format: NonNullable<AppState['modelFormat']> }
  | { type: 'CLEAR_MODEL' }
  | { type: 'SET_USE_ORIGINAL_MODEL_MATERIALS'; useOriginal: boolean }
  | { type: 'SET_PIXEL'; row: number; col: number; value: boolean }
  | { type: 'CLEAR_GRID' }
  | { type: 'SET_GRID'; grid: boolean[][] }
  | { type: 'SET_TEXT_INPUT'; text: string }
  | { type: 'SET_FONT'; font: string }
  | { type: 'SET_OBJECT_COLOR'; color: string }
  | { type: 'SET_DEPTH'; depth: number }
  | { type: 'SET_SMOOTHNESS'; smoothness: number }
  | { type: 'SET_ZOOM'; zoom: number }
  | { type: 'SET_BG_COLOR'; color: string }
  | { type: 'SET_MATERIAL'; material: AppState['material'] }
  | { type: 'SET_METALNESS'; metalness: number | undefined }
  | { type: 'SET_ROUGHNESS'; roughness: number | undefined }
  | { type: 'SET_OPACITY'; opacity: number | undefined }
  | { type: 'SET_WIREFRAME'; wireframe: boolean }
  | { type: 'SET_TEXTURE'; texture: string | undefined }
  | { type: 'SET_TEXTURE_REPEAT'; repeat: number }
  | { type: 'SET_TEXTURE_ROTATION'; rotation: number }
  | { type: 'SET_TEXTURE_OFFSET'; offset: [number, number] }
  | { type: 'SET_ANIMATION'; animation: AppState['animation'] }
  | { type: 'SET_ANIMATION_SPEED'; speed: number }
  | { type: 'SET_ANIMATE_REVERSE'; reverse: boolean }
  | { type: 'SET_LIGHT_POSITION'; position: [number, number, number] }
  | { type: 'SET_LIGHT_INTENSITY'; intensity: number }
  | { type: 'SET_AMBIENT_INTENSITY'; intensity: number }
  | { type: 'SET_SHADOW'; shadow: boolean }
  | { type: 'SET_INTERACTIVE'; interactive: boolean }
  | { type: 'SET_CURSOR_ORBIT'; cursorOrbit: boolean }
  | { type: 'SET_ORBIT_STRENGTH'; strength: number }
  | { type: 'SET_DRAGGABLE'; draggable: boolean }
  | { type: 'SET_SCROLL_ZOOM'; scrollZoom: boolean }
  | { type: 'SET_RESET_ON_IDLE'; resetOnIdle: boolean }
  | { type: 'SET_RESET_DELAY'; delay: number }
  | { type: 'TOGGLE_SETTINGS' }
  | { type: 'CLOSE_SETTINGS' }
  | { type: 'SET_EXPORT_MODE'; mode: AppState['exportMode'] }
  | { type: 'SET_RECORDING'; recording: boolean }
  | { type: 'TOGGLE_EMBED_MODAL' }
  | { type: 'CLOSE_EMBED_MODAL' }
  | { type: 'TOGGLE_FEEDBACK' }
  | { type: 'SET_LOADING'; loading: boolean; progress: number }
  | { type: 'RESET_POSITION' }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'COMMIT_GRID_SNAPSHOT' }
  | { type: 'HYDRATE'; state: Partial<AppState> };

type StateWithHistory = {
  app: AppState;
  past: GridSnapshot[];
  future: GridSnapshot[];
};

function pushSnapshot(past: GridSnapshot[], state: AppState): GridSnapshot[] {
  const snapshot = { pixelGrid: state.pixelGrid, svgString: state.svgString };
  const next = [...past, snapshot];
  return next.length > MAX_HISTORY ? next.slice(next.length - MAX_HISTORY) : next;
}

function reducer(state: StateWithHistory, action: Action): StateWithHistory {
  const { app } = state;

  switch (action.type) {
    case 'SET_ACTIVE_PANEL': {
      const nextPanel = action.panel === app.activePanel ? null : action.panel;
      const nextMode =
        nextPanel === 'model' ? 'model' :
        nextPanel === 'text' ? 'text' :
        nextPanel === 'draw' || nextPanel === 'code' || nextPanel === 'upload' ? 'svg' :
        app.contentMode;
      return { ...state, app: { ...app, activePanel: nextPanel, contentMode: nextMode } };
    }
    case 'SET_SVG':
      return { ...state, app: { ...app, svgString: action.svg, contentMode: 'svg' } };
    case 'SET_MODEL':
      return {
        ...state,
        app: {
          ...app,
          modelUrl: action.url,
          modelFileName: action.fileName,
          modelFormat: action.format,
          contentMode: 'model',
        },
      };
    case 'CLEAR_MODEL':
      return {
        ...state,
        app: {
          ...app,
          modelUrl: undefined,
          modelFileName: undefined,
          modelFormat: undefined,
          contentMode: app.contentMode === 'model' ? 'svg' : app.contentMode,
        },
      };
    case 'SET_USE_ORIGINAL_MODEL_MATERIALS':
      return { ...state, app: { ...app, useOriginalModelMaterials: action.useOriginal } };
    case 'SET_PIXEL': {
      const grid = app.pixelGrid.map((r, ri) =>
        ri === action.row ? r.map((c, ci) => (ci === action.col ? action.value : c)) : r
      );
      return { ...state, app: { ...app, pixelGrid: grid, svgString: svgFromPixels(grid), contentMode: 'svg' } };
    }
    case 'COMMIT_GRID_SNAPSHOT':
      return { ...state, past: pushSnapshot(state.past, app), future: [] };
    case 'CLEAR_GRID': {
      const grid = createEmptyGrid();
      return {
        ...state,
        past: pushSnapshot(state.past, app),
        future: [],
        app: { ...app, pixelGrid: grid, svgString: '', contentMode: 'svg' },
      };
    }
    case 'SET_GRID':
      return {
        ...state,
        past: pushSnapshot(state.past, app),
        future: [],
        app: { ...app, pixelGrid: action.grid, svgString: svgFromPixels(action.grid), contentMode: 'svg' },
      };
    case 'UNDO': {
      if (state.past.length === 0) return state;
      const prev = state.past[state.past.length - 1];
      const currentSnapshot: GridSnapshot = { pixelGrid: app.pixelGrid, svgString: app.svgString };
      return {
        ...state,
        past: state.past.slice(0, -1),
        future: [...state.future, currentSnapshot],
        app: { ...app, pixelGrid: prev.pixelGrid, svgString: prev.svgString, contentMode: 'svg' },
      };
    }
    case 'REDO': {
      if (state.future.length === 0) return state;
      const next = state.future[state.future.length - 1];
      const currentSnapshot: GridSnapshot = { pixelGrid: app.pixelGrid, svgString: app.svgString };
      return {
        ...state,
        past: [...state.past, currentSnapshot],
        future: state.future.slice(0, -1),
        app: { ...app, pixelGrid: next.pixelGrid, svgString: next.svgString, contentMode: 'svg' },
      };
    }
    case 'HYDRATE':
      return { ...state, app: { ...app, ...action.state } };
    case 'SET_TEXT_INPUT':
      return { ...state, app: { ...app, textInput: action.text, contentMode: 'text' } };
    case 'SET_FONT':
      return { ...state, app: { ...app, selectedFont: action.font } };
    case 'SET_OBJECT_COLOR':
      return { ...state, app: { ...app, objectColor: action.color } };
    case 'SET_DEPTH':
      return { ...state, app: { ...app, depth: action.depth } };
    case 'SET_SMOOTHNESS':
      return { ...state, app: { ...app, smoothness: action.smoothness } };
    case 'SET_ZOOM':
      return { ...state, app: { ...app, zoom: action.zoom } };
    case 'SET_BG_COLOR':
      return { ...state, app: { ...app, backgroundColor: action.color } };
    case 'SET_MATERIAL':
      return { ...state, app: { ...app, material: action.material, metalness: undefined, roughness: undefined, opacity: undefined, wireframe: false } };
    case 'SET_METALNESS':
      return { ...state, app: { ...app, metalness: action.metalness } };
    case 'SET_ROUGHNESS':
      return { ...state, app: { ...app, roughness: action.roughness } };
    case 'SET_OPACITY':
      return { ...state, app: { ...app, opacity: action.opacity } };
    case 'SET_WIREFRAME':
      return { ...state, app: { ...app, wireframe: action.wireframe } };
    case 'SET_TEXTURE':
      return { ...state, app: { ...app, texture: action.texture } };
    case 'SET_TEXTURE_REPEAT':
      return { ...state, app: { ...app, textureRepeat: action.repeat } };
    case 'SET_TEXTURE_ROTATION':
      return { ...state, app: { ...app, textureRotation: action.rotation } };
    case 'SET_TEXTURE_OFFSET':
      return { ...state, app: { ...app, textureOffset: action.offset } };
    case 'SET_ANIMATION':
      return { ...state, app: { ...app, animation: action.animation } };
    case 'SET_ANIMATION_SPEED':
      return { ...state, app: { ...app, animationSpeed: action.speed } };
    case 'SET_ANIMATE_REVERSE':
      return { ...state, app: { ...app, animateReverse: action.reverse } };
    case 'SET_LIGHT_POSITION':
      return { ...state, app: { ...app, lightPosition: action.position } };
    case 'SET_LIGHT_INTENSITY':
      return { ...state, app: { ...app, lightIntensity: action.intensity } };
    case 'SET_AMBIENT_INTENSITY':
      return { ...state, app: { ...app, ambientIntensity: action.intensity } };
    case 'SET_SHADOW':
      return { ...state, app: { ...app, shadow: action.shadow } };
    case 'SET_INTERACTIVE':
      return { ...state, app: { ...app, interactive: action.interactive } };
    case 'SET_CURSOR_ORBIT':
      return { ...state, app: { ...app, cursorOrbit: action.cursorOrbit } };
    case 'SET_ORBIT_STRENGTH':
      return { ...state, app: { ...app, orbitStrength: action.strength } };
    case 'SET_DRAGGABLE':
      return { ...state, app: { ...app, draggable: action.draggable } };
    case 'SET_SCROLL_ZOOM':
      return { ...state, app: { ...app, scrollZoom: action.scrollZoom } };
    case 'SET_RESET_ON_IDLE':
      return { ...state, app: { ...app, resetOnIdle: action.resetOnIdle } };
    case 'SET_RESET_DELAY':
      return { ...state, app: { ...app, resetDelay: action.delay } };
    case 'TOGGLE_SETTINGS':
      return { ...state, app: { ...app, settingsOpen: !app.settingsOpen } };
    case 'CLOSE_SETTINGS':
      return { ...state, app: { ...app, settingsOpen: false } };
    case 'SET_EXPORT_MODE':
      return { ...state, app: { ...app, exportMode: action.mode } };
    case 'SET_RECORDING':
      return { ...state, app: { ...app, isRecording: action.recording } };
    case 'TOGGLE_EMBED_MODAL':
      return { ...state, app: { ...app, embedModalOpen: !app.embedModalOpen } };
    case 'CLOSE_EMBED_MODAL':
      return { ...state, app: { ...app, embedModalOpen: false } };
    case 'TOGGLE_FEEDBACK':
      return { ...state, app: { ...app, feedbackOpen: !app.feedbackOpen } };
    case 'SET_LOADING':
      return { ...state, app: { ...app, isLoading: action.loading, loadingProgress: action.progress } };
    case 'RESET_POSITION':
      return { ...state, app: { ...app, zoom: DEFAULT_SETTINGS.zoom, resetKey: app.resetKey + 1 } };
    default:
      return state;
  }
}

const defaultInitialState: AppState = {
  ...DEFAULT_SETTINGS,
  pixelGrid: createHeartGrid(),
  svgString: svgFromPixels(createHeartGrid()),
};

const initialStateWithHistory: StateWithHistory = {
  app: defaultInitialState,
  past: [],
  future: [],
};

const STORAGE_KEY = 'sculptr-state';

const PERSIST_KEYS: (keyof AppState)[] = [
  'activePanel', 'contentMode', 'svgString', 'pixelGrid', 'textInput', 'selectedFont',
  'objectColor', 'depth', 'smoothness', 'zoom', 'backgroundColor',
  'material', 'metalness', 'roughness', 'opacity', 'wireframe',
  'texture', 'textureRepeat', 'textureRotation', 'textureOffset',
  'animation', 'animationSpeed', 'animateReverse',
  'lightPosition', 'lightIntensity', 'ambientIntensity', 'shadow',
  'interactive', 'cursorOrbit', 'orbitStrength', 'draggable', 'scrollZoom',
  'resetOnIdle', 'resetDelay', 'useOriginalModelMaterials',
];

function saveState(state: AppState) {
  try {
    const toSave: Record<string, unknown> = {};
    for (const key of PERSIST_KEYS) {
      toSave[key] = state[key];
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch {
    // Ignore unavailable storage, quota limits, and private browsing errors.
  }
}

function loadState(): Partial<AppState> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<AppState>;
  } catch {
    return null;
  }
}

type AppContextValue = {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  canUndo: boolean;
  canRedo: boolean;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [stateWithHistory, dispatch] = useReducer(reducer, initialStateWithHistory);
  const { app: state, past, future } = stateWithHistory;
  const hydratedRef = useRef(false);

  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    const saved = loadState();
    if (saved) dispatch({ type: 'HYDRATE', state: saved });
  }, []);

  useEffect(() => {
    if (!hydratedRef.current) return;
    const timer = setTimeout(() => saveState(state), 500);
    return () => clearTimeout(timer);
  }, [state]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod || e.key.toLowerCase() !== 'z') return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      e.preventDefault();
      dispatch({ type: e.shiftKey ? 'REDO' : 'UNDO' });
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const value: AppContextValue = {
    state,
    dispatch,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
  };

  return createElement(AppContext.Provider, { value }, children);
}

export function useAppState() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
}
