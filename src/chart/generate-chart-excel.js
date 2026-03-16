const Excel = require('exceljs');
const fs = require('fs');
const path = require('path');

// 프로젝트 루트 경로
const ROOT_DIR = path.resolve(__dirname, '../../');

// 1. 데이터 읽기
const dataPath = path.join(ROOT_DIR, 'data', 'sample-stock-codes.json');
const stockList = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

// 2. 엑셀 워크북 생성
const workbook = new Excel.Workbook();
const worksheet = workbook.addWorksheet('Stock Codes');

// 3. 차트 기간 정의
const chartPeriods = [
	{ label: "3개월", path: "/candle/day" },
	{ label: "1년", path: "/area/year" },
	{ label: "3년", path: "/area/year3" },
	{ label: "5년", path: "/area/year5" }
];

// 4. 헤더 추가
worksheet.addRow(['종목명', '종목코드', ...chartPeriods.map(p => p.label)]);

// 5. 열 너비 설정
const width = 53.33;

chartPeriods.forEach((_, index) => {
	worksheet.getColumn(index + 3).width = width;
});

// 6. 차트 이미지 생성
const generateChartImage = (code) => {
	const timestamp = Date.now();
	const base = "https://ssl.pstatic.net/imgfinance/chart/item";

	return chartPeriods.map(p => ({
		formula: `IMAGE("${base}${p.path}/${code}.png?sidcode=${timestamp}")`
	}));
};

// 7. 데이터 추가
stockList.forEach(stock => {

	const row = worksheet.addRow([
		stock.종목명,
		stock.종목코드
	]);

	const charts = generateChartImage(stock.종목코드);

	charts.forEach((chart, i) => {
		row.getCell(i + 3).value = chart;
	});

	// 차트 보이도록 행 높이 설정
	row.height = 200;
});

// 8. output 폴더 생성 (없으면)
const outputDir = path.join(ROOT_DIR, 'output');

if (!fs.existsSync(outputDir)) {
	fs.mkdirSync(outputDir);
}

// 9. 파일 저장
const outputPath = path.join(outputDir, 'stock-charts.xlsx');

workbook.xlsx.writeFile(outputPath)
	.then(() => console.log(`✅ 엑셀 파일 저장 완료: ${outputPath}`))
	.catch(err => console.error('❌ 오류 발생:', err));
