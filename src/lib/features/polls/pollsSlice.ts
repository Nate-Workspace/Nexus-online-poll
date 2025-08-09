import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import type { Poll, CreatePollData, VoteData } from "@/lib/types"

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
export const fetchPolls = createAsyncThunk("polls/fetchPolls", async () => {
  const response = await fetch("/api/polls")
  if (!response.ok) {
    throw new Error("Failed to fetch polls")
  }
  return response.json()
})

export const fetchPollById = createAsyncThunk("polls/fetchPollById", async (id: string) => {
  const response = await fetch(`/api/polls/${id}`)
  if (!response.ok) {
    throw new Error("Failed to fetch poll")
  }
  return response.json()
})

export const createPoll = createAsyncThunk("polls/createPoll", async (pollData: CreatePollData) => {
  const response = await fetch("/api/polls", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(pollData),
  })
  if (!response.ok) {
    throw new Error("Failed to create poll")
  }
  return response.json()
})

export const submitVote = createAsyncThunk("polls/submitVote", async (voteData: VoteData) => {
  const response = await fetch(`/api/polls/${voteData.pollId}/vote`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ optionIds: voteData.optionIds }),
  })
  if (!response.ok) {
    throw new Error("Failed to submit vote")
  }
  return response.json()
})

const pollsSlice = createSlice({
  name: "polls",
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
        state.error = null
      })
      .addCase(fetchPolls.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to fetch polls"
        // Don't clear existing polls on error
      })

      // Fetch poll by ID
      .addCase(fetchPollById.pending, (state) => {
        // Only show loading if we don't have the current poll
        if (!state.currentPoll) {
          state.loading = true
        }
        state.error = null
      })
      .addCase(fetchPollById.fulfilled, (state, action) => {
        state.loading = false
        state.currentPoll = action.payload
        state.error = null

        // Update the poll in the polls array if it exists
        const index = state.polls.findIndex((poll) => poll.id === action.payload.id)
        if (index !== -1) {
          state.polls[index] = action.payload
        } else {
          // Add the poll if it doesn't exist in the array
          state.polls.unshift(action.payload)
        }
      })
      .addCase(fetchPollById.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to fetch poll"
        // DON'T clear currentPoll on error - keep the existing data
        // state.currentPoll = null // <- This was causing the issue!
      })

      // Create poll
      .addCase(createPoll.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createPoll.fulfilled, (state, action) => {
        state.loading = false
        state.polls.unshift(action.payload)
        state.error = null
      })
      .addCase(createPoll.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to create poll"
      })

      // Submit vote
      .addCase(submitVote.pending, (state) => {
        state.error = null
        // Don't set loading to true for voting to avoid UI flicker
      })
      .addCase(submitVote.fulfilled, (state, action) => {
        state.error = null

        // Update current poll
        if (state.currentPoll && state.currentPoll.id === action.payload.id) {
          state.currentPoll = action.payload
        }

        // Update poll in polls array
        const index = state.polls.findIndex((poll) => poll.id === action.payload.id)
        if (index !== -1) {
          state.polls[index] = action.payload
        }
      })
      .addCase(submitVote.rejected, (state, action) => {
        state.error = action.error.message || "Failed to submit vote"
        // Don't clear any poll data on vote error
      })
  },
})

export const { clearError, clearCurrentPoll } = pollsSlice.actions
export default pollsSlice.reducer
