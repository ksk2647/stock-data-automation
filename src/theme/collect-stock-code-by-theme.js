const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const themeDir = __dirname;
const dataDir = path.join(themeDir, 'data');

const themesPath = path.join(dataDir, 'themes.json');
const stockCodePath = path.join(dataDir, 'theme-stock-codes.json');

const themes = require(themesPath);

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
	const batchSize = 20;
	let results = [];

	if (fs.existsSync(stockCodePath)) {
		results = JSON.parse(fs.readFileSync(stockCodePath, 'utf-8'));
	}

	const processedIds = new Set(results.map(r => String(r.themeId)));
	const totalThemes = themes.length;
	let processedCount = results.length;

	for (let i = 0; i < themes.length; i += batchSize) {
		const batch = themes.slice(i, i + batchSize);
		const startTime = Date.now();

		for (const theme of batch) {
			if (processedIds.has(String(theme.id))) {
				console.log(`Skipping already processed theme: ${theme.themeName}`);
				continue;
			}

			const url = `https://finance.naver.com/sise/sise_group_detail.naver?type=theme&no=${theme.id}`;

			try {
				const response = await axios.get(url, {
					headers: {
						'User-Agent': 'Mozilla/5.0',
						'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
						'Referer': 'https://finance.naver.com/'
					}
				});

				const $ = cheerio.load(response.data);
				const codes = [];

				$('div.name_area a').each((i, el) => {
					const href = $(el).attr('href');
					const match = href?.match(/code=(\d+)/);
					if (match) {
						codes.push(match[1]);
					}
				});

				results.push({
					themeId: String(theme.id),
					themeName: theme.themeName,
					codes
				});

				processedCount++;
				console.log(`[${processedCount}/${totalThemes}] ${theme.themeName} - ${codes.length} codes`);

				const delay = 1500 + Math.random() * 1500;
				await sleep(delay);
			} catch (error) {
				console.error(`❌ Error fetching theme ${theme.themeName}: ${error.message}`);
			}
		}

		const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);
		fs.writeFileSync(stockCodePath, JSON.stringify(results, null, 2), 'utf-8');
		console.log(`💾 Batch ${Math.floor(i / batchSize) + 1} saved (${elapsedSec}s)`);
	}

	console.log(`✅ theme-stock-codes.json 저장 완료: ${stockCodePath}`);
})();
