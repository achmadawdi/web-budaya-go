<script lang="ts">
	import { Canvas } from '@threlte/core';
	import CubemapViewer from '$lib/components/CubemapViewer.svelte';
	import scenes from '$lib/data/scenes.json';
	import { tweened } from 'svelte/motion';
	import { cubicInOut, sineInOut } from 'svelte/easing';
	import { onMount } from 'svelte';
	import gsap from 'gsap';

	// State
	let isTourActive = false;
	let currentSceneIndex = 0;
	let viewerContainer: HTMLDivElement;

	$: currentScene = scenes[currentSceneIndex];

	// Animation stores
	const fov = tweened(60, { duration: 400, easing: cubicInOut });

	// Transition state
	let isTransitioning = false;

	function handlePreviewClick() {
		if (isTourActive) return;

		const rect = viewerContainer.getBoundingClientRect();

		// Set initial position to current location
		gsap.set(viewerContainer, {
			position: 'fixed',
			top: rect.top,
			left: rect.left,
			width: rect.width,
			height: rect.height,
			margin: 0,
			padding: 0
		});

		isTourActive = true;

		// Animate to fullscreen
		gsap.to(viewerContainer, {
			top: 0,
			left: 0,
			width: '100%',
			height: '100%',
			duration: 1,
			ease: 'power2.inOut'
		});

		// Update URL without navigation
		history.pushState({ tour: true }, '', '/tour');
	}

	// Tour Logic
	async function changeScene(direction: 'next' | 'prev') {
		if (isTransitioning) return;
		isTransitioning = true;

		try {
			const zoomPromise = fov.set(60, { duration: 500, easing: sineInOut });
			await zoomPromise;

			if (direction === 'next') {
				currentSceneIndex = (currentSceneIndex + 1) % scenes.length;
			} else {
				currentSceneIndex = (currentSceneIndex - 1 + scenes.length) % scenes.length;
			}

			const targetFov = currentScene.initialFov || 60;
			await fov.set(targetFov, { duration: 500, easing: sineInOut });
		} finally {
			isTransitioning = false;
		}
	}

	function handleWheel(event: WheelEvent) {
		if (!isTourActive || isTransitioning) return;
		const newFov = $fov + event.deltaY * 0.05;
		fov.set(Math.max(30, Math.min(110, newFov)), { duration: 0 });
	}

	// Handle back button to close tour
	function handlePopState(event: PopStateEvent) {
		if (isTourActive) {
			closeTour();
		}
	}

	function closeTour() {
		// Animate back to original position
		gsap.to(viewerContainer, {
			position: 'relative',
			top: 'auto',
			left: 'auto',
			width: 'auto',
			height: 'auto',
			duration: 1,
			ease: 'power2.inOut',
			onComplete: () => {
				isTourActive = false;
				// Clear inline styles set by GSAP
				gsap.set(viewerContainer, { clearProps: 'all' });
			}
		});
	}
</script>

<svelte:window on:wheel={handleWheel} on:popstate={handlePopState} />

<div
	class="min-h-screen text-white font-roboto overflow-x-hidden relative selection:bg-yellow-500 selection:text-black bg-cover bg-center bg-no-repeat bg-fixed"
	style="background-image: linear-gradient(180deg, #004721 15%, rgba(0,0,0,0.8) 100%), url('/images/fullmap_tana_samawa.png');"
