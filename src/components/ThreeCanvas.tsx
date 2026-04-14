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
import { DEFAULT_SVG, type AnimationType, type MaterialPreset } from '@/lib/defaults';

type CanvasWithCaptureStream = HTMLCanvasElement & {
  captureStream?: (fps?: number) => MediaStream;
};

const SVG3D = dynamic(
  () => import('3dsvg').then((m) => ({ default: m.SVG3D })),
  {
    ssr: false,
    loading: () => <div className="w-full h-full" style={{ background: '#6961ff' }} />,
  }
);

const SceneBackgroundSync = dynamic(
  () => import('./SceneBackgroundSync').then((m) => ({ default: m.SceneBackgroundSync })),
  {
    ssr: false,
    loading: () => null,
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
    if (recorderRef.current && recorderRef.current.state !== 'inactive') return;
    const captureStream = (canvas as CanvasWithCaptureStream).captureStream;
    if (typeof captureStream !== 'function' || typeof MediaRecorder === 'undefined') {
      console.error('Canvas recording is not supported in this browser.');
      return;
    }

    const stream = captureStream.call(canvas, 60);
    const mimeType = ['video/webm;codecs=vp9', 'video/webm'].find((type) =>
      MediaRecorder.isTypeSupported(type)
    );
    let recorder: MediaRecorder;
    try {
      recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
    } catch (event) {
      console.error('Could not start video recording:', event);
      stream.getTracks().forEach((track) => track.stop());
      return;
    }
    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };
    recorder.onstop = () => {
      recorderRef.current = null;
      dispatch({ type: 'SET_RECORDING', recording: false });
      stream.getTracks().forEach((track) => track.stop());
      if (chunks.length === 0) return;

      const blob = new Blob(chunks, { type: mimeType ?? 'video/webm' });
      if (blob.size === 0) return;

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sculptr-render.webm';
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 0);
    };
    recorder.onerror = (event) => {
      console.error('Could not record video:', event);
      recorderRef.current = null;
      dispatch({ type: 'SET_RECORDING', recording: false });
      stream.getTracks().forEach((track) => track.stop());
    };
    try {
      recorder.start();
    } catch (event) {
      console.error('Could not start video recording:', event);
      stream.getTracks().forEach((track) => track.stop());
      return;
    }
    recorderRef.current = recorder;
    dispatch({ type: 'SET_RECORDING', recording: true });
  }, [dispatch]);

  const stopRecording = useCallback(() => {
    const recorder = recorderRef.current;
    if (!recorder) return;
    if (recorder.state === 'inactive') {
      recorderRef.current = null;
      dispatch({ type: 'SET_RECORDING', recording: false });
      return;
    }
    recorder.stop();
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
    <div className="absolute inset-0" style={{ background: backgroundColor }}>
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
        animate={animation as AnimationType}
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
      >
        <SceneBackgroundSync color={backgroundColor} />
      </SVG3D>
    </div>
  );
});

ThreeCanvas.displayName = 'ThreeCanvas';

export { ThreeCanvas };
export type { RefObject };
