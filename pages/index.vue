<template>
  <div class="home-page">
    <div class="title-home-page">
      <h1>Pokémon Evolutions</h1>
      <span>Discover the starting point of each Pokémon’s journey! Click on a Pokémon to learn more about its evolutions and details.</span>
    </div>

    <div v-if="pending">Loading...</div>

    <div v-else class="content-home-page">
      <!-- Search bar -->
      <div class="search-bar">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Search Pokémon..."
        />
      </div>

      <div class="pokemon-list">
        <NuxtLink
          v-for="pokemon in paginatedPokemon"
          :key="pokemon.name"
          :to="`/about/${pokemon.name}`"
          class="pokemon-card"
        >
          <div
            class="pokemon-bg"
            :style="{ backgroundImage: `url(${pokemon.image})` }"
          >
            <div class="overlay">
              <span class="pokemon-name">{{ pokemon.name }}</span>
            </div>
          </div>
        </NuxtLink>
      </div>

      <!-- Pagination -->
      <div class="pagination" v-if="filteredPokemon.length">
        <button @click="prevPage" :disabled="page === 1">Previous</button>
        <span>Page {{ page }} / {{ totalPages }}</span>
        <button @click="nextPage" :disabled="page === totalPages">Next</button>
      </div>

      <div v-else class="not-found">No Pokémon found.</div>
    </div>
  </div>
</template>

<script setup lang="ts">
const page = ref(1)
const perPage = 12
const pokemonList = ref<any[]>([])
const searchQuery = ref('')

const { data, pending } = await useFetch('https://pokeapi.co/api/v2/pokemon-species?limit=-1')

onMounted(async () => {
  if (!data.value) return

  const allUrls = data.value.results.map((s: any) => s.url)

  const cached = localStorage.getItem('pokemon_base_list')
  if (cached) {
    pokemonList.value = JSON.parse(cached)
    return // skip fetch ulang kalau sudah ada
  }

  async function fetchWithLimit(urls: string[], limit = 20) {
    const results: any[] = []
    let index = 0

    async function worker() {
      while (index < urls.length) {
        const current = index++
        const url = urls[current]
        try {
          const id = url.split('/').filter(Boolean).pop()
          const species = await $fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`)
          if (!species.evolves_from_species) {
            results.push({
              name: species.name,
              id,
              image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
            })
          }
        } catch (err) {
          console.warn('Failed:', url)
        }
      }
    }

    const workers = Array.from({ length: limit }, () => worker())
    await Promise.all(workers)
    return results
  }

  const result = await fetchWithLimit(allUrls, 20)
  pokemonList.value = result
  localStorage.setItem('pokemon_base_list', JSON.stringify(result))
})

const filteredPokemon = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (q.length < 3) return pokemonList.value
  return pokemonList.value.filter(p => p.name.toLowerCase().includes(q))
})

const totalPages = computed(() => Math.ceil(filteredPokemon.value.length / perPage))
const paginatedPokemon = computed(() => {
  const start = (page.value - 1) * perPage
  return filteredPokemon.value.slice(start, start + perPage)
})

function nextPage() {
  if (page.value < totalPages.value) page.value++
}
function prevPage() {
  if (page.value > 1) page.value--
}

watch(searchQuery, () => (page.value = 1))
</script>
