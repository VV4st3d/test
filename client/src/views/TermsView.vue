<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <h1 class="text-3xl font-bold mb-8 text-center">{{ $t('static.terms.title') }}</h1>
    
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
      <h2 class="text-2xl font-semibold mb-4">{{ $t('static.terms.acceptance') }}</h2>
      <p>{{ $t('static.terms.acceptanceText') }}</p>
    </div>
    
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
      <h2 class="text-2xl font-semibold mb-4">{{ $t('static.terms.account') }}</h2>
      <p>{{ $t('static.terms.accountText') }}</p>
    </div>
    
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
      <h2 class="text-2xl font-semibold mb-4">{{ $t('static.terms.intellectualProperty') }}</h2>
      <p>{{ $t('static.terms.intellectualPropertyText') }}</p>
    </div>
    
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
      <h2 class="text-2xl font-semibold mb-4">{{ $t('static.terms.userContent') }}</h2>
      <p>{{ $t('static.terms.userContentText') }}</p>
    </div>
    
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
      <h2 class="text-2xl font-semibold mb-4">{{ $t('static.terms.restrictions') }}</h2>
      <p class="mb-4">{{ $t('static.terms.restrictionsText') }}</p>
      <ul class="list-disc pl-6 mb-4">
        <li class="mb-2">{{ $t('static.terms.restrictionsList.laws') }}</li>
        <li class="mb-2">{{ $t('static.terms.restrictionsList.content') }}</li>
        <li class="mb-2">{{ $t('static.terms.restrictionsList.impersonate') }}</li>
        <li class="mb-2">{{ $t('static.terms.restrictionsList.interfere') }}</li>
        <li>{{ $t('static.terms.restrictionsList.collect') }}</li>
      </ul>
    </div>
    
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
      <h2 class="text-2xl font-semibold mb-4">{{ $t('static.terms.termination') }}</h2>
      <p>{{ $t('static.terms.terminationText') }}</p>
    </div>
    
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
      <h2 class="text-2xl font-semibold mb-4">{{ $t('static.terms.changes') }}</h2>
      <p>{{ $t('static.terms.changesText') }}</p>
    </div>
    
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 class="text-2xl font-semibold mb-4">{{ $t('static.terms.contact') }}</h2>
      <p>{{ $t('static.terms.contactText') }}</p>
    </div>
  </div>
</template>

<script setup>
// Компонент страницы "Условия использования"
</script> 