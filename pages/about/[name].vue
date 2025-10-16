<template>
  <div class="detail-page">
    <div v-if="pending || evoPending">Loading...</div>

    <div v-else class="detail-page-content">
    <div class="detail-section">
      <h1 class="detail-name">{{ pokemon.name }}</h1>
      <img :src="pokemon.image" :alt="pokemon.name" />
    </div>

      <!-- Evolutions -->
      <div v-if="evolutions.length" class="evo-section">
        <h1>Evolution Chain</h1>
        <div class="detail-section-info">
        <span><strong>Height</strong> {{ pokemon.height }}</span>
        <span><strong>Weight</strong> {{ pokemon.weight }}</span>
        </div>
        <div
          class="evo-list"
          :style="{ gridTemplateColumns: `repeat(${Math.min(evolutions.length, 3)}, 1fr)` }"
        >
          <div
            v-for="evo in evolutions"
            :key="evo.name"
            class="evo-item"
          >
            <h1 class="evo-name">{{ evo.name }}</h1>
            <img :src="evo.image" :alt="evo.name" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const name = route.params.name as string

const { data, pending } = await useFetch(`https://pokeapi.co/api/v2/pokemon/${name}`)

const pokemon = computed(() => {
  if (!data.value) return {}
  return {
    name: data.value.name,
    height: data.value.height,
    weight: data.value.weight,
    id: data.value.id,
    image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${data.value.id}.png`
  }
})

const { data: species, pending: evoPending } = await useFetch(
  () => `https://pokeapi.co/api/v2/pokemon-species/${name}`
)

const evolutions = ref<any[]>([])

if (species.value?.evolution_chain?.url) {
  const evoChain = await $fetch(species.value.evolution_chain.url)

  function parseChain(chain: any): any[] {
    const result = []
    let current = chain
    while (current) {
      result.push({
        name: current.species.name,
      })
      current = current.evolves_to[0]
    }
    return result
  }

  const chainList = parseChain(evoChain.chain)

  evolutions.value = await Promise.all(
    chainList.map(async (p) => {
      try {
        const pokeData = await $fetch(`https://pokeapi.co/api/v2/pokemon/${p.name}`)
        return {
          name: pokeData.name,
          id: pokeData.id,
          image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokeData.id}.png`
        }
      } catch {
        return null
      }
    })
  )

  evolutions.value = evolutions.value.filter(Boolean)
}
</script>
