<script lang="ts">
  import { T, useThrelte } from '@threlte/core';
  import { OrbitControls } from '@threlte/extras';
  import { MathUtils, PerspectiveCamera, CubeTextureLoader, CubeReflectionMapping, WebGLRenderer } from 'three';
  import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';

  export let cubemapUrls: string | {
    px: string;
    nx: string;
    py: string;
    ny: string;
    pz: string;
    nz: string;
  };

  export let fov = 75;
  export let initialDirection = { pitch: 0, yaw: 0 };

  const { scene, invalidate, renderer, camera } = useThrelte();

  let ktx2Loader: KTX2Loader;
  let controls: any;

  $: if (renderer && !ktx2Loader) {
    ktx2Loader = new KTX2Loader()
      .setTranscoderPath('https://unpkg.com/three@0.181.2/examples/jsm/libs/basis/')
      .detectSupport(renderer as WebGLRenderer);
  }

  function updateCameraDirection() {
    if (!controls || !$camera) return;
    
    // Reset controls to clear any previous state
    controls.reset();

    // Convert yaw/pitch to direction vector
    // Yaw is rotation around Y, Pitch is rotation around X
    const yaw = MathUtils.degToRad(initialDirection.yaw);
    const pitch = MathUtils.degToRad(initialDirection.pitch);

    // Calculate target point on unit sphere
    // In Three.js:
    // Y is up.
    // Z is forward (usually -Z for camera look).
    // Let's assume standard spherical coords:
    // x = r * sin(theta) * cos(phi)
    // y = r * sin(phi)
    // z = r * cos(theta) * cos(phi)
    
    // We want to look AT this point.
    // The camera is at (0,0,0.1).
    // So we set the target to be far away in that direction.
    const r = 10;
    // Adjusting for Three.js coordinate system (Y up, -Z forward)
    // Yaw 0 should be -Z?
    // Let's try standard mapping first.
    const x = r * Math.sin(yaw) * Math.cos(pitch);
    const y = r * Math.sin(pitch);
    const z = -r * Math.cos(yaw) * Math.cos(pitch);

    controls.target.set(x, y, z);
    controls.update();
  }

  $: if (cubemapUrls && renderer) {
    if (typeof cubemapUrls === 'string') {
      // Ensure loader is ready
      if (ktx2Loader) {
        ktx2Loader.load(cubemapUrls, (texture) => {
          texture.mapping = CubeReflectionMapping;
          scene.background = texture;
          scene.environment = texture;
          updateCameraDirection();
          invalidate();
        });
      }
    } else {
      const loader = new CubeTextureLoader();
      loader.load([
        cubemapUrls.px,
        cubemapUrls.nx,
        cubemapUrls.py,
        cubemapUrls.ny,
        cubemapUrls.pz,
        cubemapUrls.nz
      ], (texture) => {
        scene.background = texture;
        scene.environment = texture;
        updateCameraDirection();
        invalidate();
      });
    }
  }
</script>

<T.PerspectiveCamera
  makeDefault
  position={[0, 0, 0.1]}
  {fov}
>
  <OrbitControls
    bind:ref={controls}
    enableZoom={false}
    enablePan={false}
    rotateSpeed={-0.5}
    enableDamping
    dampingFactor={0.05}
  />
</T.PerspectiveCamera>
