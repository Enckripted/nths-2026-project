<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import HelloWorld from './components/HelloWorld.vue'
import  Prompting from './components/Prompting.vue'

</script>

<template>
  <header>
    <div class="header-content">
      <div class="logo-container">
        <div class="logo-icon"></div>
        <span class="logo-text">Enckripted</span>
      </div>
      <nav>
        <RouterLink to="/" class="nav-link">Home</RouterLink>
      </nav>
      <Prompting />
    </div>
  </header>

  <RouterView />
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
@import 'tailwindcss';

:root {
  --primary: #6366f1;
  --primary-hover: #4f46e5;
  --bg-color: #f8fafc;
  --card-bg: #ffffff;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --border-color: #e2e8f0;
  --font-family: 'Inter', system-ui, -apple-system, sans-serif;
  --header-height: 80px;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: var(--font-family);
  background-color: var(--bg-color);
  color: var(--text-primary);
  line-height: 1.5;
  margin: 0;
  padding: 0;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

header {
  height: var(--header-height);
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  padding: 0 4rem;
}

.header-content {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
}

.logo-text {
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.025em;
  color: var(--text-primary);
}

nav {
  display: flex;
  gap: 2rem;
}

.nav-link {
  text-decoration: none;
  font-weight: 500;
  color: var(--text-secondary);
  transition: all 0.2s ease-in-out;
  padding: 0.5rem 0;
}

.nav-link:hover {
  color: var(--primary);
}

.nav-link.router-link-active {
  color: var(--primary);
  border-bottom: 2px solid var(--primary);
}

@media (max-width: 768px) {
  header {
    padding: 0 2rem;
  }
}
</style>
