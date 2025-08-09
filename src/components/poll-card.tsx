import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Calendar, BarChart3 } from 'lucide-react'
import Link from "next/link"
import { Poll } from "@/lib/types"

interface PollCardProps {
  poll: Poll
}

export function PollCard({ poll }: PollCardProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="line-clamp-2 mb-2">{poll.title}</CardTitle>
            <CardDescription className="line-clamp-3">
              {poll.description}
            </CardDescription>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-4">
          <Badge variant="secondary">{poll.category}</Badge>
          <Badge variant={poll.status === 'active' ? 'default' : 'secondary'}>
            {poll.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {poll.totalVotes}
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {new Date(poll.createdAt).toLocaleDateString()}
          </div>
        </div>

        <div className="mt-auto space-y-2">
          <Link href={`/poll/${poll.id}`} className="block">
            <Button className="w-full" variant="default">
              {poll.status === 'active' ? 'Vote Now' : 'View Results'}
            </Button>
          </Link>
          <Link href={`/results/${poll.id}`} className="block">
            <Button className="w-full gap-2" variant="outline">
              <BarChart3 className="h-4 w-4" />
              View Results
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
