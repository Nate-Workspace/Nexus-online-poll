import { NextRequest, NextResponse } from 'next/server'
import { getPollById } from '@/lib/data-store'
import { Poll } from '@/lib/types'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string }}
) {
  const {id} = params;
  try {
    console.log(`Fetching poll with ID: ${id}`)
    const poll : Poll | undefined= getPollById(id? id:'')
    
    if (!poll) {
      return NextResponse.json(
        { error: 'Poll not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(poll)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch poll' },
      { status: 500 }
    )
  }
}
