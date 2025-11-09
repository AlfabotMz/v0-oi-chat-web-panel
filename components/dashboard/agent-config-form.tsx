"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AgentConfigFormProps {
  agent: any
}

export function AgentConfigForm({ agent }: AgentConfigFormProps) {
  const router = useRouter()
  const [name, setName] = useState(agent.name)
  const [description, setDescription] = useState(agent.description || "")
  const [welcomeMessage, setWelcomeMessage] = useState(agent.welcome_message)
  const [status, setStatus] = useState(agent.status)
  const [webhookUrl, setWebhookUrl] = useState(agent.n8n_webhook_url || "")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleSave = async () => {
    setIsLoading(true)
    setMessage(null)

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("agents")
        .update({
          name,
          description,
          welcome_message: welcomeMessage,
          status,
          n8n_webhook_url: webhookUrl,
        })
        .eq("id", agent.id)

      if (error) throw error
      setMessage({ type: "success", text: "Agent updated successfully" })
      router.refresh()
    } catch (err: unknown) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to update agent",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle>Agent Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Agent Name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="welcome">Welcome Message</Label>
          <Textarea id="welcome" value={welcomeMessage} onChange={(e) => setWelcomeMessage(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="webhook">n8n Webhook URL</Label>
          <Input
            id="webhook"
            placeholder="https://n8n.example.com/webhook/..."
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">Optional: Connect to n8n for advanced automation</p>
        </div>

        {message && (
          <div
            className={`p-3 rounded-lg text-sm ${
              message.type === "success" ? "bg-green-500/10 text-green-700" : "bg-red-500/10 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <Button onClick={handleSave} disabled={isLoading} className="w-full">
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </CardContent>
    </Card>
  )
}
