import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { initialEvidence, type Evidence } from '../data/demo'

type Message = { role: 'agent' | 'user'; text: string }

type PersistedState = {
  evidence: Evidence[]
  messages: Message[]
  insightConfirmed: boolean
  selectedPath: string
  selectedMajors: string[]
  pathRatings: Record<string, number[]>
  completedTasks: string[]
  memoryName: string
  motionEnabled: boolean
}

type AppState = PersistedState & {
  notice: string
  setEvidence: (value: Evidence[] | ((current: Evidence[]) => Evidence[])) => void
  setMessages: (value: Message[] | ((current: Message[]) => Message[])) => void
  setInsightConfirmed: (value: boolean) => void
  setSelectedPath: (value: string) => void
  setSelectedMajors: (value: string[] | ((current: string[]) => string[])) => void
  setPathRatings: (value: Record<string, number[]> | ((current: Record<string, number[]>) => Record<string, number[]>)) => void
  setCompletedTasks: (value: string[] | ((current: string[]) => string[])) => void
  setMemoryName: (value: string) => void
  setMotionEnabled: (value: boolean) => void
  notify: (text: string) => void
  resetDemo: () => void
}

const defaultState: PersistedState = {
  evidence: initialEvidence,
  messages: [],
  insightConfirmed: false,
  selectedPath: 'machine',
  selectedMajors: ['ai', 'automation', 'bme'],
  pathRatings: {
    machine: [4, 3, 3, 4],
    robot: [3, 3, 3, 3],
    brain: [4, 2, 2, 4],
  },
  completedTasks: [],
  memoryName: '示例记忆 · 28 段对话',
  motionEnabled: true,
}

const STORAGE_KEY = 'wanjing-mvp-v1'
const AppContext = createContext<AppState | null>(null)

function loadState(): PersistedState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return defaultState
    return { ...defaultState, ...JSON.parse(saved) }
  } catch {
    return defaultState
  }
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(loadState)
  const [notice, setNotice] = useState('')
  const noticeTimer = useRef<number | undefined>(undefined)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  useEffect(() => {
    return () => {
      window.clearTimeout(noticeTimer.current)
    }
  }, [])

  const update = useCallback(<K extends keyof PersistedState>(key: K, value: PersistedState[K] | ((current: PersistedState[K]) => PersistedState[K])) => {
    setState((current) => ({
      ...current,
      [key]: typeof value === 'function' ? (value as (current: PersistedState[K]) => PersistedState[K])(current[key]) : value,
    }))
  }, [])

  const notify = useCallback((text: string) => {
    window.clearTimeout(noticeTimer.current)
    setNotice(text)
    noticeTimer.current = window.setTimeout(() => setNotice(''), 2600)
  }, [])

  const resetDemo = useCallback(() => {
    setState({ ...defaultState, evidence: initialEvidence.map((item) => ({ ...item })), messages: [] })
    notify('已回到最初的江面')
  }, [notify])

  const value = useMemo<AppState>(() => ({
    ...state,
    notice,
    setEvidence: (value) => update('evidence', value),
    setMessages: (value) => update('messages', value),
    setInsightConfirmed: (value) => update('insightConfirmed', value),
    setSelectedPath: (value) => update('selectedPath', value),
    setSelectedMajors: (value) => update('selectedMajors', value),
    setPathRatings: (value) => update('pathRatings', value),
    setCompletedTasks: (value) => update('completedTasks', value),
    setMemoryName: (value) => update('memoryName', value),
    setMotionEnabled: (value) => update('motionEnabled', value),
    notify,
    resetDemo,
  }), [state, notice, update, notify, resetDemo])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useAppState() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useAppState must be used inside AppStateProvider')
  return context
}
