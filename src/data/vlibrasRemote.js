const OFFICIAL_SIGNS_URL = 'https://repository-dth.vlibras.gov.br/api/signs';

let memoryCache = null;

export async function loadOfficialSignList({ timeout = 7000 } = {}) {
  if (memoryCache) return memoryCache;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(OFFICIAL_SIGNS_URL, { signal: controller.signal });
    if (!response.ok) throw new Error(`VLibras respondeu HTTP ${response.status}`);
    const data = await response.json();
    const signs = Array.isArray(data) ? data.map(String).filter(Boolean) : [];
    memoryCache = {
      source: 'VLibras Dictionary Repository',
      endpoint: OFFICIAL_SIGNS_URL,
      fetchedAt: new Date().toISOString(),
      count: signs.length,
      signs,
      set: new Set(signs.map(s => s.toUpperCase()))
    };
    return memoryCache;
  } finally {
    clearTimeout(timer);
  }
}

export function officialEndpoint() {
  return OFFICIAL_SIGNS_URL;
}

export async function checkOfficialCoverage(glosses) {
  try {
    const catalog = await loadOfficialSignList();
    const items = glosses.map(gloss => {
      const base = String(gloss).replace(/-(PASSADO|FUTURO)$/,'').toUpperCase();
      return { gloss, official: catalog.set.has(gloss.toUpperCase()) || catalog.set.has(base) };
    });
    return { available: true, count: catalog.count, items };
  } catch (error) {
    return { available: false, count: 0, items: glosses.map(gloss => ({ gloss, official:false })), error: error.message };
  }
}
