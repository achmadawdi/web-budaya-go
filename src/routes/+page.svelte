<script lang="ts">
  import { Canvas } from '@threlte/core';
  import CubemapViewer from '$lib/components/CubemapViewer.svelte';
  import type { PageData } from './$types';
  import { cubicOut, cubicInOut, sineInOut } from 'svelte/easing';
  import { tweened } from 'svelte/motion';

  export let data: PageData;

  let currentSceneIndex = 0;
  $: currentScene = data.scenes[currentSceneIndex];

  const fov = tweened(60, {
    duration: 400,
    easing: cubicOut
  });

  // Update FOV when scene changes to its initial FOV
  $: if (currentScene) {
    // We handle this in the transition function, but as a fallback:
    // fov.set(currentScene.initialFov || 75);
  }

  function handleWheel(event: WheelEvent) {
    if (isTransitioning) return;
    const newFov = $fov + event.deltaY * 0.05;
    fov.set(Math.max(30, Math.min(110, newFov)), { duration: 0 });
  }

  let isTransitioning = false;

  async function changeScene(direction: 'next' | 'prev') {
    if (isTransitioning) return;
    isTransitioning = true;

    try {
      // 1. Zoom in effect (Subtle: 75 -> 60)
      // And start blur
      const zoomPromise = fov.set(60, { duration: 500, easing: sineInOut });
      
      await zoomPromise;

      // 2. Change scene
      if (direction === 'next') {
        currentSceneIndex = (currentSceneIndex + 1) % data.scenes.length;
      } else {
        currentSceneIndex = (currentSceneIndex - 1 + data.scenes.length) % data.scenes.length;
      }

      // 3. Reset FOV for new scene (zoom out effect)
      const targetFov = currentScene.initialFov || 60;
      
      // Wait a tiny bit for the scene to start loading/rendering? 
      // The blur helps hide the pop.
      
      await fov.set(targetFov, { duration: 500, easing: sineInOut });
    } finally {
      isTransitioning = false;
    }
  }

  function nextScene() {
    changeScene('next');
  }

  function prevScene() {
    changeScene('prev');
  }
</script>

<svelte:window on:wheel={handleWheel} />

<div class="w-full h-screen relative bg-black overflow-hidden">
  <!-- Glossy UI Overlay -->
  <div class="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex items-center gap-6 bg-black/30 backdrop-blur-xl border border-white/10 p-3 rounded-full shadow-2xl transition-all hover:bg-black/40 hover:scale-105">
    
    <button 
      on:click={prevScene} 
      class="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95 group"
      aria-label="Previous Scene"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="group-hover:-translate-x-0.5 transition-transform"><path d="m15 18-6-6 6-6"/></svg>
    </button>

    <div class="px-4 text-center min-w-[200px]">
      <h1 class="text-white font-bold text-xl leading-tight drop-shadow-lg tracking-wide">{currentScene.title}</h1>
      <p class="text-white/60 text-xs uppercase tracking-widest mt-1 font-medium">{currentScene.category}</p>
    </div>

    <button 
      on:click={nextScene} 
      class="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95 group"
      aria-label="Next Scene"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="group-hover:translate-x-0.5 transition-transform"><path d="m9 18 6-6-6-6"/></svg>
    </button>
  </div>

  <div class="w-full h-full transition-all duration-500 {isTransitioning ? 'blur-md scale-105' : 'blur-0 scale-100'}">
    <Canvas>
      <CubemapViewer 
        cubemapUrls={currentScene.cubemap} 
        fov={$fov} 
        initialDirection={currentScene.initialDirection}
      />
    </Canvas>
  </div>
</div>
