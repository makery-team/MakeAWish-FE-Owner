import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CaretRight, User, Trash, ArrowClockwise } from '@phosphor-icons/react'
import { fetchChatRooms, deleteChatRoom } from '../../api/chatApi'
import { useAuthStore } from '../../store/useAuthStore'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import EmptyState from '../../components/ui/EmptyState'
import Spinner from '../../components/ui/Spinner'

export default function ChatManage() {
  const navigate = useNavigate()
  const { user, fetchUserProfile } = useAuthStore()
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadRooms = async () => {
    try {
      if (!user?.id) {
        await fetchUserProfile()
      }
      const res = await fetchChatRooms()
      setRooms(Array.isArray(res) ? res : [])
    } catch (error) {
      console.error('[ChatManage] 채팅방 목록 로드 실패:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadRooms()
  }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    loadRooms()
  }

  const handleDelete = async (e, roomNumber, customerName) => {
    e.stopPropagation()
    if (!window.confirm(`${customerName}님과의 채팅방을 나가시겠습니까? 대화 내역이 삭제됩니다.`)) return
    try {
      await deleteChatRoom(roomNumber)
      setRooms((prev) => prev.filter((r) => r.roomNumber !== roomNumber))
    } catch (error) {
      console.error('[ChatManage] 채팅방 삭제 실패:', error)
      alert('채팅방을 삭제하지 못했습니다.')
    }
  }

  return (
    <div className="pb-24">
      <PageHeader 
        title="채팅 관리" 
        subtitle={loading ? '채팅 목록을 불러오는 중...' : `총 ${rooms.length}건의 대화`}
        action={
          <button
            onClick={handleRefresh}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-cake-pink-50 text-cake-pink-600 transition-all hover:bg-cake-pink-100 active:scale-95"
            aria-label="새로고침"
          >
            <ArrowClockwise size={18} className={refreshing ? 'animate-spin' : ''} />
          </button>
        }
      />

      <div className="mt-3 flex flex-col gap-3 px-5">
        {loading && (
          <div className="py-16 text-center">
            <Spinner label="대화 목록을 불러오고 있어요..." />
          </div>
        )}

        {!loading && rooms.length === 0 && (
          <EmptyState
            icon="💬"
            title="진행 중인 채팅이 없어요"
            description="소비자 앱에서 고객이 1:1 채팅 문의를 시작하면 여기에 실시간으로 표시됩니다."
          />
        )}

        {!loading && rooms.map((room) => {
          const messages = room.messages || []
          const lastMsg = messages.length > 0 ? messages[messages.length - 1] : null
          const customerName = room.otherName || `손님 (${room.otherId})`
          const lastText = lastMsg?.message || '대화를 시작해 보세요!'
          const formattedTime = lastMsg?.createdTime
            ? new Date(lastMsg.createdTime).toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              })
            : ''

          return (
            <Card
              key={room.roomNumber}
              onClick={() => navigate(`/chat/${room.roomNumber}`, { state: { customerName, otherId: room.otherId } })}
              className="cursor-pointer transition-all hover:border-cake-pink-200 active:scale-[0.98]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cake-pink-100 text-cake-pink-600">
                    <User size={22} weight="fill" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display text-base font-bold text-cake-ink">{customerName}</span>
                      <span className="rounded-full bg-cake-pink-50 px-2 py-0.5 text-[10px] font-semibold text-cake-pink-600">
                        1:1 문의
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-1 text-sm text-cake-ink-soft">
                      {lastText}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-medium text-cake-ink-soft">{formattedTime}</span>
                    <button
                      onClick={(e) => handleDelete(e, room.roomNumber, customerName)}
                      className="p-1 text-cake-ink-soft hover:text-red-500 active:scale-95"
                      aria-label="채팅방 나가기"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                  <CaretRight size={18} className="text-cake-ink-soft" />
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
