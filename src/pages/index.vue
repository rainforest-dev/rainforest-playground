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
  <div :style="styleObj" class="container">
    <img :src="star" alt="star" class="star" />
    <div class="card" v-show="index === 'solid'"></div>
  </div>
</template>
<script setup>
import { ref, computed } from 'vue';
import svgToMiniDataURI from 'mini-svg-data-uri';
import url from '../assets/bg.png';
import star from '../assets/star.png';
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
        backgroundColor: '#0B2127',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: '50vh',
      };
  }
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
</style>
