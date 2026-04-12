'use client';

import { createContext, useContext, useReducer, type ReactNode, createElement } from 'react';
import { DEFAULT_SETTINGS, type AppState } from '@/lib/defaults';
import { svgFromPixels, createEmptyGrid, createHeartGrid } from '@/lib/svgFromPixels';

type Action =
  | { type: 'SET_ACTIVE_PANEL'; panel: AppState['activePanel'] }
  | { type: 'SET_SVG'; svg: string }
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
  | { type: 'SET_MATERIAL'; material: string }
  | { type: 'SET_METALNESS'; metalness: number | undefined }
  | { type: 'SET_ROUGHNESS'; roughness: number | undefined }
  | { type: 'SET_OPACITY'; opacity: number | undefined }
  | { type: 'SET_WIREFRAME'; wireframe: boolean }
  | { type: 'SET_TEXTURE'; texture: string | undefined }
  | { type: 'SET_TEXTURE_REPEAT'; repeat: number }
  | { type: 'SET_TEXTURE_ROTATION'; rotation: number }
  | { type: 'SET_TEXTURE_OFFSET'; offset: [number, number] }
  | { type: 'SET_ANIMATION'; animation: string }
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
  | { type: 'RESET_POSITION' };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_ACTIVE_PANEL':
      return { ...state, activePanel: action.panel === state.activePanel ? null : action.panel };
    case 'SET_SVG':
      return { ...state, svgString: action.svg };
    case 'SET_PIXEL': {
      const grid = state.pixelGrid.map((r, ri) =>
        ri === action.row ? r.map((c, ci) => (ci === action.col ? action.value : c)) : r
      );
      return { ...state, pixelGrid: grid, svgString: svgFromPixels(grid) };
    }
    case 'CLEAR_GRID': {
      const grid = createEmptyGrid();
      return { ...state, pixelGrid: grid, svgString: '' };
    }
    case 'SET_GRID': {
      return { ...state, pixelGrid: action.grid, svgString: svgFromPixels(action.grid) };
    }
    case 'SET_TEXT_INPUT':
      return { ...state, textInput: action.text };
    case 'SET_FONT':
      return { ...state, selectedFont: action.font };
    case 'SET_OBJECT_COLOR':
      return { ...state, objectColor: action.color };
    case 'SET_DEPTH':
      return { ...state, depth: action.depth };
    case 'SET_SMOOTHNESS':
      return { ...state, smoothness: action.smoothness };
    case 'SET_ZOOM':
      return { ...state, zoom: action.zoom };
    case 'SET_BG_COLOR':
      return { ...state, backgroundColor: action.color };
    case 'SET_MATERIAL':
      return { ...state, material: action.material };
    case 'SET_METALNESS':
      return { ...state, metalness: action.metalness };
    case 'SET_ROUGHNESS':
      return { ...state, roughness: action.roughness };
    case 'SET_OPACITY':
      return { ...state, opacity: action.opacity };
    case 'SET_WIREFRAME':
      return { ...state, wireframe: action.wireframe };
    case 'SET_TEXTURE':
      return { ...state, texture: action.texture };
    case 'SET_TEXTURE_REPEAT':
      return { ...state, textureRepeat: action.repeat };
    case 'SET_TEXTURE_ROTATION':
      return { ...state, textureRotation: action.rotation };
    case 'SET_TEXTURE_OFFSET':
      return { ...state, textureOffset: action.offset };
    case 'SET_ANIMATION':
      return { ...state, animation: action.animation };
    case 'SET_ANIMATION_SPEED':
      return { ...state, animationSpeed: action.speed };
    case 'SET_ANIMATE_REVERSE':
      return { ...state, animateReverse: action.reverse };
    case 'SET_LIGHT_POSITION':
      return { ...state, lightPosition: action.position };
    case 'SET_LIGHT_INTENSITY':
      return { ...state, lightIntensity: action.intensity };
    case 'SET_AMBIENT_INTENSITY':
      return { ...state, ambientIntensity: action.intensity };
    case 'SET_SHADOW':
      return { ...state, shadow: action.shadow };
    case 'SET_INTERACTIVE':
      return { ...state, interactive: action.interactive };
    case 'SET_CURSOR_ORBIT':
      return { ...state, cursorOrbit: action.cursorOrbit };
    case 'SET_ORBIT_STRENGTH':
      return { ...state, orbitStrength: action.strength };
    case 'SET_DRAGGABLE':
      return { ...state, draggable: action.draggable };
    case 'SET_SCROLL_ZOOM':
      return { ...state, scrollZoom: action.scrollZoom };
    case 'SET_RESET_ON_IDLE':
      return { ...state, resetOnIdle: action.resetOnIdle };
    case 'SET_RESET_DELAY':
      return { ...state, resetDelay: action.delay };
    case 'TOGGLE_SETTINGS':
      return { ...state, settingsOpen: !state.settingsOpen };
    case 'CLOSE_SETTINGS':
      return { ...state, settingsOpen: false };
    case 'SET_EXPORT_MODE':
      return { ...state, exportMode: action.mode };
    case 'SET_RECORDING':
      return { ...state, isRecording: action.recording };
    case 'TOGGLE_EMBED_MODAL':
      return { ...state, embedModalOpen: !state.embedModalOpen };
    case 'CLOSE_EMBED_MODAL':
      return { ...state, embedModalOpen: false };
    case 'TOGGLE_FEEDBACK':
      return { ...state, feedbackOpen: !state.feedbackOpen };
    case 'SET_LOADING':
      return { ...state, isLoading: action.loading, loadingProgress: action.progress };
    case 'RESET_POSITION':
      return { ...state, zoom: DEFAULT_SETTINGS.zoom, resetKey: state.resetKey + 1 };
    default:
      return state;
  }
}

const initialState: AppState = {
  ...DEFAULT_SETTINGS,
  pixelGrid: createHeartGrid(),
  svgString: svgFromPixels(createHeartGrid()),
};

type AppContextValue = { state: AppState; dispatch: React.Dispatch<Action> };
const AppContext = createContext<AppContextValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return createElement(AppContext.Provider, { value: { state, dispatch } }, children);
}

export function useAppState() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
}
