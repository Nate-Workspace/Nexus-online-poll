"use client"

import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, BarChart3, Users, Vote } from 'lucide-react'
import Link from "next/link"
import { AppDispatch, RootState } from "@/lib/store"
import { fetchPolls } from "@/lib/features/polls/pollsSlice"
import { PollCard } from "@/components/poll-card"
import { LoadingSpinner } from "@/components/loading-spinner"

export default function HomePage() {
  const dispatch = useDispatch<AppDispatch>()
  const { polls, loading, error } = useSelector((state: RootState) => state.polls)

  useEffect(() => {
    dispatch(fetchPolls())
  }, [dispatch])

  const activePolls = polls.filter(poll => poll.status === 'active')
  const totalVotes = polls.reduce((sum, poll) => sum + poll.totalVotes, 0)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Online Poll System</h1>
        <p className="text-muted-foreground text-lg">
          Create polls, gather opinions, and visualize results in real-time
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Polls</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{polls.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Polls</CardTitle>
            <Vote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activePolls.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Votes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVotes}</div>
          </CardContent>
        </Card>
      </div>

      {/* Create Poll Button */}
      <div className="mb-8">
        <Link href="/create">
          <Button size="lg" className="gap-2">
            <Plus className="h-4 w-4" />
            Create New Poll
          </Button>
        </Link>
      </div>

      {/* Polls List */}
      <div>
        <h2 className="text-2xl font-semibold mb-6">Recent Polls</h2>
        
        {loading && (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        )}

        {error && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <p className="text-destructive">Error loading polls: {error}</p>
            </CardContent>
          </Card>
        )}

        {!loading && !error && polls.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground mb-4">No polls created yet</p>
              <Link href="/create">
                <Button>Create Your First Poll</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {polls.map((poll) => (
            <PollCard key={poll.id} poll={poll} />
          ))}
        </div>
      </div>
    </div>
  )
}
