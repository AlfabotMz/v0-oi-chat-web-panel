"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"

export function BusinessPlanDialog() {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)

        const formData = new FormData(e.currentTarget)
        const data = {
            name: formData.get("name"),
            businessName: formData.get("businessName"),
            employees: formData.get("employees"),
            budget: formData.get("budget"),
        }

        try {
            const response = await fetch("/api/business-form", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })

            if (response.ok) {
                setSubmitted(true)
            }
        } catch (error) {
            console.error("Error submitting form:", error)
        } finally {
            setIsLoading(false)
        }
    }

    if (submitted) {
        return (
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button size="lg" className="w-full" variant="outline">
                        Falar com Vendas
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Obrigado pelo interesse!</DialogTitle>
                        <DialogDescription>
                            Recebemos suas informações e nossa equipe entrará em contato em breve.
                        </DialogDescription>
                    </DialogHeader>
                    <Button onClick={() => setOpen(false)}>Fechar</Button>
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="lg" className="w-full" variant="outline">
                    Falar com Vendas
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Plano Business</DialogTitle>
                    <DialogDescription>
                        Preencha o formulário abaixo para que possamos entender melhor suas necessidades.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Seu Nome</Label>
                        <Input id="name" name="name" required placeholder="João Silva" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="businessName">Nome do Negócio</Label>
                        <Input id="businessName" name="businessName" required placeholder="Minha Empresa Ltda" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="employees">Número de Colaboradores</Label>
                        <Select name="employees" required>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1-10">1-10</SelectItem>
                                <SelectItem value="11-50">11-50</SelectItem>
                                <SelectItem value="51-200">51-200</SelectItem>
                                <SelectItem value="201+">201+</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="budget">Orçamento Mensal Estimado</Label>
                        <Select name="budget" required>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="<1k">Menos de 1.000 MT</SelectItem>
                                <SelectItem value="1k-5k">1.000 - 5.000 MT</SelectItem>
                                <SelectItem value="5k-20k">5.000 - 20.000 MT</SelectItem>
                                <SelectItem value="20k+">Mais de 20.000 MT</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Enviando...
                            </>
                        ) : (
                            "Enviar Solicitação"
                        )}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
