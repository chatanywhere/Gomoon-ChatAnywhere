import SaveIcon from '@renderer/assets/icon/base/SaveIcon'
import { Show, createSignal } from 'solid-js'

export default function EditInput(props: {
  label: string
  value?: string
  spellcheck?: boolean
  onSave: (value: string) => void
  optional?: boolean
}) {
  const [value, setValue] = createSignal(props.value || '')
  const [isEditing, setIsEditing] = createSignal(false)
  let inputRef: HTMLInputElement | undefined
  const onSave = () => {
    props.onSave(value())
    setIsEditing(false)
  }

  return (
    <div class="mb-1 flex items-center gap-3">
      <div class="text-gray-500 text-sm font-bold">{props.label}</div>
      <Show
        when={isEditing()}
        fallback={
          <div
            class="flex max-w-lg flex-1 cursor-pointer items-center overflow-hidden rounded-md p-1 hover:bg-dark-con"
            onClick={() => {
              setIsEditing(true)
              inputRef?.focus()
            }}
          >
            <span class="text-gray-500 mr-2 truncate text-ellipsis text-sm">
              {value() || '填写您的 ' + props.label + (props.optional ? '（非必填）' : '')}
            </span>
          </div>
        }
      >
        <div class="relative max-w-lg flex-1">
          <input
            spellcheck={props.spellcheck || false}
            ref={inputRef}
            type="text"
            value={value()}
            onInput={(e) => setValue((e.target as HTMLInputElement).value)}
            onBlur={onSave}
          />
          <SaveIcon
            height={20}
            class="absolute right-0 top-1 cursor-pointer text-gray hover:text-active"
            onClick={onSave}
          />
        </div>
      </Show>
    </div>
  )
}
