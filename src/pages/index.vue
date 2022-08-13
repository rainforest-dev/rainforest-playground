<template>
  <div class="control">
    <label for="baseFrequency" class="slider">
      Base Frequency
      <input
        id="baseFrequency"
        name="baseFrequency"
        type="range"
        v-model="baseFrequency"
        max="1"
        min="0"
        step="0.005"
      />
      {{ baseFrequency }}
    </label>
    <label for="numOctaves" class="slider">
      Num Octaves
      <input
        id="numOctaves"
        name="numOctaves"
        type="range"
        v-model="numOctaves"
        max="5"
        min="0"
      />
      {{ numOctaves }}
    </label>
    <div class="type">
      <input
        type="radio"
        id="fractalNoise"
        value="fractalNoise"
        v-model="type"
      />
      <label for="fractalNoise">fractalNoise</label>
      <input type="radio" id="turbulence" value="turbulence" v-model="type" />
      <label for="turbulence">turbulence</label>
    </div>
    <div class="case">
      <input
        type="radio"
        id="linearGradient"
        value="linearGradient"
        v-model="index"
      />
      <label for="linearGradient">Linear Gradient</label>
      <input type="radio" id="solid" value="solid" v-model="index" />
      <label for="solid">Solid</label>
    </div>
  </div>
  <div :style="{ ...styleObj, backgroundColor: '#0B2127' }" class="container">
    <img :src="star" alt="star" class="star" />
    <div class="card" v-show="index === 'solid'"></div>
  </div>
  <div
    class="bg"
    :style="{
      position: 'relative',
      background: '#0b2127',
    }"
  >
    <div class="gooey-effect" ref="gooeyEffectRef">
      <div class="circle circle1"></div>
      <div class="circle circle2" :style="mousePosStyle">
        {{ mousePosStyle }}
      </div>
    </div>
    <!-- <div class="blur"></div> -->
    <div :style="styleObj" class="container2"></div>
    <svg>
      <filter id="gooey">
        <feGaussianBlur in="SourceGraphic" stdDeviation="10" />
        <feColorMatrix
          values="
        1 0 0 0 0
        0 1 0 0 0
        0 0 1 0 0
        0 0 0 20 -10
      "
        />
      </filter>
    </svg>
  </div>
</template>
<script setup>
import { ref, computed } from 'vue';
import svgToMiniDataURI from 'mini-svg-data-uri';
import url from '../assets/bg.svg';
import star from '../assets/star.svg';
import { useMouse } from '@vueuse/core';
const { x, y } = useMouse();
const index = ref('solid');
const type = ref('fractalNoise');
const baseFrequency = ref(0.5);
const numOctaves = ref(3);
const svg = computed(() => {
  return svgToMiniDataURI(`
    <svg xmlns="http://www.w3.org/2000/svg" width="500" height="500">
      <filter id="noise" x="0" y="0">
        <feTurbulence type="${type.value}" baseFrequency="${baseFrequency.value}" numOctaves="${numOctaves.value}" stitchTiles="stitch"/>
        <feBlend mode="screen"/>
      </filter>
      <rect width="500" height="500" filter="url(#noise)" opacity="0.5"/>
    </svg>
  `);
});
const styleObj = computed(() => {
  switch (index.value) {
    case 'linearGradient':
      return {
        background: `linear-gradient(to right, #0B2127, transparent), url("${svg.value}")`,
        height: '100px',
      };
    case 'solid':
      return {
        background: `url(${url}), url("${svg.value}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: '50vh',
      };
  }
});
const gooeyEffectRef = ref(null);
const mousePosStyle = computed(() => {
  const rect = gooeyEffectRef.value?.getBoundingClientRect();
  if (!rect) return {};
  return {
    top: `${y.value - rect.top - rect.height / 2}px`,
    left: `${x.value - rect.left - rect.width / 2}px`,
  };
});
</script>
<style>
.control {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.slider {
  display: flex;
  align-items: center;
}
.container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
.card {
  width: 80%;
  height: 80%;
  background-color: #ffffff10;
  border: 0.8px solid #ffffff;
  backdrop-filter: blur(2px);
  border-radius: 2rem;
  box-sizing: border-box;
}
.star {
  position: absolute;
  right: 0;
  bottom: 0;
}
.gooey-effect {
  height: 300px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  filter: url(#gooey);
}
.blur {
  position: absolute;
  right: 0;
  left: 0;
  top: 0;
  bottom: 0;
  backdrop-filter: blur(20px);
  background-color: #ffffff30;
}
.container2 {
  position: absolute;
  right: 0;
  left: 0;
  top: 0;
  bottom: 0;
  backdrop-filter: blur(20px);
}
.circle {
  position: relative;
  width: 100px;
  height: 100px;
  background-color: #fff;
  border-radius: 50%;
  pointer-events: none;
}
.circle:before {
  content: '';
  position: absolute;
  top: -50px;
  bottom: -50px;
  left: -50px;
  right: -50px;
  border-radius: 50%;
  filter: blur(50px);
  background-color: inherit;
  z-index: -1;
}
.circle1 {
  background: linear-gradient(90deg, #abe661, #abe661, #29cbb4);
}
.circle2 {
  width: 200px;
  height: 200px;
  background: linear-gradient(90deg, #29cbb4, #abe661, #abe661);
}
svg {
  height: 0;
  width: 0;
}
</style>
