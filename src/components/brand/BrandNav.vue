<template>
  <header class="nav" :class="{ 'nav--solid': scrolled }">
    <div class="nav__inner">
      <a href="https://paintbrushoutdoors.com" class="nav__brand" aria-label="Paintbrush Outdoors home">
        <img :src="logo" alt="Paintbrush Outdoors" class="nav__logo" />
        <span class="nav__brandtext">LoraText</span>
      </a>

      <nav class="nav__links" aria-label="Sections">
        <a
          v-for="link in links"
          :key="link.id"
          :href="`#${link.id}`"
          @click="go($event, `#${link.id}`)"
        >{{ link.label }}</a>
      </nav>

      <router-link to="/app" class="nav__cta">
        Launch LoraText
        <i class="mdi mdi-arrow-right"></i>
      </router-link>
    </div>
  </header>
</template>

<script setup>
  import { onMounted, onBeforeUnmount, ref } from 'vue'

  const logo = '/img/brand-logo.png'
  const scrolled = ref(false)

  const links = [
    { id: 'how', label: 'How it works' },
    { id: 'pair', label: 'Pair & message' },
    { id: 'map', label: 'Off-grid map' },
    { id: 'kit', label: 'Build the kit' },
    { id: 'open-source', label: 'Open source' },
  ]

  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  function onScroll () {
    scrolled.value = window.scrollY > 40
  }

  function go (e, sel) {
    const target = document.querySelector(sel)
    if (!target) return
    e.preventDefault()
    target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
  }

  onMounted(() => {
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
  })

  onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))
</script>

<style scoped>
  .nav {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    transition: background 0.3s ease, border-color 0.3s ease, backdrop-filter 0.3s ease;
    border-bottom: 1px solid transparent;
  }

  .nav--solid {
    background: rgba(11, 11, 16, 0.72);
    backdrop-filter: blur(14px);
    border-bottom-color: rgba(255, 255, 255, 0.08);
  }

  .nav__inner {
    max-width: 1180px;
    margin: 0 auto;
    padding: 0.85rem 1.25rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .nav__brand {
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    text-decoration: none;
    color: #f4f4f8;
  }

  .nav__logo {
    height: 44px;
    width: auto;
    object-fit: contain;
    filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.45));
  }

  .nav__brandtext {
    font-family: 'Space Grotesk', system-ui, sans-serif;
    font-weight: 600;
    letter-spacing: -0.01em;
    font-size: 1.1rem;
  }

  .nav__links {
    display: flex;
    gap: 1.5rem;
  }

  .nav__links a {
    position: relative;
    text-decoration: none;
    color: #b3b3c0;
    font-size: 0.95rem;
    transition: color 0.25s ease;
  }

  .nav__links a::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: -4px;
    width: 0;
    height: 2px;
    border-radius: 2px;
    background: #7c5cff;
    transition: width 0.25s ease;
  }

  .nav__links a:hover {
    color: #fff;
  }

  .nav__links a:hover::after {
    width: 100%;
  }

  .nav__cta {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.55rem 1.15rem;
    border-radius: 999px;
    font-size: 0.9rem;
    font-weight: 600;
    text-decoration: none;
    color: #f4f4f8;
    border: 1px solid rgba(124, 92, 255, 0.55);
    background: rgba(124, 92, 255, 0.12);
    transition: transform 0.25s ease, background 0.25s ease;
  }

  .nav__cta:hover {
    transform: translateY(-2px);
    background: rgba(124, 92, 255, 0.22);
  }

  .nav__cta .mdi {
    transition: transform 0.25s ease;
  }

  .nav__cta:hover .mdi {
    transform: translateX(3px);
  }

  @media (max-width: 860px) {
    .nav__links {
      display: none;
    }
  }

  @media (max-width: 420px) {
    .nav__brandtext {
      display: none;
    }
  }
</style>
