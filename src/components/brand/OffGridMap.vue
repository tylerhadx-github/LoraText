<template>
  <section id="map" class="mapsec" ref="root">
    <div class="mapsec__inner">
      <div class="mapsec__copy" ref="copy">
        <div class="mapsec__eyerow">
          <span class="mapsec__eyebrow">Off-grid map</span>
          <span class="mapsec__planned">
            <i class="mdi mdi-progress-wrench"></i> Planned
          </span>
        </div>
        <h2 class="mapsec__title">See your whole group on a live map</h2>
        <p class="mapsec__lead">
          Share live location over the radio and watch your group move in real time.
          Drop pins to mark a rally point, a trailhead, or a hazard - every update
          rides the same encrypted LoRa link, no cell service needed.
        </p>

        <ul class="mapsec__list">
          <li v-for="point in points" :key="point">
            <span class="mapsec__dot"></span> {{ point }}
          </li>
        </ul>

        <p class="mapsec__note">
          <i class="mdi mdi-information-outline"></i>
          Today you can share your location and drop pins over LoRa. Full
          multi-member group tracking with names is on the roadmap.
        </p>

        <router-link to="/app" class="mapsec__btn">
          Open the map <i class="mdi mdi-arrow-right"></i>
        </router-link>
      </div>

      <div class="mapsec__visual" ref="visual" aria-hidden="true">
        <div class="mapmock">
          <span class="mapmock__grid"></span>
          <span class="mapmock__route"></span>
          <span class="pin pin--you">
            <i class="mdi mdi-account-circle"></i>
            <em>You</em>
          </span>
          <span class="pin pin--friend">
            <i class="mdi mdi-map-marker"></i>
            <em>Alex</em>
          </span>
          <span class="pin pin--drop">
            <i class="mdi mdi-flag"></i>
            <em>Rally</em>
          </span>
          <span class="mapmock__badge">
            <span class="mapmock__live"></span> Live · LoRa link
          </span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
  import { onMounted, ref } from 'vue'
  import { useScrollReveal } from '@/composables/useScrollReveal'

  const root = ref(null)
  const copy = ref(null)
  const visual = ref(null)

  const points = [
    'Live location updates over encrypted LoRa',
    'Drop and share pins for rally points',
    'Satellite basemap that works in the backcountry',
  ]

  const { revealOne } = useScrollReveal()

  onMounted(() => {
    revealOne(copy.value, { y: 32 })
    revealOne(visual.value, { y: 32, x: 0, delay: 0.1 })
  })
</script>

<style scoped>
  .mapsec {
    position: relative;
    padding: clamp(3.5rem, 8vw, 7rem) 1.25rem;
  }

  .mapsec__inner {
    max-width: 1180px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: clamp(2rem, 5vw, 4rem);
    align-items: center;
  }

  .mapsec__eyerow {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    margin-bottom: 0.85rem;
  }

  .mapsec__eyebrow {
    display: inline-block;
    font-family: 'Space Grotesk', system-ui, sans-serif;
    font-size: 0.8rem;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #7c5cff;
  }

  .mapsec__planned {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.68rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #ffb454;
    background: rgba(255, 180, 84, 0.12);
    border: 1px solid rgba(255, 180, 84, 0.4);
    padding: 0.25rem 0.6rem;
    border-radius: 999px;
  }

  .mapsec__planned .mdi {
    font-size: 0.85rem;
  }

  .mapsec__note {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    margin: 1.5rem 0 0;
    padding: 0.75rem 0.9rem;
    border-radius: 14px;
    border: 1px solid rgba(255, 180, 84, 0.25);
    background: rgba(255, 180, 84, 0.06);
    font-size: 0.85rem;
    line-height: 1.5;
    color: #c9c9d6;
  }

  .mapsec__note .mdi {
    color: #ffb454;
    margin-top: 1px;
    flex: none;
  }

  .mapsec__title {
    font-family: 'Space Grotesk', system-ui, sans-serif;
    font-weight: 700;
    font-size: clamp(1.9rem, 5vw, 3rem);
    letter-spacing: -0.02em;
    line-height: 1.05;
    margin: 0;
    color: #f4f4f8;
  }

  .mapsec__lead {
    margin: 1rem 0 0;
    max-width: 54ch;
    line-height: 1.6;
    color: #a7a7b4;
  }

  .mapsec__list {
    list-style: none;
    padding: 0;
    margin: 1.5rem 0 0;
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
  }

  .mapsec__list li {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    color: #c9c9d6;
    font-size: 0.95rem;
  }

  .mapsec__dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: #3ddc97;
    box-shadow: 0 0 10px #3ddc97;
    flex: none;
  }

  .mapsec__btn {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    margin-top: 2rem;
    padding: 0.8rem 1.4rem;
    border-radius: 999px;
    font-weight: 600;
    text-decoration: none;
    color: #f4f4f8;
    border: 1px solid rgba(124, 92, 255, 0.55);
    background: rgba(124, 92, 255, 0.12);
    transition: transform 0.25s ease, background 0.25s ease;
  }

  .mapsec__btn:hover {
    transform: translateY(-3px);
    background: rgba(124, 92, 255, 0.22);
  }

  .mapsec__btn .mdi {
    transition: transform 0.25s ease;
  }

  .mapsec__btn:hover .mdi {
    transform: translateX(4px);
  }

  .mapmock {
    position: relative;
    aspect-ratio: 4 / 3;
    border-radius: 24px;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background:
      radial-gradient(80% 80% at 70% 20%, rgba(124, 92, 255, 0.18), transparent 60%),
      radial-gradient(70% 70% at 20% 80%, rgba(61, 220, 151, 0.16), transparent 60%),
      #0e0e16;
    box-shadow: 0 30px 70px rgba(0, 0, 0, 0.45);
  }

  .mapmock__grid {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
    background-size: 42px 42px;
  }

  .mapmock__route {
    position: absolute;
    left: 24%;
    top: 30%;
    width: 46%;
    height: 38%;
    border-left: 2px dashed rgba(124, 92, 255, 0.7);
    border-bottom: 2px dashed rgba(124, 92, 255, 0.7);
    border-radius: 0 0 0 18px;
  }

  .pin {
    position: absolute;
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    gap: 0.15rem;
    transform: translate(-50%, -50%);
  }

  .pin .mdi {
    font-size: 1.7rem;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.5));
  }

  .pin em {
    font-style: normal;
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    padding: 0.1rem 0.45rem;
    border-radius: 999px;
    background: rgba(11, 11, 16, 0.72);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #f4f4f8;
  }

  .pin--you {
    left: 26%;
    top: 30%;
  }

  .pin--you .mdi {
    color: #5ab0ff;
  }

  .pin--friend {
    left: 70%;
    top: 68%;
  }

  .pin--friend .mdi {
    color: #3ddc97;
  }

  .pin--drop {
    left: 70%;
    top: 30%;
  }

  .pin--drop .mdi {
    color: #ffb454;
  }

  .mapmock__badge {
    position: absolute;
    left: 0.9rem;
    bottom: 0.9rem;
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: #d3d3dd;
    padding: 0.35rem 0.7rem;
    border-radius: 999px;
    background: rgba(11, 11, 16, 0.66);
    border: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(6px);
  }

  .mapmock__live {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #3ddc97;
    box-shadow: 0 0 10px #3ddc97;
  }

  @media (max-width: 820px) {
    .mapsec__inner {
      grid-template-columns: 1fr;
    }
  }
</style>
