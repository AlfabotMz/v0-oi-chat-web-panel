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
}

export function AttachmentsManager({ attachments, onAttachmentsChange }: AttachmentsManagerProps) {
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
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle>Anexos</CardTitle>
        <p className="text-sm text-muted-foreground">
          Adicione anexos que o agente pode enviar (imagens, vídeos, documentos)
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Lista de anexos */}
        {attachmentsList.map((attachment, index) => (
          <div key={index} className="border border-border/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label className="font-medium">{attachment.name}</Label>
                <Badge variant="secondary">{attachment.urls.length} arquivo(s)</Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveAttachment(index)}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Upload de arquivo */}
            <div className="flex gap-2">
              <label className="flex-1">
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
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled={uploading !== null}
                  asChild
                >
                  <span>
                    <Upload className="w-4 h-4 mr-2" />
                    {uploading?.startsWith(`${index}-`) ? "Enviando..." : "Adicionar Arquivo"}
                  </span>
                </Button>
              </label>
            </div>

            {/* Lista de URLs */}
            {attachment.urls.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {attachment.urls.map((url, urlIndex) => (
                  <div
                    key={urlIndex}
                    className="flex items-center gap-2 p-2 border border-border/50 rounded text-sm"
                  >
                    {getFileIcon(url)}
                    <span className="flex-1 truncate text-xs">{url.split("/").pop()}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveUrl(index, urlIndex)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Adicionar novo anexo */}
        <div className="flex gap-2">
          <Input
            placeholder="Nome do anexo (ex: Catálogo, Promoções)"
            value={newAttachmentName}
            onChange={(e) => setNewAttachmentName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                handleAddAttachment()
              }
            }}
          />
          <Button onClick={handleAddAttachment} disabled={!newAttachmentName.trim()}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
