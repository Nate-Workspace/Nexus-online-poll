"use client"

import { useEffect } from "react"
import { useParams } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { ArrowLeft, Share2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { AppDispatch, RootState } from "@/lib/store"
import { fetchPollById } from "@/lib/features/polls/pollsSlice"
import { LoadingSpinner } from "@/components/loading-spinner"
import { PollResults } from "@/components/poll-results"
import { toast } from "sonner"

export default function ResultsPage() {
  const params = useParams()
  const dispatch = useDispatch<AppDispatch>()
  const { currentPoll, loading, error } = useSelector((state: RootState) => state.polls)

  const pollId = params.id as string

  useEffect(() => {
    if (pollId) {
      dispatch(fetchPollById(pollId))
    }
  }, [dispatch, pollId])

  useEffect(() => {
    if (!pollId) return

    const interval = setInterval(() => {
      dispatch(fetchPollById(pollId))
    }, 3000)

    return () => clearInterval(interval)
  }, [dispatch, pollId])

  const handleShare = async () => {
    const url = window.location.href

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${currentPoll?.title} - Results`,
          text: `Check out the results for: ${currentPoll?.description}`,
          url: url,
        })
      } catch (error) {
        navigator.clipboard.writeText(url)
        toast.success("Results link copied to clipboard!")
      }
    } else {
      navigator.clipboard.writeText(url)
      toast.success("Results link copied to clipboard!")
    }
  }

  if (loading && !currentPoll) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-destructive">
          <CardContent className="pt-6 text-center">
            <p className="text-destructive mb-4">Error: {error}</p>
            <Link href="/">
              <Button>Back to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!currentPoll) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">Poll not found</p>
            <Link href="/">
              <Button>Back to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <Button variant="outline" size="sm" onClick={handleShare} className="gap-2 bg-transparent">
            <Share2 className="h-4 w-4" />
            Share Results
          </Button>
        </div>
        <h1 className="text-3xl font-bold mt-4">Poll Results</h1>
        <p className="text-muted-foreground">Real-time results update automatically</p>
      </div>

      <PollResults poll={currentPoll} />
    </div>
  )
}
