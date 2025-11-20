"use client"
                        </div >
    <CardDescription>
        Para assuntos administrativos ou parcerias, envie-nos um email.
    </CardDescription>
                    </CardHeader >
    <CardContent>
        <Button
            variant="outline"
            className="w-full gap-2"
            onClick={() => window.location.href = "mailto:suporte@oichat.com"}
        >
            <Mail className="h-4 w-4" />
            Enviar Email
        </Button>
    </CardContent>
                </Card >

    {/* FAQ / Docs */ }
    < Card >
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <ExternalLink className="h-6 w-6 text-orange-600" />
                            <CardTitle>Documentação</CardTitle>
                        </div>
                        <CardDescription>
                            Acesse nossos tutoriais e guias passo a passo para aproveitar ao máximo.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            variant="outline"
                            className="w-full gap-2"
                            onClick={() => window.open("#", "_blank")}
                        >
                            <ExternalLink className="h-4 w-4" />
                            Ver Tutoriais
                        </Button>
                    </CardContent>
                </Card >
            </div >
        </div >
    )
}
