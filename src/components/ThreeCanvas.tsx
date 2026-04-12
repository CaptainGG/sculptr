'use client';

import dynamic from 'next/dynamic';
import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useCallback,
  type RefObject,
} from 'react';
import { useAppState } from '@/hooks/useAppState';
import { DEFAULT_SVG } from '@/lib/defaults';

type MaterialPreset = 'default' | 'plastic' | 'metal' | 'glass' | 'rubber' | 'chrome' | 'gold' | 'clay' | 'emissive' | 'holographic';

const SVG3D = dynamic(
  () => import('3dsvg').then((m) => ({ default: m.SVG3D })),
  {
    ssr: false,
    loading: () => <div className="w-full h-full" style={{ background: '#6961ff' }} />,
  }
);

export type ThreeCanvasHandle = {
  captureImage: () => void;
  startRecording: () => void;
  stopRecording: () => void;
};

const ThreeCanvas = forwardRef<ThreeCanvasHandle>((_, ref) => {
  const { state, dispatch } = useAppState();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);

  const registerCanvas = useCallback((canvas: HTMLCanvasElement) => {
    canvasRef.current = canvas;
  }, []);

  const captureImage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sculptr-render.png';
      a.click();
    } catch {
      // If toDataURL fails (preserveDrawingBuffer not set), try after next frame
      requestAnimationFrame(() => {
        try {
          const url = canvas.toDataURL('image/png');
          const a = document.createElement('a');
          a.href = url;
          a.download = 'sculptr-render.png';
          a.click();
        } catch (e) {
          console.error('Could not capture image:', e);
        }
      });
    }
  }, []);

  const startRecording = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const stream = (canvas as HTMLCanvasElement & { captureStream: (fps: number) => MediaStream }).captureStream(60);
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : 'video/webm';
    const recorder = new MediaRecorder(stream, { mimeType });
    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sculptr-render.webm';
      a.click();
      URL.revokeObjectURL(url);
    };
    recorder.start();
    recorderRef.current = recorder;
    dispatch({ type: 'SET_RECORDING', recording: true });
  }, [dispatch]);

  const stopRecording = useCallback(() => {
    recorderRef.current?.stop();
    recorderRef.current = null;
    dispatch({ type: 'SET_RECORDING', recording: false });
  }, [dispatch]);

  useImperativeHandle(ref, () => ({
    captureImage,
    startRecording,
    stopRecording,
  }));

  const {
    svgString, textInput, selectedFont,
    objectColor, depth, smoothness, zoom, backgroundColor,
    material, metalness, roughness, opacity, wireframe,
    texture, textureRepeat, textureRotation, textureOffset,
    animation, animationSpeed, animateReverse,
    lightPosition, lightIntensity, ambientIntensity, shadow,
    interactive, cursorOrbit, orbitStrength, draggable, scrollZoom, resetOnIdle, resetDelay,
    resetKey, activePanel,
  } = state;

  // Determine content: text mode uses text+font props, others use svg prop
  const isTextMode = activePanel === 'text' && textInput.trim().length > 0;
  const svgContent = svgString || DEFAULT_SVG;

  return (
    <div className="absolute inset-0">
      <SVG3D
        {...(isTextMode
          ? { text: textInput, font: selectedFont }
          : { svg: svgContent }
        )}
        depth={depth}
        smoothness={smoothness}
        color={objectColor}
        zoom={zoom}
        background={backgroundColor}
        material={material as MaterialPreset}
        metalness={metalness}
        roughness={roughness}
        opacity={opacity}
        wireframe={wireframe}
        texture={texture}
        textureRepeat={textureRepeat}
        textureRotation={textureRotation}
        textureOffset={textureOffset}
        animate={animation as 'none' | 'spin' | 'float' | 'pulse' | 'wobble' | 'spinFloat' | 'swing'}
        animateSpeed={animationSpeed}
        animateReverse={animateReverse}
        lightPosition={lightPosition}
        lightIntensity={lightIntensity}
        ambientIntensity={ambientIntensity}
        shadow={shadow}
        interactive={interactive}
        cursorOrbit={cursorOrbit}
        orbitStrength={orbitStrength}
        draggable={draggable}
        scrollZoom={scrollZoom}
        resetOnIdle={resetOnIdle}
        resetDelay={resetDelay}
        width="100%"
        height="100%"
        registerCanvas={registerCanvas}
        resetKey={resetKey}
        onLoadingChange={(loading, progress) =>
          dispatch({ type: 'SET_LOADING', loading, progress })
        }
      />
    </div>
  );
});

ThreeCanvas.displayName = 'ThreeCanvas';

export { ThreeCanvas };
export type { RefObject };
