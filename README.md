# 📖 도서 관리 시스템 README.MD
KT AIVLE School 미니 프로젝트 4차

## 1. 프로젝트 소개
AI 표지 생성을 지원하는 도서 관리 시스템입니다.

## 2. 설치 및 실행

### Requirements

### Installation
```
$ git clone https://github.com/BcKmini/Book-management.git
```

### Backend
```
$ npx json-server --watch db.json
```

### Frontend
```
$ npm install
$ npm run dev
```

## 3. 기술 스택

### Environment
<img src="https://img.shields.io/badge/VISUAL STUDIO CODE-181717?style=for-the-badge&logo=none&logoColor=white"> <img src="https://img.shields.io/badge/github-181717?style=for-the-badge&logo=github&logoColor=white"> <img src="https://img.shields.io/badge/git-F05032?style=for-the-badge&logo=git&logoColor=white">

### Development
<img src="https://img.shields.io/badge/python-3776AB?style=for-the-badge&logo=python&logoColor=white"> <img src="https://img.shields.io/badge/javascript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black"> <img src="https://img.shields.io/badge/react-61DAFB?style=for-the-badge&logo=react&logoColor=black"> <img src="https://img.shields.io/badge/vite-9135FF?style=for-the-badge&logo=vite&logoColor=black"> <img src="https://img.shields.io/badge/html5-E34F26?style=for-the-badge&logo=html5&logoColor=white"> <img src="https://img.shields.io/badge/css-1572B6?style=for-the-badge&logo=css3&logoColor=white"> <img src="https://img.shields.io/badge/OpenAI API-none?style=for-the-badge&logo=css3&logoColor=white">

### Communication
<img src="https://img.shields.io/badge/figma-F24E1E?style=for-the-badge&logo=figma&logoColor=white"> <img src="https://img.shields.io/badge/notion-000000?style=for-the-badge&logo=notion&logoColor=white"> <img src="https://img.shields.io/badge/zoom-0B5CFF?style=for-the-badge&logo=zoom&logoColor=white"> <img src="https://img.shields.io/badge/Microsoft Teams-181717?style=for-the-badge&logo=none&logoColor=white">


## 4. 프로젝트 구조
```
```

## 5. API 엔드포인트
- <b>도서 CRUD</b>

|API 이름              |유형    |REST API                                                            |설명                                                                                                                                         |
|--------------------|------|--------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------|
|도서 등록               |POST  |[http://localhost:3000/books](http://localhost:3000/books)          |필수: title·author·content. 초기값 자동 세팅: viewCount:0, lastViewedAt:null, coverImageUrl:"". createdAt·updatedAt은 new Date().toISOString() 프론트 세팅|
|도서 수정               |PATCH |[http://localhost:3000/books/{id}](http://localhost:3000/books/:id) |변경된 필드만 body에 담아 전송함 (PUT 사용 금지). 수정 폼에 기존 정보 자동 불러오기, updatedAt 동시 갱신함. ...spread 3패턴으로 불변성 유지함.                                          |
|도서 삭제               |DELETE|[http://localhost:3000/books/{id}](http://localhost:3000/books/:id) |삭제 전 window.confirm으로 사용자 확인 화면 표시함. 성공 시 목록 state에서 해당 항목 제거 후 목록 화면으로 전환함. 응답 본문 없음 (200/204 상태만 확인).                                    |
|도서 상세 조회            |GET   |[http://localhost:3000/books/{id}](http://localhost:3000/books/{id})|도서 단건 조회. 조회 직후 viewCount +1 PATCH 호출                                                                                                      |
|조회수 증가              |PATCH |[http://localhost:3000/books/{id}](http://localhost:3000/books/{id})|body: { viewCount: prev+1} 조회수 프론트 계산                                                                                                      |
|도서 목록 조회 + 장르 필터+ 정렬|GET   |[http://localhost:3000/books](http://localhost:3000/books)          |전체 목록 1회 GET 후 프론트에서 Array.filter로 장르 필터, Array.sort로 최신순·제목순·가격순·인기순 정렬 처리. 사이드바 카운트도 동일 데이터로 계산 — 별도 엔드포인트 불필요                           |

<br>

- <b>AI 표지 생성</b>

|API 이름     |유형   |REST API                                                                                    |설명                                                                                                                          |
|-----------|-----|--------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------|
|AI 표지 3종 생성|POST |[https://api.openai.com/v1/images/generations](https://api.openai.com/v1/images/generations)|3종 미리보기 중 사용자가 선택한 1개만 coverImageUrl에 저장. updatedAt 동시 갱신. 저장 전 취소 시 원복 가능                                                  |
|AI 표지 선택 저장|PATCH|[http://localhost:3000/books/{id}](http://localhost:3000/books/{id})                        |n:3으로 3종 동시 생성. 사용자 직접 입력 프롬프트 + title·content 자동 보완. data[0~2].b64_json → Data URL 변환 후 3종 미리보기 UI 표시. 401/429/500 에러 처리 필수|
  
## 6. 주요 기능
### 🎨 원하는 분위기의 AI 표지 생성 기능
- 스타일/배경·조명/타이포그래피 별 태그를 제공하여 간단하게 원하는 분위기의 표지 생성 가능
- 프롬프트 작성으로 추가 디테일 적용 가능
- 1회 생성에 최대 3가지 표지 샘플 제공
- 도서 등록 이후에도 언제든지 AI 표지 수정 가능
  
### 🔍 속성 별 상세 검색 기능
- 제목, 작가, 장르, 출판사, 가격대 별로 조정하여 상세 검색 가능
  
### ✅ 카테고리 필터링 기능
- 도서 목록 화면에서 상세 검색 기능 없이도 장르 별 필터링 편의성 제공

### 🏆 도서 랭킹 제공 기능
- 메인 화면에서 조회수가 높은 순으로 인기 도서 랭킹 제공
- 메인 화면에서 출판일자가 빠른 순으로 신작 랭킹 제공

<br>

## 7. 화면 구성

|메인 화면   |도서 목록   |
|--------|--------|
|🖼️        |🖼️        |
|설명        |설명        |
|신규 도서 등록|도서 상세 정보|
|🖼️        |🖼️        |
|설명        |설명        |
|도서 정보 수정|AI 표지 수정|
|🖼️        |🖼️        |
|설명        |설명        |

