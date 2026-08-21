import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Sparkle, X, Plus } from '@phosphor-icons/react'
import { usePortfolioStore } from '../../store/usePortfolioStore'
import { useShopStore } from '../../store/useShopStore'
import { uploadPortfolioImage } from '../../api/portfolioApi'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'

export default function PortfolioForm() {
  const { portfolioId } = useParams()
  const navigate = useNavigate()
  const { getById, createPortfolio, updatePortfolio, recommendTags } = usePortfolioStore()
  const { profile } = useShopStore()
  const existing = portfolioId ? getById(portfolioId) : null

  const [productId, setProductId] = useState(existing?.productId || (profile?.categories?.length > 0 ? profile.categories[0].id : null))
  const [title, setTitle] = useState(existing?.title || '')
  const [description, setDescription] = useState(existing?.description || '')
  const [tags, setTags] = useState(existing?.tags || [])
  const [newTag, setNewTag] = useState('')
  const [recommending, setRecommending] = useState(false)
  const [saving, setSaving] = useState(false)
  const [imagePreviewUrl, setImagePreviewUrl] = useState(existing?.imageUrl || null)
  const [imageUrl, setImageUrl] = useState(existing?.imageUrl || null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [uploadError, setUploadError] = useState('')

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImagePreviewUrl(URL.createObjectURL(file))
    setImageUrl(null)
    setUploadingImage(true)
    setUploadError('')
    try {
      const uploaded = await uploadPortfolioImage(file)
      setImageUrl(uploaded)
    } catch (err) {
      setUploadError(err.message || '이미지 업로드에 실패했어요. 다시 시도해주세요')
    } finally {
      setUploadingImage(false)
    }
  }

  const [recommendError, setRecommendError] = useState('')

  const handleRecommend = async () => {
    if (!imageUrl) return
    setRecommending(true)
    setRecommendError('')
    try {
      const suggested = await recommendTags({ imageUrl, description })
      setTags((prev) => [...new Set([...prev, ...suggested])].slice(0, 6))
    } catch (err) {
      setRecommendError(err.message || '태그 추천에 실패했어요')
    } finally {
      setRecommending(false)
    }
  }

  const handleAddTag = () => {
    const value = newTag.trim()
    if (!value || tags.includes(value)) return
    setTags((prev) => [...prev, value])
    setNewTag('')
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveError('')
    try {
      const payload = { productId, title, description, imageUrl, tags }
      if (existing) await updatePortfolio(existing.id, payload)
      else await createPortfolio(payload)
      navigate('/menus')
    } catch (err) {
      setSaveError(err.message || '저장에 실패했어요. 다시 시도해주세요')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="pb-6">
      <PageHeader title={existing ? '포트폴리오 수정' : '포트폴리오 등록'} back />

      <div className="flex flex-col gap-4 px-5">
        <label className="relative flex h-40 cursor-pointer items-center justify-center overflow-hidden rounded-3xl bg-cake-pink-50 text-cake-pink-300">
          {imagePreviewUrl ? (
            <img src={imagePreviewUrl} alt={title || '포트폴리오 이미지'} className="h-full w-full object-cover" />
          ) : (
            <span className="px-4 text-center text-sm font-medium">탭하여 사진 찍기 / 갤러리에서 선택</span>
          )}
          {uploadingImage && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 text-xs font-semibold text-white">
              업로드 중…
            </div>
          )}
          <input type="file" accept="image/*" capture="environment" onChange={handleImageSelect} className="hidden" />
        </label>
        {uploadError && <p className="text-center text-xs font-medium text-red-500">{uploadError}</p>}

        <Card>
          <label className="text-xs font-semibold text-cake-ink-soft">메뉴(카테고리)</label>
          <select
            value={productId || ''}
            onChange={(e) => setProductId(Number(e.target.value))}
            className="mt-1 w-full rounded-xl border border-cake-pink-200 bg-white px-3 py-2 text-sm outline-none focus:border-cake-pink-400"
          >
            <option value="" disabled>메뉴를 선택해주세요</option>
            {profile?.categories?.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <label className="mt-3 block text-xs font-semibold text-cake-ink-soft">작품 제목</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 파스텔 무지개 버터크림 케이크"
            className="mt-1 w-full rounded-xl border border-cake-pink-200 px-3 py-2 text-sm outline-none focus:border-cake-pink-400"
          />
          <label className="mt-3 block text-xs font-semibold text-cake-ink-soft">설명</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="케이크에 대한 설명을 적어주세요"
            className="mt-1 w-full rounded-xl border border-cake-pink-200 px-3 py-2 text-sm outline-none focus:border-cake-pink-400"
          />
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-cake-ink">태그</p>
            <Button
              variant="secondary"
              onClick={handleRecommend}
              loading={recommending}
              disabled={!imageUrl || uploadingImage}
              className="text-xs"
            >
              <Sparkle size={14} weight="fill" /> AI 태그 추천
            </Button>
          </div>
          {!imageUrl && <p className="mt-1 text-xs text-cake-ink-soft">이미지를 먼저 선택하면 태그를 추천받을 수 있어요</p>}
          {recommendError && <p className="mt-1 text-xs font-medium text-red-500">{recommendError}</p>}
          
          <div className="mt-2 flex items-center gap-1.5 rounded-xl bg-cake-pink-50/80 px-3 py-2 text-xs text-cake-pink-600">
            <span>💡</span>
            <span>첫 번째 태그는 소비자 앱 카드 좌측 상단에 <b>대표 뱃지</b>로 노출됩니다.</span>
          </div>

          <div className="mt-2 flex flex-wrap gap-1.5">
            {tags.length === 0 && <p className="text-xs text-cake-ink-soft">등록된 태그가 없어요</p>}
            {tags.map((t, idx) => (
              <span
                key={t}
                className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-all ${
                  idx === 0
                    ? 'bg-cake-pink-500 text-white shadow-cake-xs'
                    : 'bg-cake-lavender-100 text-cake-lavender-600'
                }`}
              >
                {idx === 0 && (
                  <span className="flex items-center gap-0.5 rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] font-bold">
                    ⭐ 대표
                  </span>
                )}
                #{t}
                {idx > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setTags((prev) => [t, ...prev.filter((item) => item !== t)])
                    }}
                    title="대표 태그로 설정"
                    className="text-[10px] underline opacity-75 hover:opacity-100"
                  >
                    대표로 설정
                  </button>
                )}
                <button
                  onClick={() => setTags((prev) => prev.filter((tag) => tag !== t))}
                  aria-label="태그 삭제"
                  className={idx === 0 ? 'text-white/80 hover:text-white' : 'text-cake-lavender-600'}
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
          <div className="mt-3 flex gap-1.5">
            <input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddTag()
                }
              }}
              placeholder="태그 직접 입력"
              className="flex-1 rounded-full border border-cake-pink-200 px-3 py-1.5 text-xs outline-none focus:border-cake-pink-400"
            />
            <button
              onClick={handleAddTag}
              disabled={!newTag.trim()}
              className="flex items-center gap-1 rounded-full bg-cake-pink-50 px-3 py-1.5 text-xs font-semibold text-cake-pink-500 disabled:opacity-40"
            >
              <Plus size={12} /> 추가
            </button>
          </div>
        </Card>

        {saveError && <p className="text-center text-xs font-medium text-red-500">{saveError}</p>}
        <Button className="w-full" loading={saving} disabled={!productId || !title || !imageUrl || uploadingImage} onClick={handleSave}>
          {existing ? '수정 완료' : '등록하기'}
        </Button>
      </div>
    </div>
  )
}