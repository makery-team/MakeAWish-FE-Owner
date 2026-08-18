import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Star, 
  ChatCircleText, 
  ChatCircleDots, 
  Trash, 
  PencilSimple, 
  CheckCircle, 
  Sparkle,
  ImageSquare
} from '@phosphor-icons/react'
import { useReviewStore } from '../../store/useReviewStore'
import { useShopStore } from '../../store/useShopStore'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'

export default function ReviewManager() {
  const navigate = useNavigate()
  const { profile } = useShopStore()
  const { reviews, loading, error, fetchReviews, submitReply, removeReply, getStats } = useReviewStore()

  const [activeFilter, setActiveFilter] = useState('ALL') // ALL, UNANSWERED, ANSWERED, PHOTO
  const [replyingId, setReplyingId] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [submittingReply, setSubmittingReply] = useState(false)

  useEffect(() => {
    fetchReviews(profile?.id)
  }, [profile?.id, fetchReviews])

  const stats = getStats()

  const filteredReviews = reviews.filter((r) => {
    if (activeFilter === 'UNANSWERED') return !r.replyContent
    if (activeFilter === 'ANSWERED') return !!r.replyContent
    if (activeFilter === 'PHOTO') return !!r.imageUrl
    return true
  })

  const handleStartReply = (review) => {
    setReplyingId(review.id)
    setReplyText(review.replyContent || '')
  }

  const handleCancelReply = () => {
    setReplyingId(null)
    setReplyText('')
  }

  const handleSaveReply = async (reviewId) => {
    if (!replyText.trim()) {
      alert('답글 내용을 입력해주세요.')
      return
    }

    setSubmittingReply(true)
    try {
      await submitReply(reviewId, replyText.trim())
      setReplyingId(null)
      setReplyText('')
    } catch (err) {
      alert('답글 저장에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setSubmittingReply(false)
    }
  }

  const handleDeleteReply = async (reviewId) => {
    if (!window.confirm('정말 작성하신 답글을 삭제하시겠습니까?')) return

    try {
      await removeReply(reviewId)
    } catch (err) {
      alert('답글 삭제에 실패했습니다.')
    }
  }

  return (
    <div className="pb-10 flex flex-col">
      <PageHeader
        title="리뷰 관리"
        subtitle="고객 후기를 확인하고 사장님 공식 답글을 남겨보세요"
        back
      />

      <div className="px-5 pt-2 flex flex-col gap-4">
        {/* 요약 통계 카드 */}
        <Card className="bg-gradient-to-br from-cake-pink-500 to-cake-pink-600 text-white shadow-cake">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-white/80">매장 고객 만족도</p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-display text-3xl font-extrabold">{stats.averageRating || '0.0'}</span>
                <span className="text-xs text-white/80">/ 5.0</span>
              </div>
              <div className="mt-1 flex items-center gap-1 text-amber-300">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={16}
                    weight={star <= Math.round(stats.averageRating) ? 'fill' : 'regular'}
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1 text-right text-xs">
              <div className="rounded-xl bg-white/20 px-3 py-1.5 backdrop-blur">
                <span>총 리뷰 <b>{stats.totalCount}</b>건</span>
              </div>
              <div className="rounded-xl bg-white/20 px-3 py-1.5 backdrop-blur">
                <span>미답변 <b className="text-amber-200">{stats.pendingReplyCount}</b>건</span>
              </div>
            </div>
          </div>
        </Card>

        {/* 필터 탭 바 */}
        <div className="scrollbar-none flex gap-2 overflow-x-auto py-1">
          {[
            { key: 'ALL', label: `전체 (${stats.totalCount})` },
            { key: 'UNANSWERED', label: `미답변 (${stats.pendingReplyCount})` },
            { key: 'ANSWERED', label: `답변완료 (${stats.withReplyCount})` },
            { key: 'PHOTO', label: '포토 리뷰' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                activeFilter === f.key
                  ? 'bg-cake-pink-500 text-white shadow-sm'
                  : 'bg-white text-cake-ink-soft ring-1 ring-cake-pink-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* 리뷰 목록 영역 */}
        {loading && (
          <div className="py-12 text-center text-xs text-cake-ink-soft">
            리뷰를 불러오는 중입니다…
          </div>
        )}

        {!loading && filteredReviews.length === 0 && (
          <EmptyState
            icon="💬"
            title="조건에 맞는 리뷰가 없어요"
            description="새로운 고객 리뷰가 등록되면 여기에 표시됩니다."
          />
        )}

        {!loading && (
          <div className="flex flex-col gap-3.5">
            {filteredReviews.map((review) => (
              <Card key={review.id} className="flex flex-col gap-3">
                {/* 리뷰 작성자 헤더 */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-cake-ink">
                        {review.nickname || '익명 고객'}
                      </span>
                      <div className="flex items-center text-amber-400">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={13}
                            weight={star <= review.rating ? 'fill' : 'regular'}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-[11px] text-cake-ink-soft">
                      {review.createdAt ? new Date(review.createdAt).toLocaleDateString('ko-KR') : ''}
                    </span>
                  </div>

                  {review.replyContent ? (
                    <span className="rounded-full bg-cake-mint-50 px-2 py-0.5 text-[10px] font-bold text-cake-mint-700">
                      답변완료
                    </span>
                  ) : (
                    <span className="rounded-full bg-cake-yellow-100 px-2 py-0.5 text-[10px] font-bold text-cake-yellow-700">
                      답변대기
                    </span>
                  )}
                </div>

                {/* 포토 리뷰 이미지 */}
                {review.imageUrl && (
                  <div className="overflow-hidden rounded-2xl border border-cake-pink-100 bg-cake-pink-50">
                    <img
                      src={review.imageUrl}
                      alt="고객 리뷰 사진"
                      className="max-h-56 w-full object-cover"
                    />
                  </div>
                )}

                {/* 리뷰 텍스트 */}
                <p className="text-xs leading-relaxed text-cake-ink whitespace-pre-wrap">
                  {review.content}
                </p>

                {/* 사장님 답글 영역 */}
                {review.replyContent && replyingId !== review.id && (
                  <div className="mt-1 rounded-2xl bg-cake-pink-50/70 p-3.5 border border-cake-pink-100/60">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-cake-pink-700 flex items-center gap-1">
                        👩‍🍳 사장님 답글
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-cake-ink-soft">
                          {review.replyCreatedAt ? new Date(review.replyCreatedAt).toLocaleDateString('ko-KR') : ''}
                        </span>
                        <button
                          onClick={() => handleStartReply(review)}
                          className="text-cake-ink-soft hover:text-cake-pink-600 transition-colors p-1"
                          title="답글 수정"
                        >
                          <PencilSimple size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteReply(review.id)}
                          className="text-cake-ink-soft hover:text-red-500 transition-colors p-1"
                          title="답글 삭제"
                        >
                          <Trash size={14} />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs leading-relaxed text-cake-ink whitespace-pre-wrap">
                      {review.replyContent}
                    </p>
                  </div>
                )}

                {/* 답글 작성/수정 폼 */}
                {replyingId === review.id && (
                  <div className="mt-2 flex flex-col gap-2 rounded-2xl bg-cake-pink-50 p-3">
                    <span className="text-xs font-bold text-cake-pink-700">
                      👩‍🍳 사장님 답글 {review.replyContent ? '수정' : '작성'}
                    </span>
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="고객님께 감사의 마음을 담아 정성스러운 답글을 남겨보세요."
                      className="w-full rounded-xl border border-cake-pink-200 bg-white p-2.5 text-xs outline-none focus:border-cake-pink-400"
                      rows={3}
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        className="px-3 py-1.5 text-xs"
                        onClick={handleCancelReply}
                      >
                        취소
                      </Button>
                      <Button
                        className="px-4 py-1.5 text-xs"
                        loading={submittingReply}
                        onClick={() => handleSaveReply(review.id)}
                      >
                        {review.replyContent ? '수정 완료' : '답글 등록'}
                      </Button>
                    </div>
                  </div>
                )}

                {/* 답글이 없고 작성 폼도 안 열려 있을 때 [답글 달기] 버튼 */}
                {!review.replyContent && replyingId !== review.id && (
                  <button
                    onClick={() => handleStartReply(review)}
                    className="mt-1 flex items-center justify-center gap-1 rounded-xl border border-dashed border-cake-pink-300 py-2 text-xs font-semibold text-cake-pink-600 hover:bg-cake-pink-50 active:bg-cake-pink-100 transition-colors"
                  >
                    <ChatCircleDots size={15} /> 답글 달기
                  </button>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
