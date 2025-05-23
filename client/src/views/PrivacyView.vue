<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <h1 class="text-3xl font-bold mb-8 text-center">{{ $t('static.privacy.title') }}</h1>
    
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
      <h2 class="text-2xl font-semibold mb-4">{{ $t('static.privacy.intro') }}</h2>
      <p class="mb-4">{{ $t('static.privacy.introText') }}</p>
    </div>
    
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
      <h2 class="text-2xl font-semibold mb-4">{{ $t('static.privacy.collection') }}</h2>
      <p class="mb-4">{{ $t('static.privacy.collectionText') }}</p>
      <ul class="list-disc pl-6 mb-4">
        <li class="mb-2">{{ $t('static.privacy.collectionTypes.personal') }}</li>
        <li class="mb-2">{{ $t('static.privacy.collectionTypes.usage') }}</li>
        <li>{{ $t('static.privacy.collectionTypes.technical') }}</li>
      </ul>
    </div>
    
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
      <h2 class="text-2xl font-semibold mb-4">{{ $t('static.privacy.usage') }}</h2>
      <p class="mb-4">{{ $t('static.privacy.usageText') }}</p>
      <ul class="list-disc pl-6 mb-4">
        <li class="mb-2">{{ $t('static.privacy.usageTypes.access') }}</li>
        <li class="mb-2">{{ $t('static.privacy.usageTypes.personalization') }}</li>
        <li class="mb-2">{{ $t('static.privacy.usageTypes.improvement') }}</li>
        <li>{{ $t('static.privacy.usageTypes.security') }}</li>
      </ul>
    </div>
    
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
      <h2 class="text-2xl font-semibold mb-4">{{ $t('static.privacy.storage') }}</h2>
      <p>{{ $t('static.privacy.storageText') }}</p>
    </div>
    
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
      <h2 class="text-2xl font-semibold mb-4">{{ $t('static.privacy.rights') }}</h2>
      <p class="mb-4">{{ $t('static.privacy.rightsText') }}</p>
      <ul class="list-disc pl-6 mb-4">
        <li class="mb-2">{{ $t('static.privacy.rightsTypes.access') }}</li>
        <li class="mb-2">{{ $t('static.privacy.rightsTypes.correction') }}</li>
        <li class="mb-2">{{ $t('static.privacy.rightsTypes.deletion') }}</li>
        <li>{{ $t('static.privacy.rightsTypes.portability') }}</li>
      </ul>
    </div>
    
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
      <h2 class="text-2xl font-semibold mb-4">{{ $t('static.privacy.changes') }}</h2>
      <p>{{ $t('static.privacy.changesText') }}</p>
    </div>
    
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 class="text-2xl font-semibold mb-4">{{ $t('static.privacy.contact') }}</h2>
      <p>{{ $t('static.privacy.contactText') }}</p>
    </div>
  </div>
</template>

<script setup>
// Компонент страницы "Политика конфиденциальности"
</script> 