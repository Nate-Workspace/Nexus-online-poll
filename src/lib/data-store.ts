import { Poll } from '@/lib/types'


export const polls: Poll[] = [
  {
    id: '1',
    title: 'What is your favorite programming language?',
    description: 'Help us understand the most popular programming languages among developers.',
    options: [
      { id: '1a', text: 'JavaScript', votes: 45 },
      { id: '1b', text: 'Python', votes: 38 },
      { id: '1c', text: 'TypeScript', votes: 32 },
      { id: '1d', text: 'Java', votes: 28 },
      { id: '1e', text: 'Go', votes: 15 }
    ],
    category: 'technology',
    status: 'active',
    allowMultiple: false,
    totalVotes: 158,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Which features should we prioritize?',
    description: 'Vote for the features you would like to see implemented first in our next release.',
    options: [
      { id: '2a', text: 'Dark mode', votes: 67 },
      { id: '2b', text: 'Mobile app', votes: 54 },
      { id: '2c', text: 'API integration', votes: 43 },
      { id: '2d', text: 'Advanced analytics', votes: 39 }
    ],
    category: 'general',
    status: 'active',
    allowMultiple: true,
    totalVotes: 203,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date().toISOString()
  }
]

export const addPoll = (poll: Poll) => {
  polls.unshift(poll)
}

export const updatePoll = (pollId: string, updatedPoll: Poll) => {
  const index = polls.findIndex(p => p.id === pollId)
  if (index !== -1) {
    polls[index] = updatedPoll
  }
}

export const getPollById = (id: string) => {
  return polls.find(p => p.id === id)
}

export const getAllPolls = () => {
  return polls.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}
