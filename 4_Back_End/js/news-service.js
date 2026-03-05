/**
 * News Service - Trilha dos Juros
 * Usa rss2json.com API para converter RSS em JSON sem problemas de CORS.
 */

const NewsService = (function () {

    // Feeds especializados em finanças brasileiras
    const RSS_FEEDS = [
        { name: 'InfoMoney - Mercados', url: 'https://www.infomoney.com.br/mercados/feed/', tag: 'macro' },
        { name: 'InfoMoney - Renda Fixa', url: 'https://www.infomoney.com.br/onde-investir/renda-fixa/feed/', tag: 'rf' },
        { name: 'Valor - Finanças', url: 'https://valor.globo.com/rss/financas/', tag: 'rf' },
        { name: 'Valor - Brasil', url: 'https://valor.globo.com/rss/brasil/', tag: 'macro' }
    ];

    // Usa rss2json.com - API gratuita e confiável para RSS no browser
    async function fetchFromFeed(feed) {
        try {
            const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}&count=20`;
            const response = await fetch(apiUrl);
            if (!response.ok) return [];

            const data = await response.json();
            if (data.status !== 'ok' || !data.items || data.items.length === 0) return [];

            return data.items.map(item => ({
                title: (item.title || '').trim(),
                link: (item.link || '').trim(),
                date: item.pubDate ? new Date(item.pubDate) : new Date(),
                source: feed.name,
                originalTag: feed.tag
            })).filter(n => n.title && n.link);

        } catch (e) {
            console.warn(`[NewsService] Erro ao buscar ${feed.name}:`, e);
            return [];
        }
    }

    async function fetchNews() {
        console.log('[Trilha dos Juros] Buscando notícias via rss2json...');

        const fetchPromises = RSS_FEEDS.map(feed => fetchFromFeed(feed));
        const results = await Promise.allSettled(fetchPromises);

        const allNews = results
            .filter(r => r.status === 'fulfilled')
            .flatMap(r => r.value)
            .sort((a, b) => b.date - a.date);

        console.log(`[NewsService] Total de notícias encontradas: ${allNews.length}`);

        // 4 Pilares fixos
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
                title.includes('título') || item.originalTag === 'rf'
            );

            return { isCompany, isCambio, isRF };
        };

        // Passo 1: Classificação ideal
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

        // Passo 2: Fallback para slots vazios com qualquer notícia disponível (sem repetir)
        slots.forEach(slot => {
            if (!slot.item) {
                const next = allNews.find(n => !seenTitles.has(n.title.toLowerCase()));
                if (next) {
                    slot.item = next;
                    seenTitles.add(next.title.toLowerCase());
                }
            }
        });

        return slots.map(s => {
            const item = s.item || { title: 'Sem notícias no momento.', link: '#', source: 'Trilha dos Juros', date: new Date() };
            return { ...item, tagLabel: s.label, tagClass: s.class };
        });
    }

    return { fetchNews };

})();
