"use client"

import React, { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

interface PromptEditorProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    className?: string
}

const AVAILABLE_FUNCTIONS = [
    { label: "send_conversation", value: "$send_conversation", description: "Envia a conversa para o humano" },
]

export function PromptEditor({ value, onChange, placeholder, className }: PromptEditorProps) {
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
                updateCursorPosition(e.target, cursorIndex)
                return
            }
        }

        setShowAutocomplete(false)
    }

    const updateCursorPosition = (element: HTMLTextAreaElement, index: number) => {
        // This is a simplified estimation. For production, use a library like 'textarea-caret'
        // For now, we'll just position it near the cursor roughly or at the bottom of the textarea if simple
        // A better approach without libraries is hard, so we might just show it at the bottom left of the current line or fixed

        // Let's try to get coordinates using a mirror div approach if needed, but for now fixed relative might be enough
        // or just use a library if available. Since we can't add libs, we'll use a simple approximation
        // or just display it below the textarea for now to be safe.

        // Actually, let's try to be a bit smarter. We can use the selection coordinates if supported, 
        // but standard textarea doesn't give pixel coordinates easily.
        // We will position the autocomplete menu absolutely relative to the container.
        // For this MVP, let's center it or place it at the bottom of the editor.

        // Refined plan: Just show it below the text area or floating near the top-left if we can't get precise coords.
        // But user asked for "preview das funcoes", so a popup is expected.
        // Let's stick to a fixed position near the cursor if possible, or just bottom-start.
    }

    // Highlighting logic
    const renderHighlightedText = (text: string) => {
        // Escape HTML to prevent XSS in the pre tag (though React handles children safely usually, we are using dangerouslySetInnerHTML? No, we map)
        // We need to split the text and wrap parts.

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

    const insertFunction = (funcValue: string) => {
        if (!textareaRef.current) return

        const cursorIndex = textareaRef.current.selectionStart
        const textBefore = value.slice(0, cursorIndex)
        const textAfter = value.slice(cursorIndex)

        // Find the last slash to replace
        const lastSlashIndex = textBefore.lastIndexOf("/")
        if (lastSlashIndex !== -1) {
            const newText = value.slice(0, lastSlashIndex) + funcValue + textAfter
            onChange(newText)
            setShowAutocomplete(false)

            // Restore focus and cursor
            setTimeout(() => {
                if (textareaRef.current) {
                    textareaRef.current.focus()
                    const newCursorPos = lastSlashIndex + funcValue.length
                    textareaRef.current.setSelectionRange(newCursorPos, newCursorPos)
                }
            }, 0)
        }
    }

    return (
        <div className={cn("relative font-mono text-sm", className)}>
            <div className="relative min-h-[150px] w-full border rounded-md bg-zinc-950 overflow-hidden focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                {/* Backdrop for highlighting */}
                <div
                    ref={backdropRef}
                    className="absolute inset-0 p-3 whitespace-pre-wrap break-words pointer-events-none text-transparent bg-transparent overflow-auto"
                    aria-hidden="true"
                >
                    {/* We render the text transparently here just to match size, 
                but actually we want the HIGHLIGHTED text to be visible and the textarea text to be transparent? 
                Usually yes: Textarea transparent color, caret visible. Background visible.
            */}
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
                    style={{ color: "transparent" }} // Make text transparent so backdrop shows through
                />

                {/* We need a way to show the text color from backdrop. 
            The backdrop text must be visible, textarea text transparent.
            But wait, if textarea text is transparent, the caret is visible? Yes usually.
            The problem is selection highlight. 
            
            Let's try a different approach: 
            Backdrop has the colors. Textarea is on top, transparent text, transparent background.
            The backdrop text color is what we see.
        */}
            </div>

            {/* Autocomplete Popup */}
            {showAutocomplete && (
                <div className="absolute z-50 mt-1 w-64 bg-zinc-900 border border-zinc-800 rounded-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-2 border-b border-zinc-800 bg-zinc-900/50">
                        <p className="text-xs font-medium text-zinc-400">Funções Disponíveis</p>
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                        {AVAILABLE_FUNCTIONS.map((func) => (
                            <button
                                key={func.value}
                                onClick={() => insertFunction(func.value)}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-purple-500/20 hover:text-purple-300 transition-colors flex flex-col gap-0.5"
                            >
                                <span className="font-bold text-blue-400">{func.value}</span>
                                <span className="text-xs text-zinc-500">{func.description}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="mt-2 text-xs text-zinc-500 flex gap-4">
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                    <span>$funções</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                    <span>{`{{variáveis}}`}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="bg-zinc-800 px-1 rounded text-[10px] border border-zinc-700">/</span>
                    <span>para autocompletar</span>
                </div>
            </div>
        </div>
    )
}
