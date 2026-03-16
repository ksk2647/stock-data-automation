const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const themeDir = __dirname;
const dataDir = path.join(themeDir, 'data');

if (!fs.existsSync(dataDir)) {
	fs.mkdirSync(dataDir, { recursive: true });
}

const htmlPath = path.join(themeDir, 'theme-table.html');
const outputPath = path.join(dataDir, 'themes.json');

const html = fs.readFileSync(htmlPath, 'utf-8');
const $ = cheerio.load(html);

const result = [];

$('td.col_type1 > a').each((i, el) => {
	const href = $(el).attr('href');
	const themeName = $(el).text().trim();
	const idMatch = href?.match(/no=(\d+)/);

	if (idMatch) {
		result.push({
			id: idMatch[1],
			themeName
		});
	}
});

fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf-8');
console.log(`✅ themes.json 저장 완료: ${outputPath}`);
