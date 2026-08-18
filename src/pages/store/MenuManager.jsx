import { useState, useEffect } from 'react'
import { Plus, Trash, PencilSimple } from '@phosphor-icons/react'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import MenuModal from '../../components/ui/MenuModal'
import { useShopStore } from '../../store/useShopStore'
import { createProduct, updateProduct, deleteProduct } from '../../api/productApi'
import { useNavigate } from 'react-router-dom'

export default function MenuManager() {
  const { profile, fetchProfile } = useShopStore()
  const [menus, setMenus] = useState([])
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMenu, setEditingMenu] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    setMenus(profile.categories || [])
  }, [profile.categories])

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

  return (
    <div className="pb-6 h-full flex flex-col">
      <PageHeader title="메뉴(카테고리) 관리" back />

      <div className="px-5 pt-2 flex-1 flex flex-col gap-4">
        <div className="mb-2 rounded-2xl bg-cake-pink-50 p-4 text-[13px] leading-relaxed text-cake-pink-700">
          <p className="mb-1 font-bold text-cake-pink-600">💡 메뉴(카테고리)란?</p>
          <p>도시락 케이크, 입체 케이크처럼 <b>판매하시는 케이크 종류와 기본 시작 가격</b>을 등록해주세요. 각 메뉴별로 다르게 주문서 양식을 설정하고, 포트폴리오를 분류할 수 있습니다.</p>
        </div>

        {menus.length === 0 && !loading && (
          <div className="py-10 text-center text-sm text-cake-ink-soft">
            등록된 메뉴가 없습니다.
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
                  양식 설정
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
          className="mt-2 flex items-center justify-center gap-1.5 rounded-3xl border-2 border-dashed border-cake-pink-200 py-4 text-sm font-semibold text-cake-pink-500 active:bg-cake-pink-50 transition-colors"
        >
          <Plus size={16} /> {loading ? '처리 중...' : '새로운 메뉴 추가하기'}
        </button>
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
