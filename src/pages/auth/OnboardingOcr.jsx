import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { UploadSimple, CheckCircle, IdentificationCard, Storefront, Phone, Tag } from '@phosphor-icons/react'
import { useAuthStore } from '../../store/useAuthStore'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Spinner from '../../components/ui/Spinner'
import AddressSearchModal from '../../components/ui/AddressSearchModal'
import { INITIAL_STORE_PROFILE } from '../../mocks/seed'

export default function OnboardingOcr() {
  const navigate = useNavigate()
  const { businessLicenseStatus, businessLicense, createBusinessLicenseAnalysis, completeOnboarding } = useAuthStore()
  
  const [step, setStep] = useState(1)
  const [uploaded, setUploaded] = useState(!!businessLicense)
  
  // Step 2 Form State
  const [storeName, setStoreName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [detailAddress, setDetailAddress] = useState('')
  const [keywords, setKeywords] = useState('')
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false)
  const [hoursForm, setHoursForm] = useState(INITIAL_STORE_PROFILE.businessHours)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateHoursRow = (day, patch) => {
    setHoursForm((rows) => rows.map((r) => (r.day === day ? { ...r, ...patch } : r)))
  }

  const handleUpload = async () => {
    setUploaded(true)
    await createBusinessLicenseAnalysis()
  }

  const handleNextStep = () => {
    setStep(2)
  }

  const handleFinish = async (e) => {
    e.preventDefault()
    if (!storeName || !phone) return alert('필수 정보를 모두 입력해주세요!')
    
    setIsSubmitting(true)
    try {
      const finalAddress = detailAddress ? `${address}, ${detailAddress}` : address
      await completeOnboarding({ name: storeName, phone, address: finalAddress, hours: hoursForm, keywords })
      navigate('/home')
    } catch (error) {
      alert('매장 개설에 실패했습니다. 다시 시도해주세요.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-cake-cream px-6 pb-10 pt-14">
      {/* Progress Bar */}
      <div className="mb-8 flex w-full gap-2">
        <div className="h-1.5 flex-1 rounded-full bg-cake-pink-500 transition-all duration-500" />
        <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step === 2 ? 'bg-cake-pink-500' : 'bg-cake-pink-200'}`} />
      </div>

      <div className="flex-1">
        <span className="rounded-full bg-cake-pink-100 px-3 py-1 text-xs font-semibold text-cake-pink-600">
          {step === 1 ? '1 / 2 단계' : '2 / 2 단계'}
        </span>
        <h1 className="mt-3 font-display text-2xl text-cake-ink">
          {step === 1 ? '사업자등록증을 등록해주세요' : '매장 정보를 입력해주세요'}
        </h1>
        <p className="mt-1 text-sm text-cake-ink-soft">
          {step === 1 ? 'AI가 자동으로 정보를 읽어드려요' : '입력하신 정보는 고객들에게 보여집니다'}
        </p>

        <Card className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {step === 1 && (
            <div className="flex flex-col gap-4">
              {!uploaded && (
                <button
                  onClick={handleUpload}
                  className="flex w-full flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-cake-pink-200 py-10 text-cake-pink-500 transition hover:border-cake-pink-400 active:bg-cake-pink-50"
                >
                  <UploadSimple size={32} weight="bold" />
                  <span className="text-sm font-semibold">사업자등록증 이미지 업로드</span>
                  <span className="text-xs text-cake-ink-soft">탭하여 업로드 (프로토타입: 자동 첨부)</span>
                </button>
              )}

              {uploaded && businessLicenseStatus === 'ANALYZING' && (
                <div className="py-6"><Spinner label="AI가 사업자등록증을 분석하고 있어요…" /></div>
              )}

              {uploaded && businessLicenseStatus === 'DONE' && businessLicense && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-cake-mint-600">
                    <CheckCircle size={22} weight="fill" />
                    <span className="text-sm font-bold">OCR 분석 완료</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl bg-cake-pink-50 p-3">
                    <IdentificationCard size={28} className="text-cake-pink-400" />
                    <div className="text-sm">
                      <p className="font-semibold text-cake-ink">{businessLicense.businessName}</p>
                      <p className="text-cake-ink-soft">{businessLicense.businessNumber}</p>
                    </div>
                  </div>
                  <dl className="grid grid-cols-3 gap-y-1 px-1 text-xs">
                    <dt className="text-cake-ink-soft">대표자</dt>
                    <dd className="col-span-2 text-cake-ink">{businessLicense.owner}</dd>
                    <dt className="text-cake-ink-soft">개업연월일</dt>
                    <dd className="col-span-2 text-cake-ink">{businessLicense.openDate}</dd>
                  </dl>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleFinish} className="flex flex-col gap-4" id="store-setup-form">
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-semibold text-cake-ink flex items-center gap-1">
                  <Storefront size={16} className="text-cake-pink-500" /> 상호명 (필수)
                </span>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault() }}
                  placeholder="예: 달콤공방"
                  className="rounded-xl border border-cake-pink-200 px-4 py-3 text-sm outline-none focus:border-cake-pink-400 focus:ring-2 focus:ring-cake-pink-100"
                  required
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-semibold text-cake-ink flex items-center gap-1">
                  <Phone size={16} className="text-cake-pink-500" /> 연락처 (필수)
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault() }}
                  placeholder="예: 010-1234-5678"
                  className="rounded-xl border border-cake-pink-200 px-4 py-3 text-sm outline-none focus:border-cake-pink-400 focus:ring-2 focus:ring-cake-pink-100"
                  required
                />
              </label>

              <label className="flex flex-col gap-1.5 mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-cake-ink flex items-center gap-1">
                    <Tag size={16} className="text-cake-pink-500" /> 매장 핵심 키워드 (선택)
                  </span>
                  <span className="text-xs text-cake-pink-500 font-medium">
                    ({keywords.split(',').map(k => k.trim()).filter(Boolean).length}/7)
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap gap-2">
                    {keywords.split(',').map((kw, i) => kw.trim() ? (
                      <span key={i} className="flex items-center gap-1 rounded-full bg-cake-pink-100 px-3 py-1 text-xs font-semibold text-cake-pink-600">
                        #{kw.trim()}
                        <button
                          type="button"
                          onClick={() => {
                            const newKw = keywords.split(',').map(k => k.trim()).filter((_, idx) => idx !== i).join(', ')
                            setKeywords(newKw)
                          }}
                          className="ml-1 text-cake-pink-400 hover:text-cake-pink-600"
                        >
                          &times;
                        </button>
                      </span>
                    ) : null)}
                  </div>
                  <input
                    type="text"
                    placeholder={keywords.split(',').map(k => k.trim()).filter(Boolean).length >= 7 ? "최대 7개 키워드가 모두 등록되었습니다." : "입력 후 엔터(Enter)나 쉼표(,)를 눌러주세요"}
                    disabled={keywords.split(',').map(k => k.trim()).filter(Boolean).length >= 7}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault()
                        const val = e.target.value.trim()
                        if (val) {
                          const currentList = keywords.split(',').map(k => k.trim()).filter(Boolean)
                          if (currentList.length >= 7) {
                            alert('키워드는 최대 7개까지 등록할 수 있어요.')
                            return
                          }
                          if (!currentList.includes(val)) {
                            setKeywords(currentList.length > 0 ? `${keywords}, ${val}` : val)
                          }
                          e.target.value = ''
                        }
                      }
                    }}
                    className="rounded-xl border border-cake-pink-200 px-4 py-3 text-sm outline-none focus:border-cake-pink-400 focus:ring-2 focus:ring-cake-pink-100 disabled:bg-gray-50 disabled:opacity-60"
                  />
                </div>
                <span className="text-xs text-cake-ink-soft pl-1">
                  💡 <b>3~5개</b> 등록 시 가장 자연스러운 AI 소개글이 완성됩니다. (최대 7개)
                </span>
              </label>

              <div className="flex flex-col gap-1.5 mt-2">
                <span className="text-sm font-semibold text-cake-ink">매장 주소 (선택)</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={address}
                    readOnly
                    onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault() }}
                    placeholder="버튼을 눌러 주소를 검색하세요"
                    className="flex-1 rounded-xl border border-cake-pink-200 px-4 py-3 text-sm bg-gray-50 text-gray-600 outline-none cursor-pointer"
                    onClick={() => setIsAddressModalOpen(true)}
                  />
                  <Button type="button" onClick={() => setIsAddressModalOpen(true)} className="whitespace-nowrap px-4">
                    주소 찾기
                  </Button>
                </div>
                {address && (
                  <input
                    type="text"
                    value={detailAddress}
                    onChange={(e) => setDetailAddress(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault() }}
                    placeholder="상세 주소를 입력해주세요 (예: 2층 201호)"
                    className="mt-1 rounded-xl border border-cake-pink-200 px-4 py-3 text-sm outline-none focus:border-cake-pink-400 focus:ring-2 focus:ring-cake-pink-100"
                  />
                )}
              </div>

              <div className="flex flex-col gap-1.5 mt-2">
                <span className="text-sm font-semibold text-cake-ink">기본 운영시간 (선택)</span>
                <div className="flex flex-col gap-2 rounded-xl border border-cake-pink-200 p-3 bg-white">
                  {hoursForm.map((h) => (
                    <div key={h.day} className="flex items-center gap-2 text-xs">
                      <span className="w-4 font-semibold text-cake-ink">{h.day}</span>
                      <input
                        type="time"
                        value={h.open}
                        disabled={h.closed}
                        onChange={(e) => updateHoursRow(h.day, { open: e.target.value })}
                        className="flex-1 rounded-lg border border-cake-pink-200 px-2 py-1 text-xs outline-none disabled:bg-gray-50 disabled:text-cake-ink-soft"
                      />
                      <span className="text-cake-ink-soft">~</span>
                      <input
                        type="time"
                        value={h.close}
                        disabled={h.closed}
                        onChange={(e) => updateHoursRow(h.day, { close: e.target.value })}
                        className="flex-1 rounded-lg border border-cake-pink-200 px-2 py-1 text-xs outline-none disabled:bg-gray-50 disabled:text-cake-ink-soft"
                      />
                      <label className="flex items-center gap-1 text-cake-ink-soft">
                        <input
                          type="checkbox"
                          checked={h.closed}
                          onChange={(e) => updateHoursRow(h.day, { closed: e.target.checked })}
                        />
                        휴무
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </form>
          )}
        </Card>
      </div>

      <div className="mt-8 flex flex-col gap-2">
        {step === 1 ? (
          <Button
            onClick={handleNextStep}
            disabled={businessLicenseStatus !== 'DONE'}
            className="w-full py-3.5 text-base"
          >
            다음 단계로
          </Button>
        ) : (
          <Button
            type="submit"
            form="store-setup-form"
            disabled={isSubmitting || !storeName || !phone}
            className="w-full py-3.5 text-base"
          >
            {isSubmitting ? '매장 개설 중...' : '내 매장 개설하기'}
          </Button>
        )}
        
        {step === 1 && (
          <button
            type="button"
            onClick={() => {
              useAuthStore.getState().logout()
              navigate('/login')
            }}
            className="mt-2 py-1 text-center text-xs font-medium text-cake-ink-soft transition hover:text-cake-pink-600"
          >
            ← 로그인 화면으로 돌아가기 (로그아웃)
          </button>
        )}
        
        {step === 2 && (
          <button
            type="button"
            onClick={() => setStep(1)}
            disabled={isSubmitting}
            className="mt-2 py-1 text-center text-xs font-medium text-cake-ink-soft transition hover:text-cake-pink-600 disabled:opacity-50"
          >
            ← 이전 단계로
          </button>
        )}
      </div>

      {isAddressModalOpen && (
        <AddressSearchModal
          onClose={() => setIsAddressModalOpen(false)}
          onComplete={(addr) => {
            setAddress(addr)
            setIsAddressModalOpen(false)
          }}
        />
      )}
    </div>
  )
}