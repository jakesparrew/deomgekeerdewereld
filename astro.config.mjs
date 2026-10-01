// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://deomgekeerdewereld.be',
  trailingSlash: 'always',

  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'nl',
        locales: { nl: 'nl-BE', en: 'en' },
      },
      // Pagina's met noindex horen niet in de sitemap: dat is een tegenstrijdig
      // signaal naar Google. Houd deze lijst gelijk met de noindex-vlaggen.
      filter: (page) => !page.includes('/404') && !page.includes('/stijlgids'),
    }),
  ],

  build: {
    format: 'directory',
    // Eén stylesheet in plaats van tientallen kleine <style> blokken.
    inlineStylesheets: 'auto',
  },

  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },

  vite: {
    build: {
      cssMinify: 'lightningcss',
    },
  },
});
