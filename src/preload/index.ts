import { IpcRendererEvent, contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

import {
  AssistantModel,
  CollectionModel,
  CreateAssistantModel,
  CreateCollectionModel,
  HistoryModel,
  Line,
  MemoFragment,
  MemoModel,
  MemoResult,
  SettingFontFamily,
  SettingModel,
  UserDataModel
} from '../main/models/model'
import { FileLoaderRes, FilePayload } from '../main/lib/ai/fileLoader'
import { EditFragmentOption, GetMemoParams, SaveMemoParams } from '../main/lib/ai/embedding/index'
import { CallLLmOption } from '../main/lib/ai/langchain'
import { ShowWindowParams } from '../main/window'

// Custom APIs for renderer
export const api = {
  multiCopy: (callback: (event: IpcRendererEvent, msg: string) => void) => {
    ipcRenderer.on('multi-copy', callback)
    return () => {
      ipcRenderer.removeListener('multi-copy', callback)
    }
  },
  showWindow: (callback: (event: IpcRendererEvent, data: ShowWindowParams) => void) => {
    ipcRenderer.on('show-window', callback)
    return () => {
      ipcRenderer.removeListener('show-window', callback)
    }
  },
  hideWindow: () => ipcRenderer.invoke('hide-window'),
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
  unmaximizeWindow: () => ipcRenderer.invoke('unmaximize-window'),
  isMaximized: () => ipcRenderer.invoke('is-maximized'),
  setIsOnTop: (isOnTop: boolean) => ipcRenderer.invoke('set-is-on-top', isOnTop),

  // 配置相关
  loadConfig: () => ipcRenderer.invoke('load-config'),
  setConfig: () => ipcRenderer.invoke('set-config'),
  setModels: (models: SettingModel['models']) => ipcRenderer.invoke('set-models', models),
  setCanMultiCopy: (b: boolean) => ipcRenderer.invoke('set-can-multi-copy', b),
  setQuicklyWakeUpKeys: (keys: string) => ipcRenderer.invoke('set-quickly-wake-up-keys', keys),
  setSendWithCmdOrCtrl: (b: boolean) => ipcRenderer.invoke('set-send-with-cmd-or-ctrl', b),
  setTheme: (theme: string) => ipcRenderer.invoke('set-theme', theme),
  setChatFontSize: (size: number) => ipcRenderer.invoke('set-chat-fontsize', size),
  setChatFontFamily: (fontFamily: SettingFontFamily) =>
    ipcRenderer.invoke('set-font-family', fontFamily),

  // 用户信息相关
  getUserData: (): Promise<UserDataModel> => ipcRenderer.invoke('get-user-data'),
  setUserData: (userData: Partial<UserDataModel>) => ipcRenderer.invoke('set-user-data', userData),

  // assistant 相关
  getAssistants: (): Promise<AssistantModel[]> => ipcRenderer.invoke('get-assistants'),
  updateAssistant: (assistant: AssistantModel) => ipcRenderer.invoke('update-assistant', assistant),
  deleteAssistant: (assistantId: string) => ipcRenderer.invoke('delete-assistant', assistantId),
  createAssistant: (assistant: CreateAssistantModel): Promise<AssistantModel> =>
    ipcRenderer.invoke('create-assistant', assistant),
  useAssistant: (assistantId: string) => ipcRenderer.invoke('use-assistant', assistantId),

  // history 相关
  getHistories: (): Promise<HistoryModel[]> => ipcRenderer.invoke('get-histories'),
  addHistory: (history: HistoryModel) => ipcRenderer.invoke('add-history', history),
  deleteHistory: (historyId: string) => ipcRenderer.invoke('delete-history', historyId),
  setHistoryStar: (historyId: string, starred: boolean) =>
    ipcRenderer.invoke('set-history-star', historyId, starred),
  clearHistory: () => ipcRenderer.invoke('clear-history'),

  // memory 相关
  checkEmbeddingModel: (): Promise<boolean> => ipcRenderer.invoke('check-embedding-model'),
  getMemories: (): Promise<MemoModel[]> => ipcRenderer.invoke('get-memories'),
  editFragment: (
    option: EditFragmentOption
  ): Promise<{
    suc: boolean
    reason?: string
  }> => ipcRenderer.invoke('edit-fragment', option),
  saveMemory: (memo: SaveMemoParams): Promise<MemoModel> => ipcRenderer.invoke('save-memory', memo),
  cancelSaveMemory: (id: string) => ipcRenderer.invoke('cancel-save-memory', id),
  useMemory: (memoId: string) => ipcRenderer.invoke('use-memory', memoId),
  getMemoryData: (data: GetMemoParams): Promise<Array<MemoResult>> =>
    ipcRenderer.invoke('get-memory-data', data),
  deleteMemory: (memoId: string) => ipcRenderer.invoke('delete-memory', memoId),
  editMemory: (memoId: string, fragments: MemoFragment[]) =>
    ipcRenderer.invoke('edit-memory', memoId, fragments),
  initMemories: () => ipcRenderer.invoke('init-memories'),
  exportMemory: (memo: MemoModel): Promise<string> => ipcRenderer.invoke('export-memory', memo),
  importMemory: (path: string): Promise<boolean> => ipcRenderer.invoke('import-memory', path),

  // 集合相关
  getCollections: (): Promise<CollectionModel[]> => ipcRenderer.invoke('get-collections'),
  createCollection: (collection: CreateCollectionModel) =>
    ipcRenderer.invoke('create-collection', collection),
  deleteCollection: (collectionId: string) => ipcRenderer.invoke('delete-collection', collectionId),
  updateCollection: (collection: CollectionModel) =>
    ipcRenderer.invoke('update-collection', collection),

  // 文件相关
  parseFile: (files: FilePayload[]): Promise<FileLoaderRes> =>
    ipcRenderer.invoke('parse-file', files),
  openPath: (path: string) => ipcRenderer.invoke('open-path', path),
  saveFile: (fileName: string, content: string) =>
    ipcRenderer.invoke('save-file', fileName, content),
  getTokenNum: (text: string): Promise<number> => ipcRenderer.invoke('get-token-num', text),

  // 更新
  checkUpdate: (): Promise<boolean> => ipcRenderer.invoke('check-update'),
  quitForUpdate: () => ipcRenderer.invoke('quit-for-update'),
  downloadUpdate: (): Promise<string[]> => ipcRenderer.invoke('download-update'),

  // 大模型调用
  callLLM: (option: CallLLmOption): Promise<string> => ipcRenderer.invoke('call-llm', option),
  stopLLM: () => ipcRenderer.invoke('stop-llm'),

  // 其他
  getLines: (): Promise<Partial<Line>[]> => ipcRenderer.invoke('get-lines'),
  parsePageToString: (url: string): Promise<string> =>
    ipcRenderer.invoke('parse-page-to-string', url),
  speak: (content: string): Promise<Buffer> => ipcRenderer.invoke('speak', content),
  receiveMsg: (callback: (event: IpcRendererEvent, msg: string) => Promise<void>) => {
    ipcRenderer.on('post-message', callback)
    return () => {
      ipcRenderer.removeListener('post-message', callback)
    }
  },
  receiveBuf: (callback: (event: IpcRendererEvent, buf: Buffer) => Promise<void>) => {
    ipcRenderer.on('post-buf', callback)
    return () => {
      ipcRenderer.removeListener('post-buf', callback)
    }
  }
} as const

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
