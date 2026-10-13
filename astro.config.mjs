import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';

// Своего домена у Community пока нет: показываем на GitHub Pages (адрес и подпапку задаёт workflow).
const SITE = process.env.PUBLIC_SITE_URL || 'https://tema-mail.github.io/community-dealer';
const BASE = process.env.PUBLIC_BASE || '/';

export default defineConfig({
  site: SITE,
  base: BASE,
  integrations: [preact()],
  trailingSlash: 'ignore',
  build: { format: 'directory', inlineStylesheets: 'auto' },
  devToolbar: { enabled: false },
});
