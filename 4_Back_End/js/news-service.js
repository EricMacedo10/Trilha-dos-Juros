/**
 * News Service - Trilha dos Juros
 * Usa proxy PHP local no servidor para buscar RSS sem problemas de CORS.
 */

const NewsService = (function () {

    const RSS_FEEDS = [
        { name: 'InfoMoney - Mercados', url: 'https://www.infomoney.com.br/mercados/feed/', tag: 'macro' },
        { name: 'InfoMoney - Renda Fixa', url: 'https://www.infomoney.com.br/onde-investir/renda-fixa/feed/', tag: 'rf' },
        { name: 'Valor - Finanças', url: 'https://valor.globo.com/rss/financas/', tag: 'rf' },
        { name: 'Valor - Brasil', url: 'https://valor.globo.com/rss/brasil/', tag: 'macro' }
    ];

    // Proxy PHP local no servidor (caminho absoluto) + fallback AllOrigins
    const PROXIES = [
        { name: 'LocalPHP', fn: (url) => `/news-proxy.php?url=${encodeURIComponent(url)}`, type: 'text' },
        { name: 'AllOrigins', fn: (url) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`, type: 'json' }
    ];

    async function fetchFromFeed(feed) {
        for (const proxy of PROXIES) {
            try {
                const proxyUrl = proxy.fn(feed.url);
                const response = await fetch(proxyUrl);
                if (!response.ok) continue;

                let xmlContent;
                if (proxy.type === 'json') {
                    const data = await response.json();
                    xmlContent = data.contents;
                } else {
                    xmlContent = await response.text();
                }

                if (!xmlContent || typeof xmlContent !== 'string' || xmlContent.length < 100) continue;

                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');

                let items = xmlDoc.querySelectorAll('item');
                if (items.length === 0) items = xmlDoc.querySelectorAll('entry');

                const news = [];
                items.forEach((item, index) => {
                    if (index < 20) {
                        const title = (item.querySelector('title')?.textContent || '').trim();
                        const link = (item.querySelector('link')?.textContent || item.querySelector('link')?.getAttribute('href') || '').trim();
                        const pubDate = item.querySelector('pubDate')?.textContent || item.querySelector('published')?.textContent;

                        if (title && link) {
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

                if (news.length > 0) return news;

            } catch (e) {
                console.warn(`[NewsService] Proxy ${proxy.name} falhou para ${feed.name}:`, e);
            }
        }
        return [];
    }

    async function fetchNews() {
        console.log('[Trilha dos Juros] Buscando notícias...');

        const fetchPromises = RSS_FEEDS.map(feed => fetchFromFeed(feed));
        const results = await Promise.allSettled(fetchPromises);

        const allNews = results
            .filter(r => r.status === 'fulfilled')
            .flatMap(r => r.value)
            .sort((a, b) => b.date - a.date);

        console.log(`[NewsService] Total: ${allNews.length} notícias`);

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
                title.includes('petrobras') || title.includes('vale') || title.includes('itau') ||
                title.includes('bradesco') || title.includes('ações') ||
                title.includes('resultado') || title.includes('prejuízo') || title.includes('lucro') ||
                title.includes('dividendo') || title.includes('fluxo de caixa')) &&
                !title.includes('banco central');

            const isCambio = title.includes('dólar') || title.includes('dolar') || title.includes('euro') ||
                title.includes('câmbio') || title.includes('moeda') || title.includes('fed');

            const isRF = !isCompany && (
                title.includes('selic') || title.includes('juros') || title.includes('lca') ||
                title.includes('lci') || title.includes('cdb') || title.includes('poupança') ||
                title.includes('tesouro') || title.includes('ipca') || title.includes('renda fixa') ||
                title.includes('copom') || title.includes('inflação') || title.includes('cdi') ||
                item.originalTag === 'rf'
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

        // Passo 2: preenche slots vazios com o que sobrou
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
