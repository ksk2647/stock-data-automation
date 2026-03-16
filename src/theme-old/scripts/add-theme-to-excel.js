const Excel = require('exceljs');
const fs = require('fs');
const path = require('path');
const dataPath = path.join(__dirname, '../data', 'theme_stock_codes.json');

async function updateKeywords() {
  const workbook = new Excel.Workbook();
  await workbook.xlsx.readFile('/Users/madstorm/Downloads/전체 차트.xlsx');
  const worksheet = workbook.getWorksheet(1); // 첫 번째 시트

  const themeStockCodes = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

  // 종목코드가 들어있는 열 (예: 'B'열)
  const codeColumn = 'D';
  const keywordColumn = 'A'; // 키워드 열 (기존 열)

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // 헤더는 건너뛰기
			const stockCode = row.getCell(codeColumn).value;
			const matchedThemes = themeStockCodes.filter(theme => theme.codes.includes(String(stockCode))).map(theme => theme.themeName);

    if (matchedThemes.length > 0) {
      row.getCell(keywordColumn).value = matchedThemes.join(', ');
    }
  });
  await workbook.xlsx.writeFile('전체목록_업데이트.xlsx');
  console.log('키워드 열 업데이트 완료!');
}

updateKeywords();

