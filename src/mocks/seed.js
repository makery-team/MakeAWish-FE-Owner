import { addDaysIso } from '../lib/time'

export const ORDER_SCHEMA_FIELDS = [
  { id: 'size', label: '케이크 사이즈', type: 'select', options: ['미니(2호)', '기본(3호)', '빅(5호)'] },
  { id: 'pickupDate', label: '픽업 희망 날짜', type: 'date' },
  { id: 'lettering', label: '레터링 문구', type: 'text' },
  { id: 'refImage', label: '참고 이미지', type: 'image' },
  { id: 'request', label: '알러지 / 요청사항', type: 'textarea' },
]

export const INITIAL_ORDERS = [
  {
    id: 'order_001',
    customerName: '김민지',
    customerPhone: '010-1234-5671',
    cakeType: '레터링 케이크',
    requestedDate: addDaysIso(0),
    pickupTime: '14:00',
    status: 'PENDING',
    price: 45000,
    createdAt: addDaysIso(-1),
    schemaAnswers: { size: '기본(3호)', pickupDate: addDaysIso(0), lettering: 'Happy Birthday 민지야', refImage: 'https://picsum.photos/seed/order-1/400/400', request: '딸기 알러지 있어요' },
  },
  {
    id: 'order_002',
    customerName: '이서준',
    customerPhone: '010-2234-5672',
    cakeType: '캐릭터 케이크 (공룡)',
    requestedDate: addDaysIso(0),
    pickupTime: '16:00',
    status: 'ACCEPTED',
    price: 68000,
    createdAt: addDaysIso(-2),
    schemaAnswers: { size: '빅(5호)', pickupDate: addDaysIso(0), lettering: '5살 서준이 생일 축하해', refImage: 'https://picsum.photos/seed/order-2/400/400', request: '공룡은 초록색으로 부탁드려요' },
  },
]

export const INITIAL_EXTRA_CHARGES = [
  { id: 'extra_001', orderId: 'order_002', reason: '토핑 추가 (초코볼)', amount: 5000, createdAt: addDaysIso(-1) },
]

export const INITIAL_PAYMENTS = [
  { orderId: 'order_002', amount: 68000, method: 'CARD', status: 'PAID', paidAt: addDaysIso(0) },
]

export const INITIAL_CHATS = {
  order_002: [
    { id: 'm1', sender: 'customer', text: '안녕하세요! 공룡 색깔은 초록색으로 부탁드려도 될까요?', time: '10:12' },
    { id: 'm2', sender: 'store', text: '네 물론이죠! 초록색 공룡으로 예쁘게 만들어드릴게요 🦖', time: '10:15' },
  ],
}

export const INITIAL_PORTFOLIOS = [
  { id: 'p1', title: '파스텔 무지개 버터크림 케이크', tags: ['버터크림', '파스텔', '생일'], imageUrl: 'https://picsum.photos/seed/cake-1/600/600', description: '알록달록 파스텔톤 버터크림 케이크' },
  { id: 'p2', title: '미니멀 화이트 웨딩케이크', tags: ['웨딩', '미니멀', '화이트'], imageUrl: 'https://picsum.photos/seed/cake-2/600/600', description: '심플하고 우아한 3단 웨딩케이크' },
]

export const PORTFOLIO_TAG_POOL = [
  '파스텔', '버터크림', '생일', '웨딩', '미니멀', '캐릭터', '아이생일', '플라워', '레터링',
  '기념일', '베이비샤워', '초코', '데일리', '골드', '리본', '프리미엄', '귀여움', '한입케이크',
]

export const INITIAL_REVIEWS = [
  { id: 'r1', customerName: '이지은', rating: 5, content: '레터링이 정말 예뻤어요! 다음에도 또 주문할게요', reply: null, createdAt: addDaysIso(-3) },
  { id: 'r2', customerName: '박준서', rating: 4, content: '맛있었는데 픽업 시간이 조금 늦어졌어요', reply: '소중한 후기 감사합니다! 다음엔 더 신경쓸게요 :)', createdAt: addDaysIso(-5) },
]