>
	<!-- Header & Hero Content (Fades out when tour is active) -->
	<div
		class="transition-all duration-1000 ease-in-out {isTourActive
			? 'opacity-0 pointer-events-none scale-95 blur-sm'
			: 'opacity-100 scale-100 blur-0'}"
	>
		<!-- Header -->
		<header class="container mx-auto px-6 py-10 flex justify-between items-center z-20 relative">
			<div class="flex items-center gap-3 select-none">
				<img
					src="/images/logo_tana_samawa_4_0_white.png"
					alt="Logo Tana Samawa"
					class="w-[400px]"
				/>
			</div>

			<nav
				class="hidden md:flex items-center gap-8 text-base font-medium font-merriweather tracking-wide"
			>
				<a href="#text" class="hover:text-[#EDCC5B] transition-colors duration-300">Join Game</a>
				<a href="/tour" class="hover:text-[#EDCC5B] transition-colors duration-300">Virtual Tour</a>
				<button
					class="w-9 h-9 border border-white/30 rounded flex items-center justify-center hover:bg-white/10 transition-colors duration-300"
					aria-label="External Link"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline
							points="15 3 21 3 21 9"
						/><line x1="10" y1="14" x2="21" y2="3" /></svg
					>
				</button>
			</nav>
		</header>

		<!-- Hero Content -->
		<main class="container mx-auto px-6 pt-12 pb-20 relative z-10">
			<div class="max-w-7xl">
				<h1 class="font-merriweather text-4xl md:text-5xl leading-tight mb-12 drop-shadow-lg">
					Menjahit fragmen-fragmen kebudayaan, arsitektur, sejarah, dan narasi rakyat dalam ruang
					virtual
				</h1>

				<button
					on:click={handlePreviewClick}
					class="bg-[#EDCC5B] text-xl text-black px-4 py-2 font-bold flex items-center gap-2 hover:bg-[#f0d67b] hover:scale-105 active:scale-95 transition-all duration-300 mb-16 shadow-lg shadow-yellow-900/20"
				>
					Mulai Perjalanan
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="group-hover:translate-x-1 transition-transform"
						><line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" /></svg
					>
				</button>
			</div>
		</main>
	</div>

	<!-- 360 Viewer Container -->
	<div
		bind:this={viewerContainer}
		class="shadow-2xl border border-white/10 bg-black/20 backdrop-blur-sm overflow-hidden
           {isTourActive
			? 'z-50 border-0 rounded-none'
			: 'container mx-auto  h-[50vh] md:h-[600px] rounded-md mb-10'}"
	>
		<!-- Click handler only when NOT active -->
		{#if !isTourActive}
			<div
				class="absolute inset-0 z-10 cursor-pointer group"
				on:click={handlePreviewClick}
				on:keydown={(e) => e.key === 'Enter' && handlePreviewClick()}
				role="button"
				tabindex="0"
			>
				<!-- Overlay -->
				<div
					class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center"
				>
					<span
						class="bg-white/10 backdrop-blur-md px-8 py-4 text-white font-medium border border-white/20 tracking-wider hover:bg-white/20 transition-colors"
					>
						Click to Explore
					</span>
				</div>
			</div>
		{/if}

		<div class="w-full h-full">
			<Canvas>
				<CubemapViewer
					cubemapUrls={currentScene.cubemap}
					fov={isTourActive ? $fov : 75}
					initialDirection={currentScene.initialDirection}
					autoRotate={!isTourActive}
					enableZoom={isTourActive}
					enablePan={isTourActive}
				/>
			</Canvas>
		</div>

		<!-- Tour UI Overlay (Only when active) -->
		<div
			class="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-6 bg-black/30 backdrop-blur-xl border border-white/10 p-3 rounded-full shadow-2xl transition-all duration-500 {isTourActive
				? 'opacity-100 translate-y-0'
				: 'opacity-0 translate-y-10 pointer-events-none'}"
		>
			<button
				on:click={() => changeScene('prev')}
				class="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95 group"
				aria-label="Previous Scene"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="group-hover:-translate-x-0.5 transition-transform"><path d="m15 18-6-6 6-6" /></svg
				>
			</button>

			<div class="px-4 text-center min-w-[200px]">
				<h1 class="text-white font-bold text-xl leading-tight drop-shadow-lg tracking-wide">
					{currentScene.title}
				</h1>
				<p class="text-white/60 text-xs uppercase tracking-widest mt-1 font-medium">
					{currentScene.category}
				</p>
			</div>

			<button
				on:click={() => changeScene('next')}
				class="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95 group"
				aria-label="Next Scene"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="group-hover:translate-x-0.5 transition-transform"><path d="m9 18 6-6-6-6" /></svg
				>
			</button>
		</div>
	</div>
</div>

<style>
	:global(body) {
		background-color: #063a20;
	}
</style>
