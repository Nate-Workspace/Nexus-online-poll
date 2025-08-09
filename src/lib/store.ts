import { configureStore } from '@reduxjs/toolkit'
import pollsReducer from './features/polls/pollsSlice'

export const store = configureStore({
  reducer: {
    polls: pollsReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