export const INITIAL_STORE_PROFILE = {
  storeName: '달콤공방',
  ownerName: '허예진',
  category: '홈베이킹 / 디저트',
  address: '서울특별시 마포구 월드컵로 123',
  phone: '010-9876-5432',
  profileImage: 'https://picsum.photos/seed/store-profile/300/300',
  intro: '',
  businessHours: [
    { day: '월', open: '09:00', close: '20:00', closed: false },
    { day: '화', open: '09:00', close: '20:00', closed: false },
    { day: '수', open: '09:00', close: '20:00', closed: false },
    { day: '목', open: '09:00', close: '20:00', closed: false },
    { day: '금', open: '09:00', close: '20:00', closed: false },
    { day: '토', open: '10:00', close: '18:00', closed: false },
    { day: '일', open: '10:00', close: '18:00', closed: true },
  ],
}

export const INITIAL_BUSINESS_LICENSE = {
  businessName: '달콤공방',
  businessNumber: '123-45-67890',
  ownerName: '허예진',
  address: '서울특별시 마포구 월드컵로 123',
  openDate: '2022-03-15',
}

export const PROFILE_SUGGESTIONS = [
  '대표 메뉴 사진을 3장 이상 등록하면 노출 확률이 32% 올라가요',
  "소개글에 '당일 픽업 가능' 문구를 추가해보세요",
  "최근 인기 태그 '파스텔톤'을 포트폴리오에 반영해보세요",
  '리뷰 답글을 남기면 재주문율이 평균 18% 높아져요',
]

export const PRICE_ANALYSIS = {
  myAvgPrice: 52000,
  marketAvgPrice: 58000,
  comparisonByCategory: [
    { category: '레터링 케이크', my: 38000, market: 42000 },
    { category: '캐릭터 케이크', my: 65000, market: 70000 },
    { category: '웨딩 케이크', my: 220000, market: 250000 },
    { category: '데일리 케이크', my: 32000, market: 35000 },
  ],
}

export const REVIEW_SUMMARY = {
  averageRating: 4.3,
  totalCount: 6,
  keywords: ['친절함', '퀄리티 좋음', '포장 꼼꼼', '레터링 예쁨'],
}

export const STORE_INTRO_DRAFT =
  "안녕하세요, 정성 가득한 홈베이킹 케이크샵 '달콤공방'입니다 🍰\n아이 생일부터 웨딩까지, 하나하나 손으로 그려내는 레터링 케이크를 만나보세요."

export const TODAY_BRIEFING = {
  date: addDaysIso(0),
  summary: '오늘은 주문 5건이 접수되어 있어요. 그 중 2건은 아직 수락 대기 중이니 먼저 확인해주세요!',
  pendingCount: 2,
  inProgressCount: 2,
  expectedRevenue: 255000,
}

const monthsBack = (n) => {
  const d = new Date()
  d.setDate(1)
  d.setMonth(d.getMonth() - n)
  return `${d.getMonth() + 1}월`
}

export const REVENUE_STATS = [5, 4, 3, 2, 1, 0].map((n, i) => ({
  month: monthsBack(n),
  revenue: [2350000, 2680000, 3120000, 2900000, 3450000, 3980000][i],
}))

export const PRODUCT_STATS = [
  { name: '레터링 케이크', revenue: 1200000, count: 28 },
  { name: '캐릭터 케이크', revenue: 980000, count: 14 },
  { name: '웨딩 케이크', revenue: 660000, count: 3 },
  { name: '데일리 케이크', revenue: 420000, count: 35 },
]

export const PRODUCTION_TIME_STATS = [
  { name: '레터링 케이크', avgMinutes: 75 },
  { name: '캐릭터 케이크', avgMinutes: 150 },
  { name: '웨딩 케이크', avgMinutes: 320 },
  { name: '데일리 케이크', avgMinutes: 40 },
]