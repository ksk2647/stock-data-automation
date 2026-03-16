const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const projectRoot = path.join(__dirname, '../');

// HTML 파일 읽기 (혹은 axios로 네이버 페이지 요청 가능)
const html = fs.readFileSync(path.join(projectRoot, 'theme-table.html'), 'utf-8');  // HTML 파일 경로

const $ = cheerio.load(html);
const result = [];

// <td class="col_type1"><a href=...> 에서 추출
$('td.col_type1 > a').each((i, el) => {
  const href = $(el).attr('href');  // /sise/sise_group_detail.naver?type=theme&no=30
  const themeName = $(el).text().trim();
  const idMatch = href.match(/no=(\d+)/);  // no 값만 추출

  if (idMatch) {
    result.push({
      id: idMatch[1],
      themeName: themeName
    });
  }
});

// JSON 파일로 저장
fs.writeFileSync(path.join(projectRoot, 'data', 'themes.json'), JSON.stringify(result, null, 2), 'utf-8');
console.log('완료! themes.json 저장됨');

