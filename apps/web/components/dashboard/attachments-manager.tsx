"use client"

import { useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { FolderOpen, Plus, Trash2, X, Upload, File, FileText, ImageIcon, Music, Video, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface AttachmentsManagerProps {
  attachments: Record<string, string[]>
  onAttachmentsChange: (attachments: Record<string, string[]>) => void
  onSave: () => Promise<void>
  isSaving: boolean
}

export function AttachmentsManager({
  attachments,
  onAttachmentsChange,
  onSave,
  isSaving,
}: AttachmentsManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newPackName, setNewPackName] = useState("")
  const [dragActivePack, setDragActivePack] = useState<string | null>(null)

  const handleAddPack = () => {
    if (!newPackName) return
    if (attachments[newPackName]) {
      toast.error("Este pacote já existe")
      return
    }

    onAttachmentsChange({
      ...attachments,
      [newPackName]: [],
    })
    setNewPackName("")
    setIsDialogOpen(false)
  }

  const handleRemovePack = (packName: string) => {
    const newAttachments = { ...attachments }
    delete newAttachments[packName]
    onAttachmentsChange(newAttachments)
  }

  const handleRemoveFile = (packName: string, fileIndex: number) => {
    const newFiles = [...attachments[packName]]
    newFiles.splice(fileIndex, 1)
    onAttachmentsChange({
      ...attachments,
      [packName]: newFiles,
    })
  }

  const handleFiles = async (files: FileList, packName: string) => {
    const supabase = createClient()
    const newUrls: string[] = []
    
    const toastId = toast.loading(`Enviando ${files.length} arquivo(s) para o Supabase...`)

    try {
      for (const file of Array.from(files)) {
        // Gerar um nome de arquivo único para não sobrescrever
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2, 10)}_${Date.now()}.${fileExt}`
        const filePath = `attachments/${fileName}`
        
        // Fazer upload para o bucket 'agent-attachments' (certifique-se que ele existe no Supabase)
        const { error: uploadError } = await supabase.storage
          .from('agent-attachments')
          .upload(filePath, file)
          
        if (uploadError) {
          throw uploadError
        }
        
        // Pegar a URL pública do arquivo
        const { data: { publicUrl } } = supabase.storage
          .from('agent-attachments')
          .getPublicUrl(filePath)
          
        newUrls.push(publicUrl)
      }

      onAttachmentsChange({
        ...attachments,
        [packName]: [...(attachments[packName] || []), ...newUrls],
      })
      toast.success(`${files.length} arquivo(s) enviados com sucesso!`, { id: toastId })
    } catch (error: any) {
      console.error("Erro no upload:", error)
      toast.error(`Falha ao enviar arquivos: ${error.message}`, { id: toastId })
    }
  }

  const handleDrag = (e: React.DragEvent, packName: string) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActivePack(packName)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActivePack(null)
  }

  const handleDrop = (e: React.DragEvent, packName: string) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActivePack(null)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files, packName)
    }
  }

  const getFileIcon = (url: string) => {
    const ext = url.split('.').pop()?.toLowerCase()
    if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext || '')) return <ImageIcon className="w-4 h-4" />
    if (['mp4', 'mov', 'webm'].includes(ext || '')) return <Video className="w-4 h-4" />
    if (['mp3', 'wav', 'ogg'].includes(ext || '')) return <Music className="w-4 h-4" />
    if (['pdf', 'doc', 'docx'].includes(ext || '')) return <FileText className="w-4 h-4" />
    return <File className="w-4 h-4" />
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-bold border-primary/20 text-primary text-[10px] md:text-xs">
            {Object.keys(attachments).length} Pacotes
          </Badge>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2 w-full sm:w-auto h-8 md:h-9 text-xs">
              <Plus className="w-3.5 h-3.5" />
              Novo Pacote
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] w-[90vw] rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-base md:text-lg">Novo Pacote de Treinamento</DialogTitle>
              <DialogDescription className="text-xs">
                Categorize seus manuais para organizar o conhecimento do agente.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="packName" className="text-xs">Nome do Pacote</Label>
              <Input
                id="packName"
                placeholder="Ex: Tabela de Preços 2024"
                value={newPackName}
                onChange={(e) => setNewPackName(e.target.value)}
                className="mt-2 h-9 md:h-10 text-xs md:text-sm"
              />
            </div>
            <DialogFooter className="flex-row gap-2">
              <Button variant="ghost" className="flex-1 text-xs" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              <Button className="flex-1 text-xs" onClick={handleAddPack} disabled={!newPackName}>Criar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(attachments).map(([packName, files]) => (
          <div
            key={packName}
            className={cn(
              "rounded-xl border border-border/50 bg-background/50 overflow-hidden transition-all",
              dragActivePack === packName && "ring-2 ring-primary border-primary bg-primary/5"
            )}
            onDragOver={(e) => handleDrag(e, packName)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, packName)}
          >
            <div className="flex items-center justify-between p-3 md:p-4 bg-secondary/30 border-b border-border/50">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-3.5 h-3.5 md:w-4 md:h-4 text-muted-foreground shrink-0" />
                <span className="text-xs md:text-sm font-bold truncate">{packName}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 md:h-7 md:w-7 text-muted-foreground hover:text-destructive shrink-0"
                onClick={() => handleRemovePack(packName)}
              >
                <Trash2 className="w-3 md:w-3.5 h-3 md:h-3.5" />
              </Button>
            </div>

            <div className="p-3 md:p-4 space-y-3 md:space-y-4">
              {/* Upload Field */}
              <div
                className="border-2 border-dashed border-border/40 rounded-lg p-4 md:p-6 flex flex-col items-center justify-center gap-1.5 md:gap-2 cursor-pointer hover:bg-secondary/20 hover:border-primary/20 transition-all"
                onClick={() => document.getElementById(`file-${packName}`)?.click()}
              >
                <input
                  id={`file-${packName}`}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => e.target.files && handleFiles(e.target.files, packName)}
                />
                <Upload className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
                <span className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase">Arraste ou clique</span>
              </div>

              {/* File List */}
              <div className="space-y-1.5 md:space-y-2">
                {files.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-1.5 md:p-2 rounded-md bg-secondary/30 border border-border/40 group">
                    <div className="flex items-center gap-2 overflow-hidden min-w-0">
                      <div className="shrink-0">{getFileIcon(file)}</div>
                      <span className="text-[10px] md:text-xs truncate text-muted-foreground font-medium">
                        {file.split('/').pop()}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 opacity-50 md:opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                      onClick={() => handleRemoveFile(packName, idx)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
