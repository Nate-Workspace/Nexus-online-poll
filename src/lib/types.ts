export interface PollOption {
  id: string
  text: string
  votes: number
}

export interface Poll {
  id: string
  title: string
  description: string
  options: PollOption[]
  category: string
  status: 'active' | 'closed'
  allowMultiple: boolean
  totalVotes: number
  createdAt: string
  updatedAt: string
}

export interface CreatePollData {
  title: string
  description: string
  options: string[]
  category: string
  allowMultiple: boolean
}

export interface VoteData {
  pollId: string
  optionIds: string[]
}
