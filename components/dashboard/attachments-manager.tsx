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
    <Card className="glass border-border/50">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <File className="w-5 h-5 text-primary" />
          <CardTitle className="text-lg">Conteúdo e Anexos</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Arquivos que o agente pode enviar automaticamente durante o atendimento.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Lista de anexos */}
        <div className="space-y-4">
          {attachmentsList.map((attachment, index) => (
            <div key={index} className="bg-secondary/10 border border-border/50 rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Label className="font-bold text-sm tracking-tight">{attachment.name}</Label>
                  <Badge variant="secondary" className="text-[10px] bg-secondary/50">{attachment.urls.length} arquivos</Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveAttachment(index)}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-red-500"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Upload de arquivo */}
              <div className="flex gap-2">
                <label className="flex-1 cursor-pointer">
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
                    "w-full h-10 border-border/50 border-[1px] border-dashed rounded-lg flex items-center justify-center gap-2 text-xs font-medium transition-all",
                    uploading?.startsWith(`${index}-`) ? "bg-secondary/30 text-muted-foreground animate-pulse" : "bg-secondary/10 hover:bg-secondary/20"
                  )}>
                    <Upload className="w-4 h-4" />
                    {uploading?.startsWith(`${index}-`) ? "Enviando..." : "Adicionar Arquivo"}
                  </div>
                </label>
              </div>

              {/* Lista de URLs */}
              {attachment.urls.length > 0 && (
                <div className="space-y-2">
                  {attachment.urls.map((url, urlIndex) => (
                    <div
                      key={urlIndex}
                      className="flex items-center gap-3 p-2 bg-background/50 border border-border/50 rounded-lg text-xs"
                    >
                      <div className="text-primary opacity-70">
                        {getFileIcon(url)}
                      </div>
                      <span className="flex-1 truncate text-xs text-muted-foreground">{url.split("/").pop()}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveUrl(index, urlIndex)}
                        className="h-7 w-7 p-0 hover:text-red-500"
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
        <div className="flex gap-2 pt-2">
          <Input
            placeholder="Nome do pack (ex: Catálogo)"
            value={newAttachmentName}
            onChange={(e) => setNewAttachmentName(e.target.value)}
            className="h-10"
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
            className="h-10 px-4"
          >
            <Plus className="w-4 h-4 mr-2" />
            Criar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
