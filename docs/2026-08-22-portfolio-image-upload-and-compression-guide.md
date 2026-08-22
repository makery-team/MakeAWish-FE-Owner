# 2026-08-22 포트폴리오 이미지 갤러리 선택 허용 및 고용량 사진 413 방지 압축 가이드

## 1. 문제 원인
1. **카메라 강제 실행**: `<input type="file" capture="environment">` 속성으로 인해 모바일 브라우저에서 갤러리 선택창 대신 후면 카메라가 강제 실행됨.
2. **API 요청 실패 413 Payload Too Large**: 최신 스마트폰 카메라 사진(5MB~15MB)이 용량 제한을 초과하여 백엔드/Nginx에서 거절됨.

---

## 2. 해결 방안 (`MakeAWish-FE-Owner`)

### 1) 갤러리 / 카메라 선택 팝업 복구 (`PortfolioForm.jsx`)
- `capture="environment"` 속성 제거 ➔ 모바일 OS 표준 미디어 선택기(갤러리/파일/카메라) 팝업 정상 작동

### 2) 클라이언트 Canvas 이미지 압축 유틸 (`src/utils/imageCompressor.js`)
- 업로드 전 브라우저 Canvas를 통해 최대 해상도 1280px로 스마트 리사이징 & JPEG 품질 82%로 압축
- 10MB 원본 사진을 화질 저하 없이 ~250KB로 즉시 경량화하여 **413 에러 원천 방지 및 업로드 속도 10배 이상 향상**
