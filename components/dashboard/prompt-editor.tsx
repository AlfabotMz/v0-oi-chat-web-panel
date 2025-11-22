"use client"

import React, { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

interface PromptEditorProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    className?: string
    variables?: { label: string; value: string; description: string }[]
    functions?: { label: string; value: string; description: string }[]
    mode?: "full" | "variables-only"
}

const DEFAULT_FUNCTIONS = [
    { label: "send_conversation", value: "$send_conversation", description: "Envia a conversa para o humano" },
]

export function PromptEditor({
    value,
    onChange,
    placeholder,
    className,
    variables = [],
    functions = DEFAULT_FUNCTIONS,
    mode = "full"
}: PromptEditorProps) {
    const [showAutocomplete, setShowAutocomplete] = useState(false)
    const [cursorPosition, setCursorPosition] = useState({ top: 0, left: 0 })
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const backdropRef = useRef<HTMLDivElement>(null)

    // Sync scroll between textarea and backdrop
    const handleScroll = () => {
        if (textareaRef.current && backdropRef.current) {
            backdropRef.current.scrollTop = textareaRef.current.scrollTop
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value
        onChange(newValue)

        // Check for autocomplete trigger
        const cursorIndex = e.target.selectionStart
        const textBeforeCursor = newValue.slice(0, cursorIndex)
        const lastSlashIndex = textBeforeCursor.lastIndexOf("/")

        // Simple check: if the last character typed is "/" or we are typing after "/"
        if (lastSlashIndex !== -1 && cursorIndex - lastSlashIndex <= 20) { // Limit search range
            // Check if it's a valid command start (e.g. at start of line or preceded by space)
            const charBeforeSlash = lastSlashIndex > 0 ? newValue[lastSlashIndex - 1] : " "
            if (/\s/.test(charBeforeSlash)) {
                setShowAutocomplete(true)
                return
            }
        }

        setShowAutocomplete(false)
    }

    // Highlighting logic
    const renderHighlightedText = (text: string) => {
        // Regex for features:
        // 1. $function_name (starts with $)
        // 2. {{variable}}

        const parts = text.split(/(\$[a-zA-Z0-9_]+|\{\{[^}]+\}\})/g)

        return parts.map((part, index) => {
            if (part.startsWith("$")) {
                return <span key={index} className="text-blue-400 font-bold">{part}</span>
            }
            if (part.startsWith("{{") && part.endsWith("}}")) {
                return <span key={index} className="text-green-400 font-bold">{part}</span>
            }
            return <span key={index}>{part}</span>
        })
    }

    const insertItem = (itemValue: string) => {
        if (!textareaRef.current) return

        const cursorIndex = textareaRef.current.selectionStart
        const textBefore = value.slice(0, cursorIndex)
        const textAfter = value.slice(cursorIndex)

        // Find the last slash to replace
        const lastSlashIndex = textBefore.lastIndexOf("/")
        if (lastSlashIndex !== -1) {
            const newText = value.slice(0, lastSlashIndex) + itemValue + textAfter
            onChange(newText)
            setShowAutocomplete(false)

            // Restore focus and cursor
            setTimeout(() => {
                if (textareaRef.current) {
                    textareaRef.current.focus()
                    const newCursorPos = lastSlashIndex + itemValue.length
                    textareaRef.current.setSelectionRange(newCursorPos, newCursorPos)
                }
            }, 0)
        }
    }

    const availableItems = [
        ...(mode === "full" ? functions : []),
        ...variables
    ]

    return (
        <div className={cn("relative font-mono text-sm", className)}>
            <div className="relative min-h-[150px] w-full border rounded-md bg-zinc-950 overflow-hidden focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                {/* Backdrop for highlighting */}
                <div
                    ref={backdropRef}
                    className="absolute inset-0 p-3 whitespace-pre-wrap break-words pointer-events-none text-zinc-100 bg-transparent overflow-auto"
                    aria-hidden="true"
                >
                    {renderHighlightedText(value)}
                </div>

                {/* Actual Textarea */}
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={handleChange}
                    onScroll={handleScroll}
                    placeholder={placeholder}
                    className="absolute inset-0 w-full h-full p-3 bg-transparent text-transparent caret-white resize-none focus:outline-none z-10 selection:bg-purple-500/30"
                    spellCheck={false}
                    style={{ color: "transparent" }}
                />
            </div>

            {/* Autocomplete Popup */}
            {showAutocomplete && availableItems.length > 0 && (
                <div className="absolute z-50 mt-1 w-64 bg-zinc-900 border border-zinc-800 rounded-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-2 border-b border-zinc-800 bg-zinc-900/50">
                        <p className="text-xs font-medium text-zinc-400">Opções Disponíveis</p>
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                        {availableItems.map((item) => (
                            <button
                                key={item.value}
                                onClick={() => insertItem(item.value)}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-purple-500/20 hover:text-purple-300 transition-colors flex flex-col gap-0.5"
                            >
                                <span className={cn("font-bold", item.value.startsWith("$") ? "text-blue-400" : "text-green-400")}>
                                    {item.value}
                                </span>
                                <span className="text-xs text-zinc-500">{item.description}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="mt-2 text-xs text-zinc-500 flex gap-4">
                {mode === "full" && (
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                        <span>$funções</span>
                    </div>
                )}
                {(mode === "variables-only" || variables.length > 0) && (
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-green-400"></div>
                        <span>{`{{variáveis}}`}</span>
                    </div>
                )}
                <div className="flex items-center gap-1.5">
                    <span className="bg-zinc-800 px-1 rounded text-[10px] border border-zinc-700">/</span>
                    <span>para autocompletar</span>
                </div>
            </div>
        </div>
    )
}
