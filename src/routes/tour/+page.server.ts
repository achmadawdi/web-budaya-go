import type { PageServerLoad } from './$types';
import scenes from '$lib/data/scenes.json';

export const load: PageServerLoad = async () => {
  return {
    scenes
  };
};
