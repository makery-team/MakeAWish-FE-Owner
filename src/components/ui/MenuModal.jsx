import React, { useState, useEffect } from 'react'
import { X } from '@phosphor-icons/react'
import Button from './Button'

export default function MenuModal({ isOpen, onClose, onSubmit, initialData = null, loading = false }) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name || '')
        setPrice(initialData.price !== undefined && initialData.price !== null ? String(initialData.price) : '')
        setDescription(initialData.description || '')
      } else {
        setName('')
        setPrice('')
        setDescription('')
      }
      setError('')
    }
  }, [isOpen, initialData])

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('메뉴 이름을 입력해주세요.')
      return
    }

    const numPrice = Number(String(price).replace(/[^0-9]/g, '')) || 0
    if (numPrice < 0) {
      setError('올바른 가격을 입력해주세요.')
      return
    }

    onSubmit({
      name: name.trim(),
      price: numPrice,
      description: description.trim(),
    })
  }

  const handlePriceChange = (e) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, '')
    setPrice(rawValue)
    if (error) setError('')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h3 className="font-display text-lg font-bold text-cake-ink">
              {initialData ? '메뉴 수정하기' : '새로운 메뉴 추가'}
            </h3>
            <p className="text-xs text-cake-ink-soft">
              {initialData ? '메뉴명과 기본 시작 가격을 수정합니다.' : '판매할 케이크 종류와 기본 시작 가격을 등록하세요.'}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:bg-gray-100 transition-colors"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          {error && (
            <div className="rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-600">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-bold text-cake-ink">
              메뉴(카테고리) 이름 <span className="text-cake-pink-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (error) setError('')
              }}
              placeholder="예: 도시락 케이크, 2단 생화 케이크"
              disabled={loading}
              className="w-full rounded-2xl border border-cake-pink-100 bg-cake-pink-50/30 px-4 py-3 text-sm text-cake-ink outline-none transition-all focus:border-cake-pink-400 focus:bg-white"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-cake-ink">
              기본 시작 가격 (원) <span className="text-cake-pink-500">*</span>
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                value={price ? Number(price).toLocaleString() : ''}
                onChange={handlePriceChange}
                placeholder="예: 25,000"
                disabled={loading}
                className="w-full rounded-2xl border border-cake-pink-100 bg-cake-pink-50/30 px-4 py-3 text-sm text-cake-ink outline-none transition-all focus:border-cake-pink-400 focus:bg-white"
              />
              <span className="absolute right-4 text-xs font-bold text-cake-ink-soft">원~</span>
            </div>
            <p className="mt-1 text-[11px] text-cake-ink-soft">
              💡 옵션이나 추가금이 붙기 전 기본 케이크의 시작 금액입니다.
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-cake-ink">
              메뉴 설명 (선택)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="예: 1~2인이 가볍게 즐기기 좋은 미니 사이즈 케이크입니다."
              rows={3}
              disabled={loading}
              className="w-full resize-none rounded-2xl border border-cake-pink-100 bg-cake-pink-50/30 px-4 py-3 text-sm text-cake-ink outline-none transition-all focus:border-cake-pink-400 focus:bg-white"
            />
          </div>

          <div className="mt-2 flex gap-2">
            <Button
              type="button"
              variant="ghost"
              className="flex-1"
              onClick={onClose}
              disabled={loading}
            >
              취소
            </Button>
            <Button
              type="submit"
              className="flex-1"
              loading={loading}
            >
              {initialData ? '수정 완료' : '메뉴 추가하기'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
