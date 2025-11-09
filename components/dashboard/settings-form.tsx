"use client"

import { useState } from "react"
import type { User } from "@supabase/supabase-js"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

interface SettingsFormProps {
  user: User
  profile: any
}

export function SettingsForm({ user, profile }: SettingsFormProps) {
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  return (
    <div className="space-y-6">
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <div className="flex items-center gap-2">
              <Input disabled value={user.email || ""} />
              <Badge variant={user.email_confirmed_at ? "default" : "secondary"}>
                {user.email_confirmed_at ? "Verified" : "Pending"}
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Account Created</Label>
            <Input disabled value={new Date(user.created_at || "").toLocaleDateString()} />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>API Access</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Use these credentials to integrate OiChat with your applications.
          </p>
          <div className="space-y-2">
            <Label>User ID</Label>
            <Input disabled value={user.id} className="font-mono text-xs" />
          </div>
          <Button variant="outline">Generate API Key</Button>
        </CardContent>
      </Card>

      {message && (
        <div
          className={`p-4 rounded-lg text-sm ${
            message.type === "success" ? "bg-green-500/10 text-green-700" : "bg-red-500/10 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  )
}
