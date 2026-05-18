"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, X, Upload, Image as ImageIcon, Video, File } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Attachment {
  name: string
  urls: string[]
}

interface AttachmentsManagerProps {
  attachments: Record<string, string[]>
  onAttachmentsChange: (attachments: Record<string, string[]>) => void
  onSave?: () => void
  isSaving?: boolean
}

export function AttachmentsManager({ attachments, onAttachmentsChange, onSave, isSaving }: AttachmentsManagerProps) {
  const [newAttachmentName, setNewAttachmentName] = useState("")
  const [uploading, setUploading] = useState<string | null>(null)
  const [attachmentsList, setAttachmentsList] = useState<Attachment[]>(
    Object.entries(attachments || {}).map(([name, urls]) => ({ name, urls }))
  )

  const handleAddAttachment = () => {
    if (!newAttachmentName.trim()) return

    const newAttachment: Attachment = {
      name: newAttachmentName.trim(),
      urls: [],
    }

    const updated = [...attachmentsList, newAttachment]
    setAttachmentsList(updated)
    updateParent(updated)
    setNewAttachmentName("")
  }

  const handleRemoveAttachment = (index: number) => {
    const updated = attachmentsList.filter((_, i) => i !== index)
    setAttachmentsList(updated)
    updateParent(updated)
  }

  const handleFileUpload = async (attachmentIndex: number, file: File) => {
    const attachment = attachmentsList[attachmentIndex]
    setUploading(`${attachmentIndex}-${file.name}`)

    try {
      const supabase = createClient()

      // Verificar se o usuário está autenticado
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        throw new Error("Você precisa estar autenticado para fazer upload de arquivos. Por favor, faça login novamente.")
      }

      const fileExt = file.name.split(".").pop()
      const fileName = `${attachment.name}_${Date.now()}.${fileExt}`
      const filePath = `attachments/${fileName}`

      // Upload para Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("agent-attachments")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        })

      if (uploadError) {
        // Se o bucket não existir, criar uma mensagem de erro mais clara
        if (uploadError.message.includes("Bucket") || uploadError.message.includes("bucket")) {
          throw new Error(
            "Bucket 'agent-attachments' não encontrado. Por favor, crie o bucket no Supabase Dashboard (Storage > Buckets). Veja docs/STORAGE_SETUP.md para mais informações."
          )
        }
        // Se for erro de RLS, dar mensagem mais clara
        if (uploadError.message.includes("row-level security") || uploadError.message.includes("RLS")) {
          throw new Error(
            "Erro de permissão. Por favor, execute o script scripts/012_fix_storage_policies.sql no Supabase SQL Editor para corrigir as políticas de acesso."
          )
        }
        throw uploadError
      }

      // Obter URL pública
      const {
        data: { publicUrl },
      } = supabase.storage.from("agent-attachments").getPublicUrl(filePath)

      // Adicionar URL ao anexo
      const updated = [...attachmentsList]
      updated[attachmentIndex].urls.push(publicUrl)
      setAttachmentsList(updated)
      updateParent(updated)
    } catch (error: any) {
      console.error("Erro ao fazer upload:", error)
      alert(`Erro ao fazer upload: ${error.message}`)
    } finally {
      setUploading(null)
    }
  }

  const handleRemoveUrl = (attachmentIndex: number, urlIndex: number) => {
    const updated = [...attachmentsList]
    updated[attachmentIndex].urls.splice(urlIndex, 1)
    setAttachmentsList(updated)
    updateParent(updated)
  }

  const updateParent = (updated: Attachment[]) => {
    const attachmentsObj: Record<string, string[]> = {}
    updated.forEach((att) => {
      if (att.urls.length > 0) {
        attachmentsObj[att.name] = att.urls
      }
    })
    onAttachmentsChange(attachmentsObj)
  }

  const getFileIcon = (url: string) => {
    const ext = url.split(".").pop()?.toLowerCase()
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext || "")) {
      return <ImageIcon className="w-4 h-4" />
    }
    if (["mp4", "webm", "mov"].includes(ext || "")) {
      return <Video className="w-4 h-4" />
    }
    return <File className="w-4 h-4" />
  }
  return (
    <Card className="glass border-border/40 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
            <Plus className="w-4 h-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">Conteúdo & Anexos</CardTitle>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground/70 italic mt-1 pl-1">
          Arquivos que o agente pode enviar automaticamente durante o atendimento.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Lista de anexos */}
        <div className="space-y-3">
          {attachmentsList.map((attachment, index) => (
            <div key={index} className="bg-zinc-950/20 border border-white/5 rounded-2xl p-4 space-y-4 hover:border-primary/20 transition-colors group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center text-[10px] font-bold text-zinc-500">
                    {index + 1}
                  </div>
                  <Label className="text-xs font-bold uppercase tracking-tight text-zinc-300">{attachment.name}</Label>
                  <Badge variant="secondary" className="text-[9px] h-4 bg-zinc-800 text-zinc-400 capitalize">{attachment.urls.length} files</Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveAttachment(index)}
                  className="h-7 w-7 p-0 rounded-full hover:bg-red-500/10 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>

              {/* Upload de arquivo */}
              <div className="flex gap-2">
                <label className="flex-1 cursor-pointer group/up">
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*,video/*,application/pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileUpload(index, file)
                    }}
                    disabled={uploading !== null}
                  />
                  <div className={cn(
                    "w-full h-10 border-border/40 border-[1px] border-dashed rounded-xl flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider transition-all",
                    uploading?.startsWith(`${index}-`) ? "bg-zinc-900/50 text-zinc-500 animate-pulse" : "bg-zinc-900/20 hover:bg-primary/5 hover:border-primary/40 hover:text-primary"
                  )}>
                    <Upload className="w-3.5 h-3.5" />
                    {uploading?.startsWith(`${index}-`) ? "Subindo..." : "Anexar Arquivo"}
                  </div>
                </label>
              </div>

              {/* Lista de URLs */}
              {attachment.urls.length > 0 && (
                <div className="grid grid-cols-1 gap-2">
                  {attachment.urls.map((url, urlIndex) => (
                    <div
                      key={urlIndex}
                      className="flex items-center gap-3 p-2 bg-zinc-950/40 border border-white/5 rounded-xl text-xs hover:border-white/10 transition-colors"
                    >
                      <div className="p-2 rounded-lg bg-zinc-900">
                        {getFileIcon(url)}
                      </div>
                      <span className="flex-1 truncate text-[10px] font-medium text-zinc-400">{url.split("/").pop()}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveUrl(index, urlIndex)}
                        className="h-6 w-6 p-0 hover:bg-red-500/10 hover:text-red-500 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Adicionar novo anexo */}
        <div className="flex gap-2 bg-zinc-950/40 p-1.5 rounded-2xl border border-white/5">
          <Input
            placeholder="Novo Pack (ex: Catálogo)"
            value={newAttachmentName}
            onChange={(e) => setNewAttachmentName(e.target.value)}
            className="h-10 bg-transparent border-none focus-visible:ring-0 text-xs font-medium placeholder:text-zinc-600"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                handleAddAttachment()
              }
            }}
          />
          <Button
            onClick={handleAddAttachment}
            disabled={!newAttachmentName.trim()}
            size="sm"
            className="h-10 w-10 p-0 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
