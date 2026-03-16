const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const chardet = require('chardet');
const XLSX = require('xlsx');
const path = require('path');

const ROOT = path.resolve(__dirname, '../../');

const dataDir = path.join(__dirname, 'data');

const inputFile = path.join(ROOT, 'output', 'stock-charts.xlsx');

const outputJson = path.join(dataDir, 'comments.json');
const progressJson = path.join(dataDir, 'comments-progress.json');

const saveInterval = 20;

// Excel 읽기
const workbook = XLSX.readFile(inputFile);
const worksheet = workbook.Sheets[workbook.SheetNames[0]];

const headers = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0];

const stockNameCol = 0;
const stockCodeCol = 1;

const stockList = XLSX.utils.sheet_to_json(worksheet)
	.map(row => ({
		name: row[headers[stockNameCol]],
		code: row[headers[stockCodeCol]]
	}))
	.filter(stock => stock.name && stock.code);

// 진행 데이터
let results = [];

if (fs.existsSync(progressJson)) {
	results = JSON.parse(fs.readFileSync(progressJson, 'utf-8'));
	console.log(`🔄 이전 진행 내역 ${results.length}`);
}

// 크롤링
async function fetchSummary(stockCode) {

	const url = `https://finance.naver.com/item/main.naver?code=${stockCode}`;

	const response = await axios.get(url, {
		responseType: 'arraybuffer'
	});

	const buffer = Buffer.from(response.data);
	const encoding = chardet.detect(buffer) || 'UTF-8';
	const decoded = iconv.decode(buffer, encoding);
	const $ = cheerio.load(decoded);
	const summary = [];

	$('#summary_info p').each((i, el) => {
		summary.push($(el).text().trim());
	});

	return summary.join('\n');
}

(async () => {
	let count = results.length;

	for (const { name, code } of stockList.slice(count)) {
		count++;

		try {
			const summary = await fetchSummary(code);
			results.push({ name, code, summary });
			console.log(`[${count}/${stockList.length}] ${name}`);
		} catch (err) {
			results.push({ name, code, summary: '' });
			console.log(`[${count}] 실패 ${name}`);
		}

		if (count % saveInterval === 0) {

			fs.writeFileSync(progressJson, JSON.stringify(results, null, 2));
			console.log(`💾 progress 저장 ${count}`);
		}

		await new Promise(r => setTimeout(r, 2000));
	}

	fs.writeFileSync(outputJson, JSON.stringify(results, null, 2));
	console.log('완료');
})();
