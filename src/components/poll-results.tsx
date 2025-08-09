"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Poll } from "@/lib/types"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { BarChart3, PieChartIcon } from 'lucide-react'

interface PollResultsProps {
  poll: Poll
  showTitle?: boolean
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C', '#A28BF5', '#FF6B9D']

export function PollResults({ poll, showTitle = true }: PollResultsProps) {
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar')

  const chartData = poll.options.map((option, index) => ({
    name: option.text.length > 20 ? option.text.substring(0, 20) + '...' : option.text,
    fullName: option.text,
    votes: option.votes,
    percentage: poll.totalVotes > 0 ? (option.votes / poll.totalVotes) * 100 : 0,
    color: COLORS[index % COLORS.length]
  })).filter(option => option.votes > 0);

  console.log('Chart Data:', chartData);
  console.log('Chart Type:', chartType);
  console.log('Poll Total Votes:', poll.totalVotes);


  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage, name }: any) => {
    if (percentage < 3) return null 
    
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        {`${percentage.toFixed(1)}%`}
      </text>
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold">{data.fullName}</p>
          <p className="text-sm text-muted-foreground">
            Votes: <span className="font-medium text-foreground">{data.votes}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Percentage: <span className="font-medium text-foreground">{data.percentage.toFixed(1)}%</span>
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      {showTitle && (
        <CardHeader>
          <CardTitle>Poll Results</CardTitle>
          <CardDescription>
            Live results for {poll.title}
          </CardDescription>
        </CardHeader>
      )}
      
      <CardContent className="space-y-6">
        {/* Chart Type Toggle */}
        <div className="flex gap-2">
          <Button
            variant={chartType === 'bar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setChartType('bar')}
            className="gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Bar Chart
          </Button>
          <Button
            variant={chartType === 'pie' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setChartType('pie')}
            className="gap-2"
          >
            <PieChartIcon className="h-4 w-4" />
            Pie Chart
          </Button>
        </div>

        {/* Chart */}
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'bar' ? (
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="votes" 
                  radius={[4, 4, 0, 0]}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            ) : (
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="votes"
                  label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(value: number, name: string, props: any) => [
                    `${value} votes (${props.payload.percentage.toFixed(1)}%)`,
                    props.payload.fullName
                  ]}
                />
              </PieChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Detailed Results */}
        <div className="space-y-4">
          <h4 className="font-semibold">Detailed Results</h4>
          {poll.options.map((option, index) => {
            const percentage = poll.totalVotes > 0 ? (option.votes / poll.totalVotes) * 100 : 0
            
            return (
              <div key={option.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="font-medium">{option.text}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {option.votes} votes ({percentage.toFixed(1)}%)
                  </span>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            )
          })}
        </div>

        <div className="text-center text-sm text-muted-foreground">
          Total votes: {poll.totalVotes}
        </div>
      </CardContent>
    </Card>
  )
}
