import CrossMark from '@renderer/assets/icon/base/CrossMark'
import Plus from '@renderer/assets/icon/base/Plus'
import BaseFileIcon from '@renderer/assets/icon/file/baseFileIcon'
import DoubleConfirm from '@renderer/components/ui/DoubleConfirm'
import { useLoading } from '@renderer/components/ui/DynamicLoading'
import QuestionMention from '@renderer/components/ui/QuestionMention'
import Switch from '@renderer/components/ui/SwitchItem'
import { useToast } from '@renderer/components/ui/Toast'
import { userData } from '@renderer/store/user'
import { cloneDeep } from 'lodash'
import { For, createSignal } from 'solid-js'
import { MemoModel } from 'src/main/models/model'

export default function (props: {
  memo: MemoModel
  onCancel: () => void
  onSave: (m: MemoModel) => void
}) {
  // eslint-disable-next-line solid/reactivity
  const [m, setM] = createSignal(props.memo)
  const [useLLM, setUseLLM] = createSignal(true)
  const load = useLoading()
  const toast = useToast()
  function setField(key: keyof MemoModel, value: unknown) {
    setM({
      ...m(),
      [key]: value
    })
  }
  return (
    <div class="relative mx-2 my-4 flex flex-col gap-2 rounded-2xl  bg-dark p-4 duration-150">
      <span>记忆名称</span>
      <input
        type="text"
        class="w-full"
        value={m().name}
        onChange={(e) => setField('name', e.currentTarget.value)}
        placeholder="记忆胶囊名称"
      />
      <span>介绍</span>
      <input
        type="text"
        value={m().introduce ?? ''}
        onChange={(e) => setField('introduce', e.currentTarget.value)}
        placeholder="可不填"
      />
      <div class="my-1 mb-3">
        <div class="mb-2 flex items-center justify-between">
          <span class="flex items-center gap-1">
            记忆片段（支持Md
            <QuestionMention
              content={
                <span class="text-xs">
                  <a
                    class="text-xs"
                    href="https://gomoon.top/guide/%E5%BF%AB%E9%80%9F%E4%BD%BF%E7%94%A8%E8%AE%B0%E5%BF%86%E8%83%B6%E5%9B%8A"
                  >
                    将其他格式文件转为markdown文件
                  </a>
                </span>
              }
            />
            ）
          </span>
          <div>
            <Switch
              size="sm"
              label={
                <span class="text-xs">
                  大模型优化
                  <span class="text-xs text-gray"> (当前模型: {userData.selectedModel})</span>
                </span>
              }
              checked={useLLM()}
              onCheckedChange={() => {
                setUseLLM(!useLLM())
              }}
            />
          </div>
        </div>
        <For each={m().fragment}>
          {(file) => (
            <div class="mt-2 flex select-none justify-between">
              <div class="flex gap-1">
                <BaseFileIcon height={20} width={20} />
                {file.name}
              </div>
              <DoubleConfirm
                label="确认删除"
                position="-right-2 top-3"
                // eslint-disable-next-line solid/reactivity
                onConfirm={async () => {
                  const res = await window.api.editFragment({
                    id: m().id,
                    fragment: cloneDeep(file),
                    type: 'remove'
                  })
                  if (res.suc) {
                    setField(
                      'fragment',
                      m().fragment.filter((f) => f.name !== file.name)
                    )
                  }
                }}
              >
                <CrossMark class="cursor-pointer hover:text-active" height={20} width={20} />
              </DoubleConfirm>
            </div>
          )}
        </For>

        <label for="file" class="cursor-pointer">
          <div class="group/add mt-2 flex w-full cursor-pointer items-center justify-center gap-1 rounded-md border-dashed border-gray py-1 hover:border-active">
            <span class="text-base">添加</span>
            <Plus
              class="text-gray duration-100 group-hover/add:text-active"
              height={20}
              width={20}
            />
          </div>
          <input
            id="file"
            type="file"
            class="hidden"
            accept=".md"
            multiple={true}
            onChange={async (e) => {
              const files = e.target.files
              if (files?.length) {
                load.show('解析文件中')
                let i = 0
                const remove = window.api.receiveMsg(async (_, msg: string) => {
                  if (msg.includes('progress')) {
                    const progress = msg.replace(/^progress /, '')
                    load.show(`第${i + 1}个文件: ` + progress)
                  }
                })
                try {
                  for (i = 0; i < files.length; i++) {
                    const file = files[i]
                    console.log(file)
                    const res = await window.api.editFragment({
                      id: m().id,
                      fragment: {
                        name: file.name,
                        from: file.path,
                        type: file.name.split('.').pop() as 'md' | 'xlsx'
                      },
                      type: 'add',
                      useLLM: useLLM()
                    })
                    if (!res.suc) {
                      toast.error(res.reason || '解析失败')
                    } else {
                      setField('fragment', [
                        ...m().fragment,
                        {
                          type: file.name.split('.').pop() as 'md' | 'xlsx',
                          name: file.name
                        }
                      ])
                    }
                  }
                } catch (error: unknown) {
                  toast.error((error as Error | undefined)?.message || '解析失败')
                } finally {
                  remove()
                }
                load.hide()
              }
              e.target.value = ''
            }}
          />
        </label>
      </div>
      <div class="flex justify-around">
        <button
          class="duration-300 hover:bg-active"
          onClick={() => {
            props.onCancel()
          }}
        >
          取消
        </button>
        <button
          class="duration-300 hover:bg-active"
          onClick={() => {
            props.onSave(m())
          }}
        >
          保存
        </button>
      </div>
    </div>
  )
}
