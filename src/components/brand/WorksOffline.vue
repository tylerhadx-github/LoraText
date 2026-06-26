<template>
  <section id="offline" class="offline" ref="root">
    <div class="offline__bg" aria-hidden="true">
      <span class="offline__orb"></span>
    </div>

    <div class="offline__inner" ref="inner">
      <div class="offline__panel">
        <div class="offline__icon">
          <i class="mdi mdi-wifi-off"></i>
        </div>

        <div class="offline__body">
          <span class="offline__eyebrow">Works offline</span>
          <h2 class="offline__title">
            No tower, no Wi-Fi, <em>no problem</em>.
          </h2>
          <p class="offline__lead">
            LoraText is offline-first by design. Once the page loads it installs as
            a PWA and runs with zero connectivity - your radio does the talking, not
            the cell network. This isn't a fallback; it's the whole point.
          </p>

          <ul class="offline__list">
            <li v-for="point in points" :key="point.title">
              <span class="offline__check"><i class="mdi mdi-check"></i></span>
              <span>
                <strong>{{ point.title }}</strong>
                {{ point.detail }}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
  import { onMounted, ref } from 'vue'
  import { useScrollReveal } from '@/composables/useScrollReveal'

  const root = ref(null)
  const inner = ref(null)

  const points = [
    { title: 'No-signal operation -', detail: 'send and receive over LoRa with no cell service or Wi-Fi.' },
    { title: 'Installable PWA -', detail: 'open the page once, install it, and it runs from cache offline.' },
    { title: 'Local, private storage -', detail: 'messages are kept on-device and stay encrypted at rest.' },
    { title: 'Background notifications -', detail: 'get alerted to new messages even with the app in the background.' },
  ]

  const { revealStagger } = useScrollReveal()

  onMounted(() => {
    revealStagger(inner.value, ':scope > *', { y: 30, stagger: 0.12 })
  })
</script>

<style scoped>
  .offline {
    position: relative;
    padding: clamp(3.5rem, 8vw, 7rem) 1.25rem;
    overflow: hidden;
  }

  .offline__bg {
    position: absolute;
    inset: 0;
    z-index: 0;
  }

  .offline__orb {
    position: absolute;
    left: 8%;
    top: 50%;
    width: 50vw;
    max-width: 640px;
    aspect-ratio: 1;
    transform: translateY(-50%);
    border-radius: 50%;
    background: radial-gradient(circle, rgba(61, 220, 151, 0.22), transparent 65%);
    filter: blur(50px);
  }

  .offline__inner {
    position: relative;
    z-index: 1;
    max-width: 1180px;
    margin: 0 auto;
  }

  .offline__panel {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: clamp(1.5rem, 4vw, 3rem);
    align-items: start;
    padding: clamp(1.75rem, 4vw, 3rem);
    border-radius: 28px;
    border: 1px solid rgba(61, 220, 151, 0.28);
    background:
      radial-gradient(120% 120% at 0% 0%, rgba(61, 220, 151, 0.08), transparent 55%),
      rgba(255, 255, 255, 0.025);
  }

  .offline__icon {
    display: grid;
    place-items: center;
    width: clamp(64px, 12vw, 92px);
    height: clamp(64px, 12vw, 92px);
    border-radius: 24px;
    font-size: clamp(2rem, 5vw, 2.8rem);
    color: #0b0b10;
    background: #3ddc97;
    box-shadow: 0 0 36px rgba(61, 220, 151, 0.55);
  }

  .offline__eyebrow {
    display: inline-block;
    font-family: 'Space Grotesk', system-ui, sans-serif;
    font-size: 0.8rem;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #3ddc97;
    margin-bottom: 0.75rem;
  }

  .offline__title {
    font-family: 'Space Grotesk', system-ui, sans-serif;
    font-weight: 700;
    font-size: clamp(1.7rem, 4.5vw, 2.7rem);
    line-height: 1.05;
    letter-spacing: -0.02em;
    margin: 0;
    color: #f4f4f8;
  }

  .offline__title em {
    font-style: normal;
    background: linear-gradient(120deg, #7c5cff, #b89bff 50%, #3ddc97);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  .offline__lead {
    margin: 1rem 0 0;
    max-width: 62ch;
    line-height: 1.6;
    color: #b3b3c0;
  }

  .offline__list {
    list-style: none;
    padding: 0;
    margin: 1.75rem 0 0;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 0.9rem 1.5rem;
  }

  .offline__list li {
    display: flex;
    align-items: flex-start;
    gap: 0.65rem;
    line-height: 1.5;
    color: #a7a7b4;
    font-size: 0.93rem;
  }

  .offline__list strong {
    color: #f4f4f8;
    font-weight: 600;
  }

  .offline__check {
    flex: none;
    display: grid;
    place-items: center;
    width: 22px;
    height: 22px;
    margin-top: 1px;
    border-radius: 50%;
    font-size: 0.85rem;
    color: #3ddc97;
    background: rgba(61, 220, 151, 0.14);
    border: 1px solid rgba(61, 220, 151, 0.4);
  }

  @media (max-width: 640px) {
    .offline__panel {
      grid-template-columns: 1fr;
    }
  }
</style>
