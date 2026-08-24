# 2026-08-24 매장 기본 프로필 이미지 Fallback 가이드

## 1. 개요
- 신규 사장님이 매장 대표 프로필 이미지를 등록하기 전에 브라우저에서 엑스박스(깨진 이미지)로 노출되던 현상 방지
- 기본 케이크 매장 이미지(DEFAULT_PROFILE_IMAGE) 및 onError 핸들러를 통한 이중 안전망 구축

## 2. 변경 파일
1. src/store/useShopStore.js: DEFAULT_PROFILE_IMAGE 상수 정의 및 초기 스토어 프로필에 기본값 할당
2. src/pages/store/StoreManage.jsx: profile.imageUrl || profile.profileImage || DEFAULT_PROFILE_IMAGE 삼항 연산 및 이미지 로드 에러 시 onError 이벤트로 자동 대체
