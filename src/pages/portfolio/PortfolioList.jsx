import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from '@phosphor-icons/react'
import { usePortfolioStore } from '../../store/usePortfolioStore'
import PageHeader from '../../components/ui/PageHeader'

import { useShopStore } from '../../store/useShopStore'

export default function PortfolioList() {
  const navigate = useNavigate()
  const { portfolios, portfoliosError, fetchPortfolios } = usePortfolioStore()
  const { profile } = useShopStore()

  useEffect(() => {
    if (profile.id) {
      fetchPortfolios(profile.id)
    }
  }, [fetchPortfolios, profile.id])

  const [selectedProductId, setSelectedProductId] = useState(null)
  
  const filteredPortfolios = selectedProductId
    ? portfolios.filter(p => p.productId === selectedProductId)
    : portfolios

  return (
    <div className="pb-6">
      <PageHeader
        title="포트폴리오"
        subtitle={`${portfolios.length}개의 작품`}
        right={
          <button
            onClick={() => navigate('/portfolio/new')}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-cake-pink-500 text-white active:scale-95"
            aria-label="포트폴리오 등록"
          >
            <Plus size={18} weight="bold" />
          </button>
        }
      />

      {portfoliosError && <p className="px-5 pb-2 text-xs font-medium text-red-500">{portfoliosError}</p>}

      <div className="px-5 pb-3 flex gap-2 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setSelectedProductId(null)}
          className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${
            selectedProductId === null
              ? 'bg-cake-ink text-white'
              : 'bg-cake-pink-50 text-cake-ink-soft'
          }`}
        >
          전체보기
        </button>
        {profile?.categories?.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedProductId(cat.id)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${
              selectedProductId === cat.id
                ? 'bg-cake-ink text-white'
                : 'bg-cake-pink-50 text-cake-ink-soft'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 px-5">
        {filteredPortfolios.map((p) => (
          <button
            key={p.id}
            onClick={() => navigate(`/portfolio/${p.id}/edit`)}
            className="flex flex-col overflow-hidden rounded-3xl bg-white text-left shadow-cake-sm ring-1 ring-cake-pink-100 active:scale-[0.97]"
          >
            <img src={p.imageUrl} alt={p.title} className="aspect-square w-full object-cover" />
            <div className="p-2.5">
              <p className="truncate text-xs font-semibold text-cake-ink">{p.title}</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {p.tags.map((t) => (
                  <span key={t} className="rounded-full bg-cake-pink-50 px-2 py-0.5 text-[10px] font-medium text-cake-pink-500">
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}