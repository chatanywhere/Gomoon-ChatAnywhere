import { useNavigate } from '@solidjs/router'
import ModelSelect from './Message/ModelSelect'
import {
  getCurrentAssistantForAnswer,
  getCurrentAssistantForChat
} from '@renderer/store/assistants'
import Shift from '@renderer/assets/icon/base/Shift'
import { Show } from 'solid-js'

export default function (props: { type: 'chat' | 'ans' }) {
  const nav = useNavigate()
  const a = props.type === 'ans' ? getCurrentAssistantForAnswer : getCurrentAssistantForChat
  return (
    <div class={'relative ' + (props.type === 'ans' ? 'mt-4' : 'mt-8')}>
      <div class="relative m-4 flex items-center justify-center gap-2 rounded-2xl bg-dark p-4">
        <span class="select-none">{a().name}</span>
        <Show when={props.type !== 'ans'}>
          <Shift
            onClick={() => {
              nav('/assistants?type=' + props.type)
            }}
            class="cursor-pointer text-gray hover:text-active"
            height={20}
            width={20}
          />
        </Show>

        <div class="absolute bottom-1 right-2">
          <ModelSelect size={20} position="right-0" />
        </div>
      </div>
    </div>
  )
}
