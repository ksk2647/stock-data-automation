# Stock Data Automation

네이버 금융 데이터를 이용해 **주식 차트(3개월,1년,3년,5년), 종목 요약, 테마 정보를 자동으로 수집하고 Excel 보고서를 생성하는 자동화 스크립트입니다.**

Node.js로 데이터를 수집하고, Python으로 Excel 처리를 수행하는 간단한 데이터 파이프라인 형태로 구성되어 있습니다.

---

# 기능

- 종목 차트 이미지가 포함된 Excel 생성
- 네이버 금융 종목 요약 크롤링
- Excel 셀에 요약 정보를 주석(Comment)으로 추가
- 네이버 금융 테마 정보 수집
- 최종 Excel에 테마 정보 추가

---

# 프로젝트 구조

---

# Project Structure
```text
stock-data-automation
├─ src
│ ├─ chart
│ │ └─ generate-chart-excel.js
│ │
│ ├─ comment
│ │ ├─ get-comments.js
│ │ ├─ add-comments-to-excel.py
│ │ └─ data
│ │
│ └─ theme
│ ├─ run-theme-pipeline.js
│ ├─ extract-theme-from-html.js
│ ├─ collect-stock-code-by-theme.js
│ └─ add-theme-to-excel.js
│
├─ data
│ └─ sample-stock-codes.json
│
├─ output
│
├─ package.json
├─ requirements.txt
└─ README.md
```

---

# 설치

## 1. 저장소 클론

```bash
git clone https://github.com/yourname/stock-data-automation.git
cd stock-data-automation
```

## 2. Node 패키지 설치

```bash
npm install
```


## 3. Python 패키지 설치

```bash
python3 -m pip install -r requirements.txt
```

---

# 실행

결과 파일은 output/ 폴더에 생성됩니다.

## 전체 파이프라인 실행

```bash
npm run all
```


## 실행 과정
```text
종목 목록
   ↓
차트 Excel 생성
   ↓
종목 요약 수집
   ↓
Excel에 주석 추가
   ↓
테마 정보 수집
   ↓
최종 Excel 생성
```

## 개별 실행

각 단계는 개별적으로 실행할 수도 있습니다.
```bash
npm run chart
```
```bash
npm run comment:fetch
```
```bash
npm run comment:apply
```
```bash
npm run theme
```

---

# 사용 기술

* Node.js
* Python
* ExcelJS
* OpenPyXL
* Axios
* Cheerio

---

# 참고

이 프로젝트는 개인적으로 주식 데이터를 정리하기 위해 만든 자동화 도구입니다.
데이터는 **네이버 금융(Naver Finance)**에서 수집합니다.

---
