import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash, PencilSimple, ImageSquare } from '@phosphor-icons/react'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import MenuModal from '../../components/ui/MenuModal'
import { useShopStore } from '../../store/useShopStore'
import { usePortfolioStore } from '../../store/usePortfolioStore'
import { createProduct, updateProduct, deleteProduct } from '../../api/productApi'

export default function MenuManager() {
  const { profile, fetchProfile } = useShopStore()
  const { portfolios, portfoliosError, fetchPortfolios } = usePortfolioStore()
  const [menus, setMenus] = useState([])
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMenu, setEditingMenu] = useState(null)
  const [selectedProductId, setSelectedProductId] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  useEffect(() => {
    setMenus(profile.categories || [])
  }, [profile.categories])

  useEffect(() => {
    if (profile?.id) {
      fetchPortfolios(profile.id)
    }
  }, [fetchPortfolios, profile?.id])

  const handleOpenAddModal = () => {
    setEditingMenu(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (menu) => {
    setEditingMenu(menu)
    setIsModalOpen(true)
  }

  const handleModalSubmit = async (formData) => {
    setLoading(true)
    try {
      if (editingMenu) {
        await updateProduct(profile.id, editingMenu.id, {
          name: formData.name,
          price: formData.price,
          description: formData.description,
        })
      } else {
        await createProduct(profile.id, {
          name: formData.name,
          price: formData.price,
          description: formData.description,
        })
      }
      await fetchProfile()
      setIsModalOpen(false)
      setEditingMenu(null)
    } catch (e) {
      console.error(e)
      alert(editingMenu ? '메뉴 수정에 실패했습니다.' : '메뉴 추가에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteMenu = async (productId) => {
    if (!window.confirm('정말 이 메뉴를 삭제하시겠습니까?\n주의: 관련된 양식과 포트폴리오 연결이 끊어질 수 있습니다.')) return

    setLoading(true)
    try {
      await deleteProduct(profile.id, productId)
      await fetchProfile()
    } catch (e) {
      console.error(e)
      alert('메뉴 삭제에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const filteredPortfolios = selectedProductId
    ? portfolios.filter((p) => Number(p.productId) === Number(selectedProductId))
    : portfolios

  return (
    <div className="pb-8 flex flex-col">
      <PageHeader title="메뉴 관리" subtitle="메뉴(카테고리), 주문서 양식, 포트폴리오를 한곳에서 관리해요" />

      <div className="px-5 pt-2 flex flex-col gap-6">
        {/* 안내 배너 */}
        <div className="rounded-2xl bg-cake-pink-50 p-4 text-[13px] leading-relaxed text-cake-pink-700">
          <p className="mb-1 font-bold text-cake-pink-600">💡 메뉴와 주문서, 포트폴리오 관리</p>
          <p>
            판매하시는 케이크 <b>메뉴(카테고리)</b>를 등록하고, 각 메뉴별 <b>주문서 양식</b>과 <b>포트폴리오 사진</b>을 등록해 보세요!
          </p>
        </div>

        {/* 1. 메뉴(카테고리) 목록 섹션 */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-cake-ink">메뉴(카테고리) 목록</h2>
            <span className="text-xs text-cake-ink-soft">{menus.length}개 등록됨</span>
          </div>

          {menus.length === 0 && !loading && (
            <div className="py-8 text-center text-sm text-cake-ink-soft rounded-2xl bg-white/70 border border-dashed border-cake-pink-100">
              아직 등록된 메뉴가 없습니다.
            </div>
          )}

          {menus.map((menu) => (
            <Card key={menu.id} className="flex flex-col gap-2">
              <div className="flex items-start justify-between">
                <div className="flex-1 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-cake-ink">{menu.name}</span>
                    <span className="rounded-full bg-cake-pink-50 px-2 py-0.5 text-[11px] font-bold text-cake-pink-600">
                      {Number(menu.price || 0).toLocaleString()}원~
                    </span>
                  </div>
                  {menu.description ? (
                    <p className="mt-1 text-xs text-cake-ink-soft line-clamp-2">{menu.description}</p>
                  ) : (
                    <p className="mt-1 text-xs text-gray-400">설명 없음</p>
                  )}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => navigate(`/orders/schema?menuId=${menu.id}`)}
                    className="rounded-xl bg-cake-pink-50 px-2.5 py-1.5 text-xs font-semibold text-cake-pink-600 active:bg-cake-pink-100 transition-colors"
                  >
                    양식 수정
                  </button>
                  <button
                    onClick={() => handleOpenEditModal(menu)}
                    className="p-1.5 rounded-xl text-cake-ink-soft hover:bg-gray-100 active:text-cake-pink-500 transition-colors"
                    title="수정"
                  >
                    <PencilSimple size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteMenu(menu.id)}
                    className="p-1.5 rounded-xl text-cake-ink-soft hover:bg-red-50 active:text-red-500 transition-colors"
                    title="삭제"
                  >
                    <Trash size={18} />
                  </button>
                </div>
              </div>
            </Card>
          ))}

          <button
            onClick={handleOpenAddModal}
            disabled={loading}
            className="flex items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-cake-pink-200 py-3.5 text-sm font-semibold text-cake-pink-500 active:bg-cake-pink-50 hover:bg-cake-pink-50 transition-colors"
          >
            <Plus size={16} /> {loading ? '처리 중...' : '새로운 메뉴 추가하기'}
          </button>
        </section>

        {/* 2. 포트폴리오 갤러리 섹션 */}
        <section className="flex flex-col gap-3 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-cake-ink">포트폴리오 사진</h2>
              <p className="text-xs text-cake-ink-soft mt-0.5">{portfolios.length}개의 작품 등록됨</p>
            </div>
            <button
              onClick={() => navigate('/portfolio/new')}
              className="flex items-center gap-1 rounded-xl bg-cake-pink-500 px-3 py-1.5 text-xs font-bold text-white shadow-sm active:scale-95 transition-transform"
            >
              <Plus size={14} weight="bold" /> 사진 등록
            </button>
          </div>

          {portfoliosError && <p className="text-xs font-medium text-red-500">{portfoliosError}</p>}

          {/* 카테고리 필터 바 (기존 UI 유지) */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1">
            <button
              onClick={() => setSelectedProductId(null)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
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
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  selectedProductId === cat.id
                    ? 'bg-cake-ink text-white'
                    : 'bg-cake-pink-50 text-cake-ink-soft'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {filteredPortfolios.length === 0 && !loading && (
            <div className="py-10 text-center text-xs text-cake-ink-soft rounded-2xl bg-white/70 border border-dashed border-cake-pink-100 flex flex-col items-center gap-2">
              <ImageSquare size={32} className="text-cake-pink-200" />
              <span>등록된 포트폴리오가 없습니다.</span>
            </div>
          )}

          {/* 2열 갤러리 그리드 */}
          <div className="grid grid-cols-2 gap-3">
            {filteredPortfolios.map((p) => (
              <button
                key={p.id}
                onClick={() => navigate(`/portfolio/${p.id}/edit`)}
                className="flex flex-col overflow-hidden rounded-3xl bg-white text-left shadow-cake-sm ring-1 ring-cake-pink-100 active:scale-[0.97] transition-transform"
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
        </section>
      </div>

      {/* 메뉴 추가/수정 모달 */}
      <MenuModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingMenu(null)
        }}
        onSubmit={handleModalSubmit}
        initialData={editingMenu}
        loading={loading}
      />
    </div>
  )
}
