<template>
  <div class="layout">
    <header>
      <div class="header-content">
        <NuxtLink to="/">HOME PAGE</NuxtLink>
        <img src="../assets/images/pokemon-logo.png"/>
        <NuxtLink to="/about/pichu">SAMPLE DETAIL</NuxtLink>
      </div>
    </header>
    <main>
      <slot />
    </main>
  </div>
</template>
