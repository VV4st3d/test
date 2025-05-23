<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <h1 class="text-3xl font-bold mb-8 text-center">{{ $t('static.about.title') }}</h1>
    
    <section class="mb-10">
      <h2 class="text-2xl font-semibold mb-4">{{ $t('static.about.mission') }}</h2>
      <p class="text-lg">{{ $t('static.about.missionText') }}</p>
    </section>
    
    <section class="mb-10">
      <h2 class="text-2xl font-semibold mb-4">{{ $t('static.about.team') }}</h2>
      <p class="text-lg">{{ $t('static.about.teamText') }}</p>
    </section>
    
    <section>
      <h2 class="text-2xl font-semibold mb-4">{{ $t('static.about.approach') }}</h2>
      <p class="text-lg mb-4">{{ $t('static.about.approachText') }}</p>
      <ul class="list-disc pl-6 text-lg">
        <li class="mb-2">{{ $t('static.about.features.tasks') }}</li>
        <li class="mb-2">{{ $t('static.about.features.articles') }}</li>
        <li>{{ $t('static.about.features.community') }}</li>
      </ul>
    </section>
  </div>
</template>

<script setup>
// Компонент страницы "О нас"
</script> 