import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { PencilSimple, Clock, Sparkle, IdentificationCard, Tag, Star, TrendUp, Camera } from '@phosphor-icons/react'
import { useShopStore } from '../../store/useShopStore'
import { useAuthStore } from '../../store/useAuthStore'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'
import AddressSearchModal from '../../components/ui/AddressSearchModal'

export default function StoreManage() {
  const { businessLicense } = useAuthStore()
  const {
    profile,
    reviews,
    reviewsError,
    fetchReviews,
    suggestions,
    priceAnalysis,
    updateProfile,
    uploadProfileImage,
    generateIntro,
    replyToReview,
    getReviewSummary,
    requestProfileSuggestions,
    fetchPriceAnalysis,
    profileError,
    fetchProfile,
    deleteReply,
    replyError,
  } = useShopStore()

  const navigate = useNavigate()
  const [summary, setSummary] = useState(null)
  const fileInputRef = useRef(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => {
    fetchProfile()
    fetchReviews()
  }, [fetchProfile, fetchReviews])

  useEffect(() => {
    if (profile?.id) {
      getReviewSummary().then(setSummary)
    }
  }, [profile?.id, getReviewSummary])

  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(profile)
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [hoursEditing, setHoursEditing] = useState(false)
  const [hoursForm, setHoursForm] = useState(profile.businessHours)
  const [savingHours, setSavingHours] = useState(false)
  const [introLoading, setIntroLoading] = useState(false)
  const [introEditing, setIntroEditing] = useState(false)
  const [introForm, setIntroForm] = useState(profile.intro)
  const [savingIntro, setSavingIntro] = useState(false)
  const [suggestLoading, setSuggestLoading] = useState(false)
  const [priceLoading, setPriceLoading] = useState(false)
  const [replyOpenFor, setReplyOpenFor] = useState(null)
  const [replyText, setReplyText] = useState('')

  const saveProfile = async () => {
    setSavingProfile(true)
    await updateProfile(form)
    setSavingProfile(false)
    setEditing(false)
  }

  const updateHoursRow = (day, patch) => {
    setHoursForm((rows) => rows.map((r) => (r.day === day ? { ...r, ...patch } : r)))
  }

  const saveHours = async () => {
    setSavingHours(true)
    await updateProfile({ businessHours: hoursForm })
    setSavingHours(false)
    setHoursEditing(false)
  }

  const saveIntro = async () => {
    setSavingIntro(true)
    await updateProfile({ intro: introForm })
    setSavingIntro(false)
    setIntroEditing(false)
  }

  return (
    <div className="pb-6">
      <PageHeader title="매장관리" />

      <div className="flex flex-col gap-4 px-5">
        <Card>
          <div className="flex items-center gap-3">
            <div className="relative group shrink-0">
              <img
                src={profile.imageUrl || profile.profileImage}
                alt="매장 프로필"
                className="h-16 w-16 rounded-2xl object-cover ring-2 ring-cake-pink-100"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-cake-pink-200 text-cake-pink-500 hover:bg-cake-pink-50 active:scale-95 transition-transform"
                title="프로필 사진 변경"
              >
                {uploadingImage ? (
                  <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-cake-pink-500 border-t-transparent" />
                ) : (
                  <Camera size={13} weight="bold" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  setUploadingImage(true)
                  try {
                    await uploadProfileImage(file)
                  } catch (err) {
                    alert('사진 업로드 중 오류가 발생했습니다.')
                  } finally {
                    setUploadingImage(false)
                    if (fileInputRef.current) fileInputRef.current.value = ''
                  }
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              {editing ? (
                <input
                  value={form.storeName}
                  onChange={(e) => setForm((f) => ({ ...f, storeName: e.target.value }))}
                  className="w-full rounded-lg border border-cake-pink-200 px-2 py-1 text-sm font-bold outline-none"
                />
              ) : (
                <p className="font-display text-lg text-cake-ink">{profile.storeName}</p>
              )}
              <p className="text-xs text-cake-ink-soft">{profile.ownerName}</p>
            </div>
            <button
              onClick={() => (editing ? saveProfile() : setEditing(true))}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-cake-pink-50 text-cake-pink-500 active:scale-95"
            >
              <PencilSimple size={15} />
            </button>
          </div>
          {editing && (
            <div className="mt-3 flex flex-col gap-2">
              <div className="flex gap-2">
                <input
                  value={form.address}
                  readOnly
                  placeholder="주소 찾기 버튼을 눌러주세요"
                  className="flex-1 rounded-xl border border-cake-pink-200 px-3 py-2 text-sm bg-gray-50 text-gray-600 outline-none cursor-pointer"
                  onClick={() => setIsAddressModalOpen(true)}
                />
                <Button type="button" onClick={() => setIsAddressModalOpen(true)} className="whitespace-nowrap px-3 py-2 text-sm">
                  주소 찾기
                </Button>
              </div>
              <input
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="연락처"
                className="rounded-xl border border-cake-pink-200 px-3 py-2 text-sm outline-none"
              />
              <Button loading={savingProfile} onClick={saveProfile} className="mt-1 w-full">저장하기</Button>
            </div>
          )}
          {!editing && (
            <p className="mt-2 text-xs text-cake-ink-soft flex flex-col gap-1">
              <span>{profile.address}{profile.phone ? ` · ${profile.phone}` : ''}</span>
            </p>
          )}
        </Card>

        {profileError && <p className="px-1 text-xs font-medium text-red-500">{profileError}</p>}

        <Card>
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-sm font-bold text-cake-ink"><Clock size={16} className="text-cake-pink-500" /> 운영 시간</p>
            <button
              onClick={() => {
                if (hoursEditing) {
                  saveHours()
                } else {
                  setHoursForm(profile.businessHours)
                  setHoursEditing(true)
                }
              }}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-cake-pink-50 text-cake-pink-500 active:scale-95"
            >
              <PencilSimple size={15} />
            </button>
          </div>

          {!hoursEditing && (
            <div className="mt-2 flex flex-col gap-1">
              {profile.businessHours.map((h) => (
                <div key={h.day} className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-cake-ink">{h.day}</span>
                  {h.closed ? (
                    <span className="text-cake-ink-soft">휴무</span>
                  ) : (
                    <span className="text-cake-ink-soft">{h.open} - {h.close}</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {hoursEditing && (
            <div className="mt-3 flex flex-col gap-2">
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
              <Button loading={savingHours} onClick={saveHours} className="mt-1 w-full">저장하기</Button>
            </div>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-sm font-bold text-cake-ink"><Tag size={16} className="text-cake-pink-500" /> 매장 핵심 키워드</p>
            <button
              onClick={() => {
                if (editing) {
                  saveProfile()
                } else {
                  setForm({ address: profile.address, phone: profile.phone, keywords: profile.keywords || '' })
                  setEditing(true)
                }
              }}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-cake-pink-50 text-cake-pink-500 active:scale-95"
            >
              <PencilSimple size={15} />
            </button>
          </div>
          {editing ? (
            <div className="mt-2 flex flex-col gap-2">
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap gap-2">
                  {form.keywords.split(',').map((kw, i) => kw.trim() ? (
                    <span key={i} className="flex items-center gap-1 rounded-full bg-cake-pink-100 px-3 py-1 text-xs font-semibold text-cake-pink-600">
                      #{kw.trim()}
                      <button
                        type="button"
                        onClick={() => {
                          const newKw = form.keywords.split(',').map(k => k.trim()).filter((_, idx) => idx !== i).join(', ')
                          setForm(f => ({ ...f, keywords: newKw }))
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
                  placeholder="입력 후 엔터(Enter)나 쉼표(,)를 눌러주세요"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault()
                      const val = e.target.value.trim()
                      if (val) {
                        const currentList = form.keywords.split(',').map(k => k.trim()).filter(Boolean)
                        if (!currentList.includes(val)) {
                          setForm(f => ({ ...f, keywords: currentList.length > 0 ? `${f.keywords}, ${val}` : val }))
                        }
                        e.target.value = ''
                      }
                    }
                  }}
                  className="w-full rounded-xl border border-cake-pink-200 px-3 py-2 text-sm outline-none focus:border-cake-pink-400"
                />
              </div>
              <span className="text-xs text-cake-ink-soft">입력 후 위 프로필 카드의 저장하기 버튼을 누르거나 여기서 바로 저장하세요.</span>
              <Button loading={savingProfile} onClick={saveProfile} className="w-full">저장하기</Button>
            </div>
          ) : (
            <div className="mt-2 text-sm text-cake-ink-soft">
              {profile.keywords ? (
                <span className="font-semibold text-cake-pink-500">#{profile.keywords.split(',').map(k => k.trim()).join(' #')}</span>
              ) : (
                '등록된 키워드가 없어요. (소개글 자동 생성 시 활용됩니다)'
              )}
            </div>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-sm font-bold text-cake-ink"><Sparkle size={16} className="text-cake-pink-500" /> 소개글</p>
            {!introLoading && (
              <button
                onClick={() => {
                  if (introEditing) {
                    saveIntro()
                  } else {
                    setIntroForm(profile.intro)
                    setIntroEditing(true)
                  }
                }}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-cake-pink-50 text-cake-pink-500 active:scale-95"
              >
                <PencilSimple size={15} />
              </button>
            )}
          </div>

          {introLoading && <Spinner label="소개글을 작성하고 있어요…" />}

          {!introLoading && introEditing && (
            <div className="mt-2 flex flex-col gap-2">
              <textarea
                value={introForm}
                onChange={(e) => setIntroForm(e.target.value)}
                placeholder="소개글을 직접 입력해주세요"
                rows={4}
                className="w-full rounded-2xl border border-cake-pink-200 p-3 text-sm leading-relaxed outline-none focus:border-cake-pink-400"
              />
              <Button loading={savingIntro} onClick={saveIntro} className="w-full">저장하기</Button>
            </div>
          )}

          {!introLoading && !introEditing && (
            <p className="mt-2 whitespace-pre-line rounded-2xl bg-cake-pink-50 p-3 text-sm leading-relaxed text-cake-ink">
              {profile.intro || '아직 소개글이 없어요. AI로 자동 생성하거나 직접 입력해보세요!'}
            </p>
          )}

          {!introLoading && !introEditing && (
            <Button
              variant="secondary"
              className="mt-3 w-full"
              onClick={async () => {
                setIntroLoading(true)
                await generateIntro()
                setIntroLoading(false)
              }}
            >
              {profile.intro ? '다시 생성하기' : '소개글 자동 생성'}
            </Button>
          )}
        </Card>

        {/* 사업자등록증 */}
        <Card>
          <div className="mb-4 flex items-center gap-2 text-cake-ink">
            <IdentificationCard weight="fill" className="text-xl text-cake-pink-500" />
            <h3 className="font-display font-bold">사업자등록증</h3>
          </div>
          <div className="space-y-2 text-sm text-cake-ink-soft">
            <div className="flex justify-between">
              <span className="font-medium text-cake-ink">사업자번호</span>
              <span>{businessLicense?.businessNo || '등록 필요'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-cake-ink">대표자</span>
              <span>{businessLicense?.owner || profile.ownerName || '미설정'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-cake-ink">개업일</span>
              <span>{businessLicense?.openDate || '등록 필요'}</span>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-sm font-bold text-cake-ink"><Star size={16} weight="fill" className="text-cake-yellow-400" /> 리뷰 요약</p>
            {summary && <span className="text-xs font-bold text-cake-pink-500">{summary.averageRating}점 · {summary.totalCount}건</span>}
          </div>
          {summary ? (
            <>
              {summary.summary && (
                <p className="mt-2 text-xs font-medium text-cake-ink leading-relaxed bg-cake-pink-50 p-2 rounded-lg">
                  {summary.summary}
                </p>
              )}
              <div className="mt-2 flex flex-wrap gap-1.5">
                {summary.keywords.map((k) => (
                  <span key={k} className="rounded-full bg-cake-mint-100 px-2.5 py-1 text-xs font-medium text-cake-mint-600">{k}</span>
                ))}
              </div>
            </>
          ) : (
            <p className="mt-2 text-xs text-cake-ink-soft">리뷰 요약을 불러오는 중입니다...</p>
          )}
          {reviewsError && <p className="mt-2 text-xs font-medium text-red-500">{reviewsError}</p>}
          <div className="mt-3 flex flex-col gap-2 divide-y divide-cake-pink-50">
            {reviews.map((r) => (
              <div key={r.id} className="pt-2 first:pt-0">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-cake-ink">{r.customerName}</p>
                  <span className="text-xs text-cake-yellow-500">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                </div>
                <p className="mt-0.5 text-xs text-cake-ink-soft">{r.content}</p>
                {r.reply && replyOpenFor !== r.id && (
                  <div className="mt-1 rounded-xl bg-cake-pink-50 p-2">
                    <p className="text-xs text-cake-ink">사장님 답글: {r.reply}</p>
                    <div className="mt-1 flex gap-2">
                      <button
                        onClick={() => {
                          setReplyText(r.reply)
                          setReplyOpenFor(r.id)
                        }}
                        className="text-xs font-semibold text-cake-pink-500"
                      >
                        수정
                      </button>
                      <button onClick={() => deleteReply(r.id)} className="text-xs font-semibold text-red-400">
                        삭제
                      </button>
                    </div>
                  </div>
                )}
                {!r.reply && replyOpenFor !== r.id && (
                  <button onClick={() => setReplyOpenFor(r.id)} className="mt-1 text-xs font-semibold text-cake-pink-500">답글 남기기</button>
                )}
                {replyOpenFor === r.id && (
                  <div className="mt-1 flex gap-1.5">
                    <input
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="답글을 입력하세요"
                      className="flex-1 rounded-full border border-cake-pink-200 px-3 py-1.5 text-xs outline-none"
                    />
                    <Button
                      className="px-3 py-1.5 text-xs"
                      onClick={async () => {
                        await replyToReview(r.id, replyText)
                        setReplyText('')
                        setReplyOpenFor(null)
                      }}
                    >
                      등록
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
          {replyError && <p className="mt-2 text-xs font-medium text-red-500">{replyError}</p>}
        </Card>

        <Card>
          <p className="text-sm font-bold text-cake-ink">프로필 개선 제안</p>
          {suggestLoading && <Spinner label="분석하고 있어요…" />}
          {!suggestLoading && suggestions.length > 0 && (
            <ul className="mt-2 flex flex-col gap-1.5">
              {suggestions.map((s, i) => (
                <li key={i} className="rounded-xl bg-cake-yellow-100 px-3 py-2 text-xs text-cake-ink">💡 {s}</li>
              ))}
            </ul>
          )}
          {!suggestLoading && (
            <Button
              variant="secondary"
              className="mt-3 w-full"
              onClick={async () => {
                setSuggestLoading(true)
                await requestProfileSuggestions()
                setSuggestLoading(false)
              }}
            >
              {suggestions.length > 0 ? '다시 분석하기' : '개선 제안 받기'}
            </Button>
          )}
        </Card>

        {/* 메뉴 관리 카드 */}
        <Card>
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-sm font-bold text-cake-ink">메뉴(카테고리) 관리</p>
            <Button variant="secondary" className="px-3 py-1 text-xs" onClick={() => navigate('/menus')}>
              관리하기
            </Button>
          </div>
          <p className="mt-1 text-xs text-cake-ink-soft">
            포트폴리오와 주문서를 분류할 메뉴(도시락 케이크, 입체 케이크 등)와 기본 가격을 설정합니다.
          </p>
          
          {/* 등록된 메뉴 목록 미리보기 */}
          <div className="mt-3 flex flex-col gap-1.5">
            {profile.categories && profile.categories.length > 0 ? (
              profile.categories.map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-xl bg-cake-pink-50/60 px-3 py-2 text-xs">
                  <span className="font-semibold text-cake-ink">{c.name}</span>
                  <span className="font-bold text-cake-pink-600">
                    {c.price ? `${Number(c.price).toLocaleString()}원~` : '가격 미설정'}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-cake-ink-soft py-1">등록된 메뉴가 없어요. [관리하기]를 눌러 메뉴를 추가해보세요!</p>
            )}
          </div>
        </Card>

        {/* 고객 리뷰 관리 카드 */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="flex items-center gap-1.5 text-sm font-bold text-cake-ink">고객 리뷰 및 답글 관리</p>
              <p className="mt-0.5 text-xs text-cake-ink-soft">
                고객이 남긴 소중한 후기를 확인하고 사장님 공식 답글을 작성합니다.
              </p>
            </div>
            <Button variant="secondary" className="px-3 py-1 text-xs shrink-0" onClick={() => navigate('/reviews')}>
              리뷰 관리
            </Button>
          </div>
        </Card>

        {/* 계정 관리 카드 */}
        <Card>
          <p className="text-sm font-bold text-cake-ink">계정 관리</p>
          <div className="mt-3 flex gap-2">
            <Button
              variant="secondary"
              className="flex-1 text-xs"
              onClick={() => {
                useAuthStore.getState().logout()
                window.location.href = '/login'
              }}
            >
              🚪 로그아웃
            </Button>
            <Button
              variant="secondary"
              className="flex-1 text-xs text-red-500 hover:bg-red-50 hover:text-red-600"
              onClick={async () => {
                if (window.confirm('정말 매장을 해지(폐업)하시겠습니까?\n\n사장님 권한 및 등록된 매장 정보만 삭제되며, 일반 구매자(소비자) 계정은 안전하게 유지됩니다.')) {
                  try {
                    const { closeMyStore } = await import('../../api/storeApi')
                    await closeMyStore()
                    alert('매장이 성공적으로 해지되었습니다.\n일반 소비자 계정은 계속 이용하실 수 있습니다.')
                    useAuthStore.getState().logout()
                    window.location.href = '/login'
                  } catch (e) {
                    alert('매장 해지 중 오류가 발생했습니다.')
                  }
                }
              }}
            >
              ⚠️ 매장 해지 / 탈퇴
            </Button>
          </div>
        </Card>
      </div>

      {isAddressModalOpen && (
        <AddressSearchModal
          onClose={() => setIsAddressModalOpen(false)}
          onComplete={(addr) => {
            setForm((f) => ({ ...f, address: addr }))
            setIsAddressModalOpen(false)
          }}
        />
      )}
    </div>
  )
}