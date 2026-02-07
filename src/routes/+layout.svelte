<script lang="ts">
  import '../app.css';
  import { page } from '$app/stores';
  import { locale, t, type Locale } from '$lib/i18n';

  const setLocale = (value: Locale) => {
    locale.set(value);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('cts-locale', value);
    }
  };

  if (typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem('cts-locale') as Locale | null;
    if (saved === 'en' || saved === 'th') locale.set(saved);
  }
</script>

<div class="app-shell flex min-h-screen flex-col">
  <header class="app-container sticky top-0 z-40 py-4">
    <div class="topbar flex flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
      <a class="text-2xl font-bold tracking-tighter text-[#160204] hover:text-[#e18e90] transition-colors" href="/">{t($locale, 'app.name')}</a>
      <nav class="flex flex-wrap items-center gap-1 text-xs sm:text-sm">
        <a class={`rounded-3xl px-4 py-2 font-medium transition-all ${$page.url.pathname === '/' ? 'bg-[#f2bc56] text-[#160204] shadow-elevation-1' : 'text-[#5d3438] hover:bg-[#fff2e3]'}`} href="/">{t($locale, 'nav.home')}</a>
        <a
          class={`rounded-3xl px-4 py-2 font-medium transition-all ${$page.url.pathname.startsWith('/projects') || $page.url.pathname.startsWith('/project/') ? 'bg-[#f2bc56] text-[#160204] shadow-elevation-1' : 'text-[#5d3438] hover:bg-[#fff2e3]'}`}
          href="/projects"
          >{t($locale, 'nav.projects')}</a
        >
        <a class={`rounded-3xl px-4 py-2 font-medium transition-all ${$page.url.pathname.startsWith('/login') ? 'bg-[#f2bc56] text-[#160204] shadow-elevation-1' : 'text-[#5d3438] hover:bg-[#fff2e3]'}`} href="/login">{t($locale, 'nav.login')}</a>
        <div class="inline-flex gap-1 rounded-full border border-[#f0d2b8] bg-white p-1 ml-2">
          <button class={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${$locale === 'en' ? 'bg-[#e18e90] text-white shadow-elevation-1' : 'text-[#5d3438] hover:text-[#160204]'}`} on:click={() => setLocale('en')}>EN</button>
          <button class={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${$locale === 'th' ? 'bg-[#e18e90] text-white shadow-elevation-1' : 'text-[#5d3438] hover:text-[#160204]'}`} on:click={() => setLocale('th')}>TH</button>
        </div>
      </nav>
    </div>
  </header>

  <main class="app-container min-h-0 flex-1 pb-8">
    <slot />
  </main>

  <footer class="app-container pb-6">
    <div class="footerbar rounded-[1.8rem] border border-[#f1d2b8] bg-[#fff0e8] px-5 py-4 text-xs text-[#5d3438] shadow-sm">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p class="font-medium">{t($locale, 'footer.tag')}</p>
        <p>{t($locale, 'footer.desc')}</p>
      </div>
    </div>
  </footer>
</div>
