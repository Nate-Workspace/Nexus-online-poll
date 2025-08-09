import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { Poll, CreatePollData, VoteData } from '@/lib/types'

interface PollsState {
  polls: Poll[]
  currentPoll: Poll | null
  loading: boolean
  error: string | null
}

const initialState: PollsState = {
  polls: [],
  currentPoll: null,
  loading: false,
  error: null,
}

// Async thunks
export const fetchPolls = createAsyncThunk(
  'polls/fetchPolls',
  async () => {
    const response = await fetch('/api/polls')
    if (!response.ok) {
      throw new Error('Failed to fetch polls')
    }
    return response.json()
  }
)

export const fetchPollById = createAsyncThunk(
  'polls/fetchPollById',
  async (id: string) => {
    const response = await fetch(`/api/polls/${id}`)
    if (!response.ok) {
      throw new Error('Failed to fetch poll')
    }
    return response.json()
  }
)

export const createPoll = createAsyncThunk(
  'polls/createPoll',
  async (pollData: CreatePollData) => {
    const response = await fetch('/api/polls', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pollData),
    })
    if (!response.ok) {
      throw new Error('Failed to create poll')
    }
    return response.json()
  }
)

export const submitVote = createAsyncThunk(
  'polls/submitVote',
  async (voteData: VoteData) => {
    const response = await fetch(`/api/polls/${voteData.pollId}/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ optionIds: voteData.optionIds }),
    })
    if (!response.ok) {
      throw new Error('Failed to submit vote')
    }
    return response.json()
  }
)

const pollsSlice = createSlice({
  name: 'polls',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearCurrentPoll: (state) => {
      state.currentPoll = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch polls
      .addCase(fetchPolls.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPolls.fulfilled, (state, action) => {
        state.loading = false
        state.polls = action.payload
      })
      .addCase(fetchPolls.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch polls'
      })
      
      // Fetch poll by ID
      .addCase(fetchPollById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPollById.fulfilled, (state, action) => {
        state.loading = false
        state.currentPoll = action.payload
        
        // Update the poll in the polls array if it exists
        const index = state.polls.findIndex(poll => poll.id === action.payload.id)
        if (index !== -1) {
          state.polls[index] = action.payload
        }
      })
      .addCase(fetchPollById.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch poll'
      })
      
      // Create poll
      .addCase(createPoll.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createPoll.fulfilled, (state, action) => {
        state.loading = false
        state.polls.unshift(action.payload)
      })
      .addCase(createPoll.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to create poll'
      })
      
      // Submit vote
      .addCase(submitVote.pending, (state) => {
        state.error = null
      })
      .addCase(submitVote.fulfilled, (state, action) => {
        // Update current poll
        if (state.currentPoll && state.currentPoll.id === action.payload.id) {
          state.currentPoll = action.payload
        }
        
        // Update poll in polls array
        const index = state.polls.findIndex(poll => poll.id === action.payload.id)
        if (index !== -1) {
          state.polls[index] = action.payload
        }
      })
      .addCase(submitVote.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to submit vote'
      })
  },
})

export const { clearError, clearCurrentPoll } = pollsSlice.actions
export default pollsSlice.reducer
