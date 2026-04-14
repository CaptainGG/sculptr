'use client';

import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { Color } from 'three';

export function SceneBackgroundSync({ color }: { color: string }) {
  const { gl, scene } = useThree();

  useEffect(() => {
    if (color === 'transparent') {
      scene.background = null;
      gl.setClearColor(0x000000, 0);
      return;
    }

    const background = new Color(color);
    scene.background = background;
    gl.setClearColor(background, 1);
  }, [color, gl, scene]);

  return null;
}
