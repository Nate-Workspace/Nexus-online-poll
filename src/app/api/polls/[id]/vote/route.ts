import { NextRequest, NextResponse } from 'next/server'
import { getPollById, updatePoll } from '@/lib/data-store'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const {id} = await params;
  try {
    const { optionIds }: { optionIds: string[] } = await request.json()
    
    if (!optionIds || optionIds.length === 0) {
      return NextResponse.json(
        { error: 'No options selected' },
        { status: 400 }
      )
    }
    
    const poll = getPollById(id)
    
    if (!poll) {
      return NextResponse.json(
        { error: 'Poll not found' },
        { status: 404 }
      )
    }
    
    if (poll.status !== 'active') {
      return NextResponse.json(
        { error: 'Poll is not active' },
        { status: 400 }
      )
    }
    
    // Validate option IDs
    const validOptionIds = poll.options.map(option => option.id)
    const invalidOptions = optionIds.filter(id => !validOptionIds.includes(id))
    
    if (invalidOptions.length > 0) {
      return NextResponse.json(
        { error: 'Invalid option IDs' },
        { status: 400 }
      )
    }
    
    // Check if multiple selections are allowed
    if (!poll.allowMultiple && optionIds.length > 1) {
      return NextResponse.json(
        { error: 'Multiple selections not allowed for this poll' },
        { status: 400 }
      )
    }
    
    // Create updated poll
    const updatedPoll = {
      ...poll,
      options: poll.options.map(option => ({
        ...option,
        votes: optionIds.includes(option.id) ? option.votes + 1 : option.votes
      })),
      updatedAt: new Date().toISOString()
    }
    
    // Recalculate total votes
    updatedPoll.totalVotes = updatedPoll.options.reduce((sum, option) => sum + option.votes, 0)
    
    updatePoll(id, updatedPoll)
    
    return NextResponse.json(updatedPoll)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to submit vote' },
      { status: 500 }
    )
  }
}
