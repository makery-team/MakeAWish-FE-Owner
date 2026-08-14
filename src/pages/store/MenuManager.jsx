import { useState, useEffect } from 'react'
import { Plus, Trash, PencilSimple } from '@phosphor-icons/react'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { useShopStore } from '../../store/useShopStore'
import { createProduct, updateProduct, deleteProduct } from '../../api/productApi'
import { useNavigate } from 'react-router-dom'

export default function MenuManager() {
  const { profile, fetchProfile } = useShopStore()
  const [menus, setMenus] = useState([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    setMenus(profile.categories || [])
  }, [profile.categories])

  const handleAddMenu = async () => {
    const name = window.prompt('새로운 메뉴(카테고리) 이름을 입력하세요.\n예: 도시락 케이크, 2단 생화 케이크')
    if (!name || !name.trim()) return

    setLoading(true)
    try {
      await createProduct(profile.id, { name: name.trim(), price: 0, description: '' })
      await fetchProfile()
    } catch (e) {
      console.error(e)
      alert('메뉴 추가에 실패했습니다.')
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

  const handleEditMenu = async (menu) => {
    const newName = window.prompt('메뉴 이름을 수정하세요.', menu.name)
    if (!newName || !newName.trim() || newName === menu.name) return

    setLoading(true)
    try {
      await updateProduct(profile.id, menu.id, { name: newName.trim(), price: menu.price, description: menu.description })
      await fetchProfile()
    } catch (e) {
      console.error(e)
      alert('메뉴 수정에 실패했습니다.')
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
          <p>도시락 케이크, 입체 케이크처럼 <b>판매하시는 케이크 종류</b>를 등록해주세요. 각 메뉴별로 다르게 주문서 양식을 설정하고, 포트폴리오를 분류할 수 있습니다.</p>
        </div>

        {menus.length === 0 && !loading && (
          <div className="py-10 text-center text-sm text-cake-ink-soft">
            등록된 메뉴가 없습니다.
          </div>
        )}

        {menus.map((menu) => (
          <Card key={menu.id} className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-cake-ink">{menu.name}</span>
              <div className="flex gap-2">
                <button onClick={() => handleEditMenu(menu)} className="text-cake-ink-soft active:text-cake-pink-500">
                  <PencilSimple size={18} />
                </button>
                <button onClick={() => handleDeleteMenu(menu.id)} className="text-cake-ink-soft active:text-red-400">
                  <Trash size={18} />
                </button>
              </div>
            </div>
          </Card>
        ))}

        <button
          onClick={handleAddMenu}
          disabled={loading}
          className="mt-2 flex items-center justify-center gap-1.5 rounded-3xl border-2 border-dashed border-cake-pink-200 py-4 text-sm font-semibold text-cake-pink-500 active:bg-cake-pink-50"
        >
          <Plus size={16} /> {loading ? '처리 중...' : '새로운 메뉴 추가하기'}
        </button>
      </div>
    </div>
  )
}
