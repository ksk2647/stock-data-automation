const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const dataPath = path.join(__dirname, '../data');

const themes = require(path.join(dataPath, 'themes.json'));

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
	const batchSize = 20;
	let results = [];
	const stockCodePath = path.join(dataPath, 'theme_stock_codes.json');
	if (fs.existsSync(stockCodePath)) {
		results = JSON.parse(fs.readFileSync(stockCodePath, 'utf-8'));
	}
	const processedIds = new Set(results.map(r => r.themeId));
	const totalThemes = themes.length;
	let processedCount = results.length;
	for (let i = 0; i < themes.length; i += batchSize) {
		const batch = themes.slice(i, i + batchSize);
		const startTime = Date.now();

		for (const theme of batch) {
			if (processedIds.has(theme.id)) {
				console.log(`Skipping already processed theme: ${theme.themeName}`);
				continue;
			}
			const url = `https://finance.naver.com/sise/sise_group_detail.naver?type=theme&no=${theme.id}`;
			try {
				const response = await axios.get(url, {
					headers: {
						'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36',
						'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
						'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
						'Connection': 'keep-alive',
						'Referer': 'https://finance.naver.com/',
						'Cache-Control': 'no-cache'
					}
				});
				const $ = cheerio.load(response.data);
				const codes = [];
				$('div.name_area a').each((i, el) => {
					const href = $(el).attr('href');
					const match = href.match(/code=(\d+)/);
					if (match) {
						codes.push(match[1]);
					}
				});
				results.push({ themeId: theme.id, themeName: theme.themeName, codes });
				processedCount++;
				console.log(`Processed (${processedCount}/${totalThemes}) Theme: ${theme.themeName}, Codes:`, codes);

				// 요청 간격 랜덤 1.5 ~ 3초
				const delay = 1500 + Math.random() * 1500;
				await sleep(delay);
			} catch (error) {
				console.error(`Error fetching theme ${theme.themeName}:`, error);
			}
		}

		const endTime = Date.now();
		console.log(`Batch ${i / batchSize + 1}: Processed ${batch.length} themes in ${(endTime - startTime) / 1000} seconds`);

		// 중간 저장
		fs.writeFileSync(stockCodePath, JSON.stringify(results, null, 2));
		console.log(`Batch ${i / batchSize + 1} saved to projectRoot/data/theme_stock_codes.json`);
	}
})();

