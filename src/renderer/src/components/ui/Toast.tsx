import ErrorIcon from '@renderer/assets/icon/base/Toast/ErrorIcon'
import SuccessIcon from '@renderer/assets/icon/base/Toast/SuccessIcon'
import WarningIcon from '@renderer/assets/icon/base/Toast/WarningIcon'
import {
  type Accessor,
  For,
  type JSX,
  type JSXElement,
  type Setter,
  Show,
  createContext,
  createSignal,
  useContext
} from 'solid-js'
import { Portal } from 'solid-js/web'

import Button from './Button'

export interface ToastType {
  id: number
  text: string | JSXElement
  type: string
  position: string
  mask: boolean
  size: 'small' | 'normal'
  callback?: (res: boolean | PromiseLike<boolean>) => unknown
}

interface ToastOption {
  duration?: number
  position?: string
  mask?: boolean
  size?: 'small' | 'normal'
}

const UIContext = createContext<{
  toasts: Accessor<ToastType[]>
  setToasts: Setter<ToastType[]>
}>()

const Icon = {
  get success() {
    return <SuccessIcon width={20} height={20} class="text-success" />
  },
  get warning() {
    return <WarningIcon width={20} height={20} class="text-warning" />
  },
  get error() {
    return <ErrorIcon width={20} height={20} class="text-error" />
  }
}

export function ToastsContainer() {
  return (
    <Portal>
      <For each={useContext(UIContext)!.toasts()}>
        {(toast) => (
          <>
            <Show when={toast.mask}>
              <div class="fixed inset-0 z-40 h-full w-full bg-dark-pro bg-opacity-60" />
            </Show>
            <div
              class={
                'fixed left-1/2 z-50 -translate-x-1/2 select-none text-text1 ' + toast.position
              }
            >
              <div
                class={`flex animate-popup flex-col gap-2 rounded-lg bg-dark-con shadow-center ${{ small: 'p-2', normal: 'p-5' }[toast.size || 'normal']}`}
              >
                <div class={`flex items-center gap-1`}>
                  <Show when={Icon[toast.type]}>
                    <div class="flex">{Icon[toast.type]}</div>
                  </Show>
                  {typeof toast.text === 'string' ? (
                    <div class={toast.type === 'confirm' ? `px-4 pt-4` : ''}>{toast.text}</div>
                  ) : (
                    <div>{toast.text}</div>
                  )}
                </div>
                <Show when={toast.type === 'confirm'}>
                  <div class="mt-2 flex w-full justify-around">
                    <Button
                      onClick={() => {
                        toast.callback!(false)
                      }}
                    >
                      取消
                    </Button>
                    <Button
                      onClick={() => {
                        toast.callback!(true)
                      }}
                    >
                      确定
                    </Button>
                  </div>
                </Show>
              </div>
            </div>
          </>
        )}
      </For>
    </Portal>
  )
}

export function ToastProvider(props: { children: JSX.Element }) {
  const [showToast, setShowToast] = createSignal<ToastType[]>([])

  return (
    <UIContext.Provider
      value={{
        toasts: showToast,
        setToasts: setShowToast
      }}
    >
      {props.children}
      <ToastsContainer />
    </UIContext.Provider>
  )
}

export function useToast() {
  const { setToasts: setShowToast } = useContext(UIContext)!
  function show(
    text: string,
    type: string,
    duration: number,
    position: string,
    mask = false,
    size: ToastOption['size'] = 'small'
  ) {
    const id = Date.now()
    setShowToast((t) => [...t, { id, text, type, position, mask, size }])
    setTimeout(() => {
      setShowToast((ts) => ts.filter((t) => t.id !== id))
    }, duration)
  }
  async function showConfirm(
    text: string | JSXElement,
    position: string,
    mask = false
  ): Promise<boolean> {
    const id = Date.now()
    return new Promise((resolve) => {
      setShowToast((t) => [
        ...t,
        {
          id,
          text,
          type: 'confirm',
          position,
          callback: (res) => {
            setShowToast((ts) => ts.filter((t) => t.id !== id))
            resolve(res)
          },
          mask,
          size: 'normal'
        }
      ])
    })
  }
  type Modal = (option: { close: (data: unknown) => void }) => JSXElement
  async function showModal(model: Modal, position: string, mask: boolean = true) {
    const id = Date.now()
    return new Promise((res) => {
      setShowToast((t) => [
        ...t,
        {
          id,
          text: model({
            close: (data) => {
              setShowToast((ts) => ts.filter((t) => t.id !== id))
              res(data)
            }
          }),
          type: 'modal',
          position,
          mask,
          size: 'normal'
        }
      ])
    })
  }
  return {
    success: (text: string, option: ToastOption = {}) =>
      show(
        text,
        'success',
        option.duration || 1500,
        option.position || 'top-1/3',
        option.mask,
        option.size
      ),
    warning: (text: string, option: ToastOption = {}) =>
      show(
        text,
        'warning',
        option.duration || 1500,
        option.position || 'top-1/3',
        option.mask,
        option.size
      ),
    error: (text: string, option: ToastOption = {}) =>
      show(
        text,
        'error',
        option.duration || 1500,
        option.position || 'top-1/3',
        option.mask,
        option.size
      ),
    info: (text: string, option: ToastOption = {}) =>
      show(
        text,
        'info',
        option.duration || 1500,
        option.position || 'top-1/3',
        option.mask,
        option.size
      ),
    clear: () => setShowToast([]),
    confirm: (text: string | JSXElement, option: ToastOption = {}) =>
      showConfirm(text, option.position || 'top-1/3', option.mask),
    modal: (model: Modal, option: ToastOption = {}) =>
      showModal(model, option.position || 'top-1/3', option.mask)
  }
}
