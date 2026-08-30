import { useState, useEffect } from 'react'
import { Trash, Plus, DotsSixVertical } from '@phosphor-icons/react'
import { useOrderStore } from '../../store/useOrderStore'
import { useShopStore } from '../../store/useShopStore'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { useNavigate, useSearchParams } from 'react-router-dom'

const DEFAULT_RECOMMENDED_SCHEMA = [
  { id: 'size', label: '케이크 사이즈 (도시락, 미니, 1호, 2호, 3호)' },
  { id: 'flavor', label: '시트 및 크림 맛 (바닐라생크림, 초코가나슈, 오레오, 얼그레이)' },
  { id: 'lettering', label: '레터링 문구 (케이크 위 및 케이크 판 문구, 20자 이내)' },
  { id: 'pickupDate', label: '픽업 희망 일시 (날짜 및 시간)' },
  { id: 'request', label: '알러지 및 추가 요청사항' },
]

export default function OrderSchemaEditor() {
  const { profile } = useShopStore()
  const { updateSchemaFields } = useOrderStore()
  
  const [menus, setMenus] = useState([])
  const [selectedMenuId, setSelectedMenuId] = useState(null)
  
  const [fields, setFields] = useState([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    if (profile?.categories && profile.categories.length > 0) {
      setMenus(profile.categories)
      if (!selectedMenuId) {
        const queryMenuId = searchParams.get('menuId')
        if (queryMenuId && profile.categories.some(m => m.id === Number(queryMenuId))) {
          setSelectedMenuId(Number(queryMenuId))
        } else {
          setSelectedMenuId(profile.categories[0].id)
        }
      }
    }
  }, [profile, searchParams])

  // 선택된 메뉴가 바뀔 때마다 필드 초기화
  useEffect(() => {
    if (selectedMenuId && menus.length > 0) {
      const selectedMenu = menus.find((m) => m.id === selectedMenuId)
      if (selectedMenu && selectedMenu.orderSchema && selectedMenu.orderSchema.properties) {
        // properties 객체를 배열로 변환
        const props = selectedMenu.orderSchema.properties
        const newFields = Object.keys(props).map((key) => ({
          id: key,
          label: key === 'request' ? '알러지 및 추가 요청사항' : (props[key].label || props[key].description || '')
        }))
        // request 필드가 누락되어 있으면 항상 기본 필수 항목으로 추가
        if (!newFields.some((f) => f.id === 'request')) {
          newFields.push({ id: 'request', label: '알러지 및 추가 요청사항' })
        }
        setFields(newFields)
      } else {
        setFields(DEFAULT_RECOMMENDED_SCHEMA)
      }
    }
  }, [selectedMenuId, menus])

  const updateLabel = (id, label) => {
    if (id === 'request') return // request 라벨은 '알러지 및 추가 요청사항'으로 고정
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, label } : f)))
  }

  const removeField = (id) => {
    if (id === 'request') return // 기본 필수 항목은 삭제 불가
    setFields((prev) => prev.filter((f) => f.id !== id))
  }

  const addField = () => {
    setFields((prev) => [
      ...prev,
      { id: `field_${Date.now()}`, label: '' },
    ])
  }

  const handleSave = async () => {
    if (!selectedMenuId) return
    let validFields = fields.filter((f) => f.label.trim() !== '')
    // request 항목 보장
    if (!validFields.some((f) => f.id === 'request')) {
      validFields.push({ id: 'request', label: '알러지 및 추가 요청사항' })
    }

    setSaving(true)
    await updateSchemaFields(selectedMenuId, validFields)
    useShopStore.getState().fetchProfile()
    
    // update local menus state to reflect changes without refetching immediately
    const updatedProps = {}
    validFields.forEach((f) => {
      updatedProps[f.id] = { type: 'string', label: f.label }
    })
    
    setMenus(prev => prev.map(m => m.id === selectedMenuId ? { ...m, orderSchema: { type: 'object', properties: updatedProps } } : m))
    setFields(validFields)
    
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  const isEmpty = fields.length === 0

  if (!profile?.categories || profile.categories.length === 0) {
    return (
      <div className="pb-6 h-full flex flex-col">
        <PageHeader title="주문서 양식 설정" back />
        <div className="flex-1 flex flex-col items-center justify-center gap-3 px-5 text-center">
          <p className="text-cake-ink-soft text-sm">먼저 메뉴(카테고리)를 등록해야 양식을 설정할 수 있어요.</p>
          <Button onClick={() => navigate('/menus')}>메뉴 등록하러 가기</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="pb-6">
      <PageHeader title="주문서 양식 설정" subtitle="AI 점원이 고객에게 물어볼 항목을 설정해요" back />

      <div className="flex flex-col gap-3 px-5">
        <div className="flex items-center gap-2">
          <select
            value={selectedMenuId || ''}
            onChange={(e) => setSelectedMenuId(Number(e.target.value))}
            className="flex-1 rounded-xl border border-cake-pink-200 bg-white px-4 py-3 text-sm font-semibold text-cake-ink outline-none"
          >
            {menus.map((menu) => (
              <option key={menu.id} value={menu.id}>
                {menu.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => navigate('/menus')}
            className="flex h-[46px] items-center justify-center rounded-xl bg-cake-pink-50 px-4 text-xs font-bold text-cake-pink-600 active:bg-cake-pink-100"
          >
            메뉴 관리
          </button>
        </div>

        <div className="mb-2 rounded-2xl bg-cake-pink-50 p-4 text-[13px] leading-relaxed text-cake-pink-700">
          <div className="flex items-center justify-between">
            <p className="font-bold text-cake-pink-600">💡 주문서 양식 설정 가이드</p>
            <button
              type="button"
              onClick={() => setFields(DEFAULT_RECOMMENDED_SCHEMA)}
              className="text-xs font-bold text-cake-pink-600 underline hover:text-cake-pink-700"
            >
              ✨ 추천 기본 양식 불러오기
            </button>
          </div>
          <p className="mt-1">
            항목 이름과 함께 <b>옵션(예: 1호, 2호)</b>이나 <b>제약사항(예: 20자 이내)</b>을 자유롭게 입력해주세요. 입력하신 내용은 AI 점원의 고객 응대 가이드로 활용됩니다.
          </p>
        </div>
        {isEmpty && (
          <div className="flex flex-col items-center gap-3 py-8 text-center text-cake-ink-soft bg-white rounded-2xl border border-cake-pink-100 p-6 shadow-sm">
            <div className="text-2xl">📋</div>
            <p className="text-sm font-bold text-cake-ink">아직 등록된 양식 항목이 없어요</p>
            <p className="text-xs text-cake-ink-muted leading-relaxed">
              주문제작 케이크의 5대 필수 항목(사이즈, 맛, 레터링, 픽업일시, 요청사항)을<br />
              원클릭으로 불러와 빠르게 설정을 시작해보세요!
            </p>
            <Button
              variant="secondary"
              className="mt-1 text-xs border border-cake-pink-300 text-cake-pink-600 hover:bg-cake-pink-50 font-bold"
              onClick={() => setFields(DEFAULT_RECOMMENDED_SCHEMA)}
            >
              ✨ 추천 기본 양식 5개 불러오기
            </Button>
          </div>
        )}

        {fields.map((f, index) => {
          const isRequired = f.id === 'request'
          return (
            <Card key={f.id} className={`flex items-center gap-3 ${isRequired ? 'bg-cake-pink-50/40 border border-cake-pink-100' : ''}`}>
              <DotsSixVertical size={18} className="shrink-0 text-cake-ink-muted" />
              <div className="flex-1">
                {isRequired ? (
                  <div className="py-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-cake-ink">알러지 및 추가 요청사항</span>
                      <span className="rounded-full bg-cake-pink-100 px-2 py-0.5 text-[10px] font-bold text-cake-pink-600">
                        기본 필수
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-cake-ink-muted">
                      고객의 알러지 및 기타 특이사항을 빠짐없이 수렴하는 필수 항목이에요.
                    </p>
                  </div>
                ) : (
                  <>
                    <textarea
                      value={f.label}
                      onChange={(e) => updateLabel(f.id, e.target.value)}
                      onInput={(e) => {
                        e.target.style.height = 'auto'
                        e.target.style.height = e.target.scrollHeight + 'px'
                      }}
                      rows={1}
                      placeholder="예: 케이크 사이즈 (1호, 2호, 미니)"
                      className="w-full resize-none overflow-hidden border-b border-transparent bg-transparent py-1 text-sm font-semibold text-cake-ink outline-none placeholder:text-cake-ink-muted focus:border-cake-pink-300"
                      autoFocus={f.label === ''}
                    />
                    <span className="mt-1 inline-block text-[10px] text-cake-ink-muted">
                      {index + 1}번째 질문
                    </span>
                  </>
                )}
              </div>
              {isRequired ? (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-cake-pink-100/60 text-cake-pink-400" title="기본 필수 항목 (삭제 불가)">
                  <span className="text-[11px] font-bold">🔒</span>
                </div>
              ) : (
                <button onClick={() => removeField(f.id)} className="text-cake-ink-soft active:text-red-400" aria-label="삭제">
                  <Trash size={18} />
                </button>
              )}
            </Card>
          )
        })}

        <button
          onClick={addField}
          className="flex items-center justify-center gap-1.5 rounded-3xl border-2 border-dashed border-cake-pink-200 py-3 text-sm font-semibold text-cake-pink-500 active:bg-cake-pink-50"
        >
          <Plus size={16} /> 항목 추가
        </button>

        <Button className="mt-2 w-full" loading={saving} onClick={handleSave}>
          {saved ? '저장됐어요 ✓' : '저장하기'}
        </Button>
      </div>
    </div>
  )
}