/**
 * News Service - Trilha dos Juros
 * Orquestra a busca de notícias financeiras focadas em Renda Fixa e Brasil com 4 pilares fixos.
 */

const NewsService = (function () {

    const RSS_FEEDS = [
        { name: 'InfoMoney - Renda Fixa', url: 'https://www.infomoney.com.br/onde-investir/renda-fixa/feed/', tag: 'rf' },
        { name: 'E-Investidor - Renda Fixa', url: 'https://einvestidor.estadao.com.br/econometria/renda-fixa/feed/', tag: 'rf' },
        { name: 'Valor - Finanças', url: 'https://valor.globo.com/rss/financas/', tag: 'rf' }
    ];

    const PROXIES = [
        { name: 'AllOrigins', fn: (url) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`, type: 'json' },
        { name: 'CORSProxy.io', fn: (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`, type: 'text' }
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
                const xmlDoc = parser.parseFromString(xmlContent, "text/xml");

                let items = xmlDoc.querySelectorAll("item");
                if (items.length === 0) items = xmlDoc.querySelectorAll("entry");

                const news = [];
                items.forEach((item, index) => {
                    if (index < 10) { // Base maior para classificação
                        const title = (item.querySelector("title")?.textContent || "").trim();
                        const link = (item.querySelector("link")?.textContent || item.querySelector("link")?.getAttribute("href") || "").trim();
                        const pubDate = (item.querySelector("pubDate")?.textContent || item.querySelector("published")?.textContent || item.querySelector("updated")?.textContent);

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
            } catch (e) { }
        }
        return [];
    }

    async function fetchNews() {
        console.log('[Trilha dos Juros] Organizando notícias em 4 pilares fixos...');

        const fetchPromises = RSS_FEEDS.map(feed => fetchFromFeed(feed));
        const results = await Promise.allSettled(fetchPromises);

        const allNews = results
            .filter(r => r.status === 'fulfilled')
            .flatMap(r => r.value)
            .sort((a, b) => b.date - a.date);

        // Pilares 100% focados em Renda Fixa
        const slots = [
            { key: 'cdb', label: 'CDB', class: 'rf', item: null },
            { key: 'lci_lca', label: 'LCI / LCA', class: 'rf', item: null },
            { key: 'poupança', label: 'Poupança', class: 'rf', item: null },
            { key: 'tesouro', label: 'Tesouro Direto', class: 'rf', item: null }
        ];

        const seenTitles = new Set();

        const classify = (item) => {
            const title = item.title.toLowerCase();

            // Filtro rigoroso para excluir empresas/ações
            const isCompany = /\([A-Z0-9]{4,5}\)/.test(item.title) ||
                title.includes('ações') || title.includes('petrobras') || title.includes('vale') ||
                title.includes('banco') || title.includes('itau') || title.includes('bradesco') ||
                title.includes('dividendo') || title.includes('jcp') || title.includes('resultado') ||
                title.includes('balanço') || title.includes('fluxo de caixa') || title.includes('setor hospitalar');

            const isCDB = title.includes('cdb') || title.includes('banco') && title.includes('rendimento');
            const isLC = title.includes('lci') || title.includes('lca');
            const isPoupança = title.includes('poupança') || title.includes('poupanca');
            const isTesouro = title.includes('tesouro') || title.includes('selic') || title.includes('ipca') || title.includes('copom');

            return { isCompany, isCDB, isLC, isPoupança, isTesouro };
        };

        // Passo 1: Atribuição por categoria específica, bloqueando empresas
        for (const item of allNews) {
            const { isCompany, isCDB, isLC, isPoupança, isTesouro } = classify(item);
            const title = item.title.toLowerCase();
            if (seenTitles.has(title) || isCompany) continue;

            if (isCDB && !slots[0].item) {
                slots[0].item = item; seenTitles.add(title);
            } else if (isLC && !slots[1].item) {
                slots[1].item = item; seenTitles.add(title);
            } else if (isPoupança && !slots[2].item) {
                slots[2].item = item; seenTitles.add(title);
            } else if (isTesouro && !slots[3].item) {
                slots[3].item = item; seenTitles.add(title);
            }
        }

        // Paso 2: Fallback para qualquer notícia de Renda Fixa que sobrou (sem empresas)
        for (const item of allNews) {
            const { isCompany } = classify(item);
            const title = item.title.toLowerCase();
            if (seenTitles.has(title) || isCompany) continue;

            const emptySlot = slots.find(s => !s.item);
            if (emptySlot) {
                emptySlot.item = item;
                seenTitles.add(title);
            }
        }



        // Montar array final com classes e labels estritos
        return slots.map(s => {
            const item = s.item || { title: 'Sem notícias recentes neste pilar.', link: '#', source: 'Trilha dos Juros', date: new Date() };
            return {
                ...item,
                tagLabel: s.label,
                tagClass: s.class
            };
        });
    }

    return { fetchNews };

})();
