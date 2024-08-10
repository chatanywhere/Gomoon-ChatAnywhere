import Input from '@renderer/components/MainInput'
import Message from '@renderer/components/Message'
import { Show, createSignal, onCleanup, onMount } from 'solid-js'
import { IpcRendererEvent } from 'electron'
import { useSearchParams } from '@solidjs/router'
import { getCurrentAssistantForAnswer } from '@renderer/store/assistants'
import SystemHeader from '@renderer/components/MainSelections'
import Capsule from '@renderer/components/Capsule'
import { inputText, setInputText } from '@renderer/store/input'
import { changeMatchModel, userState } from '@renderer/store/user'

import { genAns, answerStore, ansStatus } from '../../store/answer'

import SelectAssistantModal from './SelectAssistantModel'

export default function Answer() {
  const [showModal, setShowModal] = createSignal(false)
  const [introduce, setIntroduce] = createSignal('每')
  const [query, setQuery] = useSearchParams()
  onMount(() => {
    const introduceFull = '每一次回答都将是一次新的对话'
    // 打字机效果,逐渐显示introduce
    const timer = setInterval(() => {
      if (introduceFull.length === introduce().length) {
        clearInterval(timer)
      } else {
        setIntroduce((i) => {
          return i + introduceFull[i.length]
        })
      }
    }, 70)

    if (query.q) {
      setInputText(query.q)
      setShowModal(true)
      setQuery({
        q: ''
      })
    }
    const removeListener = window.api.multiCopy((_: IpcRendererEvent, msg: string) => {
      setInputText(msg)
      setShowModal(true)
    })

    const currentAssistant = getCurrentAssistantForAnswer()
    if (currentAssistant.id !== userState.preSelectedAssistant) {
      changeMatchModel(currentAssistant.matchModel, currentAssistant.id)
    }

    onCleanup(() => {
      removeListener()
    })
  })

  return (
    <div class="flex h-[calc(100vh-124px)] flex-col gap-4 overflow-auto pb-48 pt-10">
      <Show when={showModal()}>
        <SelectAssistantModal
          onConfirm={() => {
            setShowModal(false)
            genAns(inputText())
            setInputText('')
          }}
          onCancel={() => {
            setShowModal(false)
            setInputText('')
          }}
        />
      </Show>
      <div class="mx-auto flex w-full flex-col gap-4 lg:max-w-4xl">
        <Show
          when={answerStore.question}
          fallback={
            <>
              {
                <div class="flex w-full select-none flex-col items-center justify-center gap-2 px-10 pt-8">
                  <span class="text-sm text-gray">问答助手</span>
                  <span class="whitespace-nowrap text-[12px] text-gray">&lt;{introduce()}&gt;</span>
                </div>
              }
              <SystemHeader type="ans" />
            </>
          }
        >
          <div class="mt-6">
            <Message content={answerStore.question} id="question" type="question" />
          </div>
        </Show>
        <Show when={answerStore.answer}>
          <Show when={!ansStatus.isGenerating}>
            <Capsule
              type="ans"
              botName={getCurrentAssistantForAnswer().name}
              seed={
                getCurrentAssistantForAnswer().avatar || getCurrentAssistantForAnswer().id.slice(-5)
              }
            />
          </Show>
          <Message
            content={answerStore.answer}
            type="ans"
            botName={getCurrentAssistantForAnswer().name}
          />
        </Show>
      </div>

      <div class="fixed bottom-0 left-0 right-0 h-[118px] bg-transparent backdrop-blur-xl" />
      <div class="fixed bottom-10 z-20 w-full px-4">
        <Input
          showClearButton
          disable={showModal()}
          send={genAns}
          // 自动聚焦
          onMountHandler={(input: HTMLTextAreaElement) => {
            input.focus()
          }}
          // onShow自动聚焦
          autoFocusWhenShow
          type="question"
        />
      </div>
    </div>
  )
}
