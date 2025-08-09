"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Users, Calendar, Share2, RefreshCw } from "lucide-react"
import Link from "next/link"
import type { AppDispatch, RootState } from "@/lib/store"
import { fetchPollById, submitVote, clearError } from "@/lib/features/polls/pollsSlice"
import { LoadingSpinner } from "@/components/loading-spinner"
import { PollResults } from "@/components/poll-results"
import { toast } from "sonner"

export default function PollPage() {
  const params = useParams()
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const { currentPoll, loading, error } = useSelector((state: RootState) => state.polls)

  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [hasVoted, setHasVoted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const pollId = params.id as string

  useEffect(() => {
    if (pollId) {
      dispatch(fetchPollById(pollId))

      // Check if user has already voted (using localStorage for demo)
      const votedPolls = JSON.parse(localStorage.getItem("votedPolls") || "[]")
      setHasVoted(votedPolls.includes(pollId))
    }
  }, [dispatch, pollId])

  // Real-time updates every 5 seconds, but only if poll exists and no error
  useEffect(() => {
    if (!pollId || hasVoted || !currentPoll || error) return

    const interval = setInterval(() => {
      dispatch(fetchPollById(pollId))
    }, 5000)

    return () => clearInterval(interval)
  }, [dispatch, pollId, hasVoted, currentPoll, error])

  const handleOptionChange = (optionId: string, checked: boolean) => {
    if (!currentPoll) return

    if (currentPoll.allowMultiple) {
      setSelectedOptions((prev) => (checked ? [...prev, optionId] : prev.filter((id) => id !== optionId)))
    } else {
      setSelectedOptions(checked ? [optionId] : [])
    }
  }

  const handleSubmitVote = async () => {
    if (!currentPoll || selectedOptions.length === 0) return

    setSubmitting(true)

    try {
      await dispatch(
        submitVote({
          pollId: currentPoll.id,
          optionIds: selectedOptions,
        }),
      ).unwrap()

      // Mark as voted in localStorage
      const votedPolls = JSON.parse(localStorage.getItem("votedPolls") || "[]")
      votedPolls.push(pollId)
      localStorage.setItem("votedPolls", JSON.stringify(votedPolls))

      setHasVoted(true)
      toast.success("Thank you for participating in this poll!")
    } catch (error) {
      toast.error("Failed to submit vote. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleShare = async () => {
    const url = window.location.href

    if (navigator.share) {
      try {
        await navigator.share({
          title: currentPoll?.title,
          text: currentPoll?.description,
          url: url,
        })
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(url)
        toast.success("Poll link copied to clipboard!")
      }
    } else {
      navigator.clipboard.writeText(url)
      toast.success("Poll link copied to clipboard!")
    }
  }

  const handleRetry = () => {
    dispatch(clearError())
    dispatch(fetchPollById(pollId))
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

  if (error && !currentPoll) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-destructive">
          <CardContent className="pt-6 text-center">
            <p className="text-destructive mb-4">Error: {error}</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={handleRetry} variant="outline" className="gap-2 bg-transparent">
                <RefreshCw className="h-4 w-4" />
                Retry
              </Button>
              <Link href="/">
                <Button>Back to Home</Button>
              </Link>
            </div>
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
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        {/* Show error banner if there's an error but we still have poll data */}
        {error && currentPoll && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-center justify-between">
              <p className="text-sm text-destructive">Connection issue: {error}</p>
              <Button onClick={handleRetry} variant="outline" size="sm" className="gap-2 bg-transparent">
                <RefreshCw className="h-4 w-4" />
                Retry
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Poll Details and Voting */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-2">{currentPoll.title}</CardTitle>
                  <CardDescription className="text-base">{currentPoll.description}</CardDescription>
                </div>
                <Button variant="outline" size="icon" onClick={handleShare}>
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                <Badge variant="secondary">{currentPoll.category}</Badge>
                <Badge variant={currentPoll.status === "active" ? "default" : "secondary"}>{currentPoll.status}</Badge>
                {currentPoll.allowMultiple && <Badge variant="outline">Multiple Choice</Badge>}
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-4">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {currentPoll.totalVotes} votes
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(currentPoll.createdAt).toLocaleDateString()}
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {!hasVoted && currentPoll.status === "active" ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-4">
                      {currentPoll.allowMultiple ? "Select all that apply:" : "Choose one option:"}
                    </h3>

                    {currentPoll.allowMultiple ? (
                      <div className="space-y-3">
                        {currentPoll.options.map((option) => (
                          <div key={option.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={option.id}
                              checked={selectedOptions.includes(option.id)}
                              onCheckedChange={(checked) => handleOptionChange(option.id, checked as boolean)}
                            />
                            <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                              {option.text}
                            </Label>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <RadioGroup
                        value={selectedOptions[0] || ""}
                        onValueChange={(value) => setSelectedOptions([value])}
                      >
                        {currentPoll.options.map((option) => (
                          <div key={option.id} className="flex items-center space-x-2">
                            <RadioGroupItem value={option.id} id={option.id} />
                            <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                              {option.text}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    )}
                  </div>

                  <Button
                    onClick={handleSubmitVote}
                    disabled={selectedOptions.length === 0 || submitting}
                    className="w-full"
                  >
                    {submitting ? "Submitting..." : "Submit Vote"}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4">
                  {hasVoted ? (
                    <p className="text-muted-foreground">Thank you for voting! View the results below.</p>
                  ) : (
                    <p className="text-muted-foreground">This poll is no longer active.</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <div>
          <PollResults poll={currentPoll} showTitle={false} />
        </div>
      </div>
    </div>
  )
}
