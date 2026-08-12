import { useState } from 'react'
import { Trash, Plus, DotsSixVertical } from '@phosphor-icons/react'
import { useOrderStore } from '../../store/useOrderStore'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'

export default function OrderSchemaEditor() {
  const { schemaFields, updateSchemaFields } = useOrderStore()
  const [fields, setFields] = useState(schemaFields)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const updateLabel = (id, label) => {
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, label } : f)))
  }

  const removeField = (id) => setFields((prev) => prev.filter((f) => f.id !== id))

  const addField = () => {
    setFields((prev) => [
      ...prev,
      { id: `field_${Date.now()}`, label: '' },
    ])
  }

  const handleSave = async () => {
    const validFields = fields.filter((f) => f.label.trim() !== '')
    if (validFields.length === 0) return

    setSaving(true)
    await updateSchemaFields(validFields)
    setFields(validFields)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  const isEmpty = fields.length === 0

  return (
    <div className="pb-6">
      <PageHeader title="주문서 양식 설정" subtitle="AI 점원이 고객에게 물어볼 항목을 설정해요" back />

      <div className="flex flex-col gap-3 px-5">
        {isEmpty && (
          <div className="flex flex-col items-center gap-2 py-10 text-center text-cake-ink-soft">
            <p className="text-sm">아직 등록된 항목이 없어요</p>
            <p className="text-xs text-cake-ink-muted">아래 버튼을 눌러 항목을 추가해 보세요</p>
          </div>
        )}

        {fields.map((f, index) => (
          <Card key={f.id} className="flex items-center gap-3">
            <DotsSixVertical size={18} className="shrink-0 text-cake-ink-muted" />
            <div className="flex-1">
              <input
                value={f.label}
                onChange={(e) => updateLabel(f.id, e.target.value)}
                placeholder="항목 이름을 입력하세요"
                className="w-full border-b border-transparent bg-transparent text-sm font-semibold text-cake-ink outline-none placeholder:text-cake-ink-muted focus:border-cake-pink-300"
                autoFocus={f.label === ''}
              />
              <span className="mt-1 inline-block text-[10px] text-cake-ink-muted">
                {index + 1}번째 질문
              </span>
            </div>
            <button onClick={() => removeField(f.id)} className="text-cake-ink-soft active:text-red-400" aria-label="삭제">
              <Trash size={18} />
            </button>
          </Card>
        ))}

        <button
          onClick={addField}
          className="flex items-center justify-center gap-1.5 rounded-3xl border-2 border-dashed border-cake-pink-200 py-3 text-sm font-semibold text-cake-pink-500 active:bg-cake-pink-50"
        >
          <Plus size={16} /> 항목 추가
        </button>

        <Button className="mt-2 w-full" loading={saving} onClick={handleSave}>
          {saved ? '저장됐어요 ✓' : '저장하기'}
        </Button>
      </div>
    </div>
  )
}