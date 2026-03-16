const Excel = require('exceljs');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../../');
const dataPath = path.join(__dirname, 'data', 'theme-stock-codes.json');

// comments까지 반영된 파일이 있으면 그걸 쓰고, 없으면 기본 차트 파일 사용
const preferredInput = path.join(ROOT, 'output', 'stock-charts-with-comments.xlsx');
const fallbackInput = path.join(ROOT, 'output', 'stock-charts.xlsx');
const outputFile = path.join(ROOT, 'output', 'stock-charts-final.xlsx');

async function addThemesToExcel() {
	const inputFile = fs.existsSync(preferredInput) ? preferredInput : fallbackInput;

	const workbook = new Excel.Workbook();
	await workbook.xlsx.readFile(inputFile);
	const worksheet = workbook.getWorksheet(1);

	const themeStockCodes = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

	// 마지막 열 다음에 "테마" 컬럼 추가
	const themeColumnIndex = worksheet.columnCount + 1;
	worksheet.getRow(1).getCell(themeColumnIndex).value = '테마';

	worksheet.eachRow((row, rowNumber) => {
		if (rowNumber === 1) return;

		// chart 파일 기준 종목코드는 B열
		const stockCode = row.getCell(2).value;
		const stockCodeStr = stockCode ? String(stockCode).trim() : '';

		const matchedThemes = themeStockCodes
			.filter(theme => theme.codes.includes(stockCodeStr))
			.map(theme => theme.themeName);

		if (matchedThemes.length > 0) {
			row.getCell(themeColumnIndex).value = matchedThemes.join(', ');
		}
	});

	await workbook.xlsx.writeFile(outputFile);
	console.log(`✅ 테마 열 업데이트 완료: ${outputFile}`);
}

addThemesToExcel().catch(err => {
	console.error('❌ add-theme-to-excel 실패:', err);
});
