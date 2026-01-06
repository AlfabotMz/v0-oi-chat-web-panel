"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getUserProfile, changePlan } from "@/lib/supabase/auth-actions"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Users, LogOut, Crown, HelpCircle, MessageCircle, Phone } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

interface UserProfile {
  id: string
  full_name: string
  email?: string
  plan: "free" | "pro" | "premium"
  status: "active" | "inactive"
  created_at: string
  whatsapp?: string
              </div >
            )}
          </CardContent >
        </Card >
      </main >
    </div >
  )
}
