import { JSX, Show, createSignal, onCleanup } from 'solid-js'

export default function (props: {
  label: string
  children: JSX.Element
  position?: string
  onConfirm: () => void
  onCancel?: () => void
  preConfirm?: () => boolean
  popup?: boolean
}) {
  const [show, setShow] = createSignal(false)
  const animation = () => {
    return props.popup ? 'animate-popup' : 'animate-dropdown'
  }
  return (
    <div
      class="relative"
      onClick={(e) => e.stopPropagation()}
      ref={(el) => {
        const fn = (e) => {
          if (e.currentTarget && el.contains(e.currentTarget)) {
            return
          }
          setShow(false)
        }
        document.addEventListener('click', fn)
        onCleanup(() => {
          document.removeEventListener('click', fn)
        })
      }}
    >
      <div
        onClick={(e) => {
          e.stopPropagation()
          if (props.preConfirm && !props.preConfirm()) {
            setShow(false)
            return
          }
          setShow(true)
        }}
      >
        {props.children}
      </div>
      <Show when={show()}>
        <div
          class={
            `absolute flex ${animation()} z-10 flex-col gap-2 overflow-visible rounded-md bg-dark-plus px-2 py-1 shadow-center ` +
            props.position
          }
        >
          <div class="mt-1 text-center text-sm">{props.label}</div>
          <div class="flex justify-around">
            <button
              class="mr-1 w-9 rounded-sm bg-transparent px-1 py-[1px] text-[12px] leading-4 duration-300 hover:bg-active"
              onClick={(e) => {
                e.stopPropagation()
                setShow(false)
                props.onCancel?.()
              }}
            >
              取消
            </button>
            <button
              class="w-9 rounded-sm bg-transparent px-1 py-[1px] text-[12px] leading-4 duration-300 hover:bg-active"
              onClick={(e) => {
                e.stopPropagation()
                setShow(false)
                props.onConfirm?.()
              }}
            >
              确定
            </button>
          </div>
        </div>
      </Show>
    </div>
  )
}
