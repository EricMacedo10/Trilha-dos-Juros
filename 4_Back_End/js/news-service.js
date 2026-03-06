/**
 * News Service - Trilha dos Juros
 * Multi-Source Fetching com saltos automáticos entre provedores (RSS + Proxy).
 * Arquitetura resiliente conforme SKILL_SENIOR_WORKFLOW.md.
 */

const NewsService = (function () {

    // Feeds RSS diretos (sem dependência de proxy para leitura direta)
    const RSS_FEEDS = [
        { name: 'InfoMoney - Mercados', url: 'https://www.infomoney.com.br/mercados/feed/', tag: 'macro' },
        { name: 'InfoMoney - RF', url: 'https://www.infomoney.com.br/onde-investir/feed/', tag: 'rf' },
        { name: 'G1 - Economia', url: 'https://g1.globo.com/dynamo/economia/rss2.xml', tag: 'macro' },
        { name: 'Agência Brasil - Economia', url: 'https://agenciabrasil.ebc.com.br/economia/feed', tag: 'rf' }
    ];

    // Estratégia de proxies para contornar CORS (salto automático)
    const PROXIES = [
        { name: 'LocalPHP_B64', fn: (url) => `/news-proxy.php?b64url=${btoa(url)}`, type: 'text' },
        { name: 'LocalPHP', fn: (url) => `/news-proxy.php?url=${encodeURIComponent(url)}`, type: 'text' },
        { name: 'AllOrigins', fn: (url) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`, type: 'json' },
        { name: 'CORSAnywhere', fn: (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`, type: 'text' }
    ];

    async function fetchFromFeed(feed) {
        for (const proxy of PROXIES) {
            try {
                const proxyUrl = proxy.fn(feed.url);
                const response = await fetch(proxyUrl, { signal: AbortSignal.timeout(8000) });
                if (!response.ok) continue;

                let xmlContent;
                if (proxy.type === 'json') {
                    const data = await response.json();
                    xmlContent = data.contents;
                } else {
                    xmlContent = await response.text();
                }

                if (!xmlContent || typeof xmlContent !== 'string' || xmlContent.length < 200) continue;
                if (xmlContent.includes('<error>') || xmlContent.includes('Page not found')) continue;

                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');

                let items = xmlDoc.querySelectorAll('item');
                if (items.length === 0) items = xmlDoc.querySelectorAll('entry');
                if (items.length === 0) continue;

                const news = [];
                items.forEach((item, index) => {
                    if (index < 20) {
                        const title = (item.querySelector('title')?.textContent || '').trim()
                            .replace('<![CDATA[', '').replace(']]>', '');
                        const link = (item.querySelector('link')?.textContent || item.querySelector('link')?.getAttribute('href') || '').trim();
                        const pubDate = item.querySelector('pubDate')?.textContent || item.querySelector('published')?.textContent;

                        if (title && link && title.length > 10) {
                            news.push({
                                title,
                                link,
                                date: pubDate ? new Date(pubDate) : new Date(),
                                source: feed.name,
                                originalTag: feed.tag
                            });
                        }
                    }
                });

                if (news.length > 0) {
                    console.log(`[NewsService] ✅ ${feed.name} via ${proxy.name}: ${news.length} notícias`);
                    return news;
                }

            } catch (e) {
                // Silently continue to next proxy
            }
        }
        console.warn(`[NewsService] ❌ Falha total para: ${feed.name}`);
        return [];
    }

    async function fetchNews() {
        console.log('[Trilha dos Juros] Iniciando busca multi-fonte...');

        const fetchPromises = RSS_FEEDS.map(feed => fetchFromFeed(feed));
        const results = await Promise.allSettled(fetchPromises);

        const allNews = results
            .filter(r => r.status === 'fulfilled')
            .flatMap(r => r.value)
            .sort((a, b) => b.date - a.date);

        console.log(`[NewsService] Total consolidado: ${allNews.length} notícias`);

        const slots = [
            { key: 'geral', label: 'Geral', class: 'macro', item: null },
            { key: 'empresas', label: 'Empresas', class: 'macro', item: null },
            { key: 'cambio', label: 'Câmbio', class: 'macro', item: null },
            { key: 'rendafixa', label: 'Renda Fixa', class: 'rf', item: null }
        ];

        const seenTitles = new Set();

        const classify = (item) => {
            const title = item.title.toLowerCase();

            const isCompany = (/\([A-Z0-9]{4,5}\)/.test(item.title) ||
                title.includes('petrobras') || title.includes('vale3') ||
                title.includes('itau') || title.includes('bradesco') ||
                title.includes('dividendo') || title.includes('fluxo de caixa')) &&
                !title.includes('banco central');

            const isCambio = title.includes('dólar') || title.includes('dolar') ||
                title.includes('euro') || title.includes('câmbio') ||
                title.includes('moeda') || title.includes('petróleo');

            const isRF = !isCompany && (
                title.includes('selic') || title.includes('juros') || title.includes('lca') ||
                title.includes('lci') || title.includes('cdb') || title.includes('poupança') ||
                title.includes('tesouro') || title.includes('ipca') || title.includes('renda fixa') ||
                title.includes('copom') || title.includes('inflação') || title.includes('cdi') ||
                title.includes('taxa') || item.originalTag === 'rf'
            );

            return { isCompany, isCambio, isRF };
        };

        // Passo 1: classificação ideal
        for (const item of allNews) {
            const { isCompany, isCambio, isRF } = classify(item);
            const title = item.title.toLowerCase();
            if (seenTitles.has(title)) continue;

            if (isRF && !slots[3].item) {
                slots[3].item = item; seenTitles.add(title);
            } else if (isCambio && !isCompany && !slots[2].item) {
                slots[2].item = item; seenTitles.add(title);
            } else if (isCompany && !slots[1].item) {
                slots[1].item = item; seenTitles.add(title);
            } else if (!isCompany && !isCambio && !isRF && !slots[0].item) {
                slots[0].item = item; seenTitles.add(title);
            }
        }

        // Passo 2: fallback - preenche slots vazios com qualquer notícia disponível
        slots.forEach(slot => {
            if (!slot.item) {
                const next = allNews.find(n => !seenTitles.has(n.title.toLowerCase()));
                if (next) { slot.item = next; seenTitles.add(next.title.toLowerCase()); }
            }
        });

        return slots.map(s => {
            const item = s.item || { title: 'Sem notícias no momento.', link: '#', source: 'Trilha dos Juros', date: new Date() };
            return { ...item, tagLabel: s.label, tagClass: s.class };
        });
    }

    return { fetchNews };

})();
