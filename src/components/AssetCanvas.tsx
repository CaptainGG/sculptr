'use client';

import { Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import {
  Box3,
  Color,
  DoubleSide,
  Group,
  Mesh,
  MeshPhysicalMaterial,
  Object3D,
  RepeatWrapping,
  SRGBColorSpace,
  Texture,
  TextureLoader,
  Vector2,
  Vector3,
} from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MATERIAL_DEFAULTS, type AnimationType, type MaterialPreset } from '@/lib/defaults';
import { SceneBackgroundSync } from './SceneBackgroundSync';

type ModelFormat = 'glb' | 'gltf' | 'obj';

type AssetCanvasProps = {
  url: string;
  format: ModelFormat;
  backgroundColor: string;
  zoom: number;
  objectColor: string;
  material: MaterialPreset;
  metalness: number | undefined;
  roughness: number | undefined;
  opacity: number | undefined;
  wireframe: boolean;
  texture: string | undefined;
  textureRepeat: number;
  textureRotation: number;
  textureOffset: [number, number];
  useOriginalMaterials: boolean;
  animation: AnimationType;
  animationSpeed: number;
  animateReverse: boolean;
  lightPosition: [number, number, number];
  lightIntensity: number;
  ambientIntensity: number;
  shadow: boolean;
  interactive: boolean;
  draggable: boolean;
  scrollZoom: boolean;
  registerCanvas: (canvas: HTMLCanvasElement) => void;
};

type MaterialControls = Pick<AssetCanvasProps,
  'useOriginalMaterials' | 'objectColor' | 'material' | 'metalness' |
  'roughness' | 'opacity' | 'wireframe' | 'texture' | 'textureRepeat' |
  'textureRotation' | 'textureOffset' | 'shadow'
>;

function isMesh(object: Object3D): object is Mesh {
  return (object as Mesh).isMesh === true;
}

function useOverrideTexture(
  textureUrl: string | undefined,
  repeat: number,
  rotation: number,
  offset: [number, number]
) {
  const [texture, setTexture] = useState<Texture | null>(null);

  useEffect(() => {
    if (!textureUrl) {
      setTexture(null);
      return;
    }

    let cancelled = false;
    let loadedTexture: Texture | null = null;
    const loader = new TextureLoader();
    loader.setCrossOrigin('anonymous');
    loader.load(
      textureUrl,
      (nextTexture) => {
        loadedTexture = nextTexture;
        if (cancelled) {
          nextTexture.dispose();
          return;
        }
        setTexture(nextTexture);
      },
      undefined,
      () => {
        if (!cancelled) setTexture(null);
      }
    );

    return () => {
      cancelled = true;
      loadedTexture?.dispose();
    };
  }, [textureUrl]);

  useEffect(() => {
    if (!texture) return;
    texture.colorSpace = SRGBColorSpace;
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    texture.repeat.set(repeat, repeat);
    texture.rotation = rotation;
    texture.offset.set(offset[0], offset[1]);
    texture.center = new Vector2(0.5, 0.5);
    texture.needsUpdate = true;
  }, [offset, repeat, rotation, texture]);

  return texture;
}

function createOverrideMaterial({
  color,
  material,
  metalness,
  roughness,
  opacity,
  wireframe,
  textureMap,
}: {
  color: string;
  material: MaterialPreset;
  metalness?: number;
  roughness?: number;
  opacity?: number;
  wireframe: boolean;
  textureMap: Texture | null;
}) {
  const defaults = MATERIAL_DEFAULTS[material];
  const alpha = opacity ?? defaults.opacity;
  const materialColor = material === 'gold' ? '#f6c453' : color;

  return new MeshPhysicalMaterial({
    color: new Color(materialColor),
    map: textureMap ?? undefined,
    metalness: metalness ?? defaults.metalness,
    roughness: roughness ?? defaults.roughness,
    opacity: alpha,
    transparent: alpha < 1,
    wireframe,
    side: DoubleSide,
    clearcoat: material === 'chrome' || material === 'holographic' ? 1 : 0,
    transmission: material === 'glass' ? 0.35 : 0,
    emissive: material === 'emissive' || material === 'holographic' ? new Color(color) : new Color('#000000'),
    emissiveIntensity: material === 'emissive' ? 0.8 : material === 'holographic' ? 0.25 : 0,
  });
}

function AnimatedAssetGroup({
  animation,
  animationSpeed,
  animateReverse,
  zoom,
  children,
}: {
  animation: AnimationType;
  animationSpeed: number;
  animateReverse: boolean;
  zoom: number;
  children: ReactNode;
}) {
  const ref = useRef<Group>(null);
  const direction = animateReverse ? -1 : 1;
  const zoomScale = zoom / 8;

  useFrame(({ clock }) => {
    const group = ref.current;
    if (!group) return;
    const t = clock.elapsedTime * animationSpeed * direction;
    const pulse = animation === 'pulse' ? 1 + Math.sin(t * 3) * 0.08 : 1;

    group.position.y = animation === 'float' || animation === 'spinFloat'
      ? Math.sin(t * 1.4) * 0.22
      : 0;
    group.rotation.y = animation === 'spin' || animation === 'spinFloat' ? t : 0;
    group.rotation.z =
      animation === 'wobble' ? Math.sin(t * 3) * 0.12 :
      animation === 'swing' ? Math.sin(t * 2) * 0.28 :
      0;
    group.scale.setScalar(Math.max(0.1, zoomScale * pulse));
  });

  return <group ref={ref}>{children}</group>;
}

