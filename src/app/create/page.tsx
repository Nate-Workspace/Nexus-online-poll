"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useDispatch } from "react-redux"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import type { AppDispatch } from "@/lib/store"
import { createPoll } from "@/lib/features/polls/pollsSlice"
import { toast } from "sonner"

interface FormData {
  title: string
  description: string
  options: string[]
  category: string
  allowMultiple: boolean
}

interface FormErrors {
  title?: string
  description?: string
  options?: string
  category?: string
}

export default function CreatePollPage() {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    options: ["", ""],
    category: "",
    allowMultiple: false,
  })

  const [errors, setErrors] = useState<FormErrors>({})

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = "Title is required"
    } else if (formData.title.length < 3) {
      newErrors.title = "Title must be at least 3 characters"
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required"
    }

    if (!formData.category) {
      newErrors.category = "Category is required"
    }

    const validOptions = formData.options.filter((option) => option.trim())
    if (validOptions.length < 2) {
      newErrors.options = "At least 2 options are required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const addOption = () => {
    if (formData.options.length < 10) {
      setFormData((prev) => ({
        ...prev,
        options: [...prev.options, ""],
      }))
    }
  }

  const removeOption = (index: number) => {
    if (formData.options.length > 2) {
      setFormData((prev) => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index),
      }))
    }
  }

  const updateOption = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options.map((option, i) => (i === index ? value : option)),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const validOptions = formData.options.filter((option) => option.trim())

      const result = await dispatch(
        createPoll({
          title: formData.title.trim(),
          description: formData.description.trim(),
          options: validOptions,
          category: formData.category,
          allowMultiple: formData.allowMultiple,
        }),
      ).unwrap()

      toast.success("Poll created successfully!")

      // Redirect to the newly created poll
      router.push(`/poll/${result.id}`)
    } catch (error) {
      toast.error("Failed to create poll. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
        <h1 className="text-3xl font-bold">Create New Poll</h1>
        <p className="text-muted-foreground">Create a poll to gather opinions and feedback from your audience</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Poll Details</CardTitle>
          <CardDescription>Fill in the details for your new poll</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Poll Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Enter poll title"
                className={errors.title ? "border-destructive" : ""}
              />
              {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your poll"
                rows={3}
                className={errors.description ? "border-destructive" : ""}
              />
              {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
              >
                <SelectTrigger className={errors.category ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="entertainment">Entertainment</SelectItem>
                  <SelectItem value="sports">Sports</SelectItem>
                  <SelectItem value="politics">Politics</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Poll Options *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addOption}
                  disabled={formData.options.length >= 10}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Option
                </Button>
              </div>

              <div className="space-y-3">
                {formData.options.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      className="flex-1"
                    />
                    {formData.options.length > 2 && (
                      <Button type="button" variant="outline" size="icon" onClick={() => removeOption(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {errors.options && <p className="text-sm text-destructive">{errors.options}</p>}
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Creating..." : "Create Poll"}
              </Button>
              <Link href="/">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
