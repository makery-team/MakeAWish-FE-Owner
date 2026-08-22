import { useEffect } from 'react'
import { X, DownloadSimple, ArrowSquareOut } from '@phosphor-icons/react'

export default function ImageModal({ isOpen, onClose, imageUrl, title = '시안 상세 보기' }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen || !imageUrl) return null

  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = `makeawish_design_${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(blobUrl)
    } catch (error) {
      console.warn('직접 다운로드 실패, 새 탭 열기로 대체:', error)
      window.open(imageUrl, '_blank')
    }
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cake-pink-100 px-5 py-3.5 bg-white">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-cake-pink-500"></span>
            <h3 className="text-sm font-bold text-cake-ink">{title}</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 rounded-xl bg-cake-pink-50 px-3 py-1.5 text-xs font-bold text-cake-pink-600 transition hover:bg-cake-pink-100 active:scale-95 cursor-pointer"
              title="이미지 다운로드"
            >
              <DownloadSimple size={16} weight="bold" />
              <span>다운로드</span>
            </button>
            <a
              href={imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-xl bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-200 active:scale-95"
              title="새 탭에서 원본 보기"
            >
              <ArrowSquareOut size={16} weight="bold" />
              <span>새 탭</span>
            </a>
            <button
              onClick={onClose}
              className="rounded-xl p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 active:scale-95 cursor-pointer"
              title="닫기 (ESC)"
            >
              <X size={20} weight="bold" />
            </button>
          </div>
        </div>

        {/* Image Container */}
        <div className="flex flex-1 items-center justify-center overflow-auto bg-gray-900/5 p-4">
          <img
            src={imageUrl}
            alt={title}
            className="max-h-[74vh] w-auto max-w-full rounded-2xl object-contain shadow-md transition-all select-none"
          />
        </div>

        {/* Footer info */}
        <div className="bg-gray-50/80 px-5 py-2.5 text-center text-xs text-cake-ink-soft border-t border-gray-100">
          💡 이미지를 클릭하거나 ESC 키를 누르면 닫힙니다.
        </div>
      </div>
    </div>
  )
}