function PreparedModel({
  sourceScene,
  useOriginalMaterials,
  objectColor,
  material,
  metalness,
  roughness,
  opacity,
  wireframe,
  texture,
  textureRepeat,
  textureRotation,
  textureOffset,
  shadow,
}: { sourceScene: Object3D } & MaterialControls) {
  const textureMap = useOverrideTexture(
    useOriginalMaterials ? undefined : texture,
    textureRepeat,
    textureRotation,
    textureOffset
  );
  const overrideMaterial = useMemo(() => {
    if (useOriginalMaterials) return null;
    return createOverrideMaterial({
      color: objectColor,
      material,
      metalness,
      roughness,
      opacity,
      wireframe,
      textureMap,
    });
  }, [material, metalness, objectColor, opacity, roughness, textureMap, useOriginalMaterials, wireframe]);

  const { scene, center, scale } = useMemo(() => {
    const cloned = sourceScene.clone(true);
    const box = new Box3().setFromObject(cloned);
    const size = new Vector3();
    const centerPoint = new Vector3();
    box.getSize(size);
    box.getCenter(centerPoint);

    const maxDimension = Math.max(size.x, size.y, size.z) || 1;
    const fitScale = 3 / maxDimension;

    cloned.traverse((object) => {
      if (!isMesh(object)) return;
      object.castShadow = shadow;
      object.receiveShadow = shadow;
      if (overrideMaterial) object.material = overrideMaterial;
    });

    return { scene: cloned, center: centerPoint, scale: fitScale };
  }, [overrideMaterial, shadow, sourceScene]);

  useEffect(() => () => {
    overrideMaterial?.dispose();
  }, [overrideMaterial]);

  return (
    <group scale={scale}>
      <primitive object={scene} position={[-center.x, -center.y, -center.z]} />
    </group>
  );
}

function ImportedGltfModel({ url, ...controls }: { url: string } & MaterialControls) {
  const gltf = useGLTF(url) as { scene: Object3D };
  return <PreparedModel sourceScene={gltf.scene} {...controls} />;
}

function ImportedObjModel({ url, ...controls }: { url: string } & MaterialControls) {
  const obj = useLoader(OBJLoader, url);
  return <PreparedModel sourceScene={obj} {...controls} />;
}

function ImportedAsset({ format, url, ...controls }: {
  format: ModelFormat;
  url: string;
} & MaterialControls) {
  if (format === 'obj') {
    return <ImportedObjModel url={url} {...controls} />;
  }

  return <ImportedGltfModel url={url} {...controls} />;
}

function AssetFallback() {
  return (
    <mesh>
      <boxGeometry args={[1.8, 1.8, 1.8]} />
      <meshStandardMaterial color="#ffffff" wireframe transparent opacity={0.2} />
    </mesh>
  );
}

export function AssetCanvas({
  url,
  format,
  backgroundColor,
  zoom,
  objectColor,
  material,
  metalness,
  roughness,
  opacity,
  wireframe,
  texture,
  textureRepeat,
  textureRotation,
  textureOffset,
  useOriginalMaterials,
  animation,
  animationSpeed,
  animateReverse,
  lightPosition,
  lightIntensity,
  ambientIntensity,
  shadow,
  interactive,
  draggable,
  scrollZoom,
  registerCanvas,
}: AssetCanvasProps) {
  return (
    <Canvas
      shadows={shadow}
      camera={{ position: [0, 0, 8], fov: 45 }}
      gl={{ preserveDrawingBuffer: true, alpha: true, antialias: true }}
      onCreated={({ gl }) => registerCanvas(gl.domElement)}
    >
      <SceneBackgroundSync color={backgroundColor} />
      <ambientLight intensity={ambientIntensity} />
      <directionalLight
        position={lightPosition}
        intensity={lightIntensity}
        castShadow={shadow}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <Suspense fallback={<AssetFallback />}>
        <AnimatedAssetGroup
          animation={animation}
          animationSpeed={animationSpeed}
          animateReverse={animateReverse}
          zoom={zoom}
        >
          <ImportedAsset
            format={format}
            url={url}
            useOriginalMaterials={useOriginalMaterials}
            objectColor={objectColor}
            material={material}
            metalness={metalness}
            roughness={roughness}
            opacity={opacity}
            wireframe={wireframe}
            texture={texture}
            textureRepeat={textureRepeat}
            textureRotation={textureRotation}
            textureOffset={textureOffset}
            shadow={shadow}
          />
        </AnimatedAssetGroup>
      </Suspense>
      <OrbitControls
        enabled={interactive}
        enableRotate={interactive && draggable}
        enablePan={interactive && draggable}
        enableZoom={interactive && scrollZoom}
        makeDefault
      />
    </Canvas>
  );
}
