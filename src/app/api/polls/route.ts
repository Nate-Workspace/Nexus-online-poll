import { NextRequest, NextResponse } from 'next/server'
import { CreatePollData } from '@/lib/types'
import { addPoll } from '@/lib/data-store'

export async function POST(request: NextRequest) {
  try {
    const data: CreatePollData = await request.json()
    
 
    if (!data.title || !data.description || !data.options || !data.category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    if (data.options.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 options are required' },
        { status: 400 }
      )
    }
    

    const newPoll = {
      id: Date.now().toString(),
      title: data.title,
      description: data.description,
      options: data.options.map((option, index) => ({
        id: `${Date.now()}-${index}`,
        text: option,
        votes: 0
      })),
      category: data.category,
      status: 'active' as const,
      allowMultiple: data.allowMultiple,
      totalVotes: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    addPoll(newPoll)
    
    return NextResponse.json(newPoll, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create poll' },
      { status: 500 }
    )
  }
}