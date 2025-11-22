<script lang="ts">
  export let id: string;
  export let title: string;
  export let category: string;
</script>

<a href="/scene/{id}" class="block p-4 border rounded-lg hover:shadow-lg transition-shadow bg-white dark:bg-gray-800">
  <h3 class="text-xl font-bold mb-2">{title}</h3>
  <span class="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">{category}</span>
</a>
