"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const countries = [
    { value: "mz", label: "Moçambique", code: "+258", flag: "🇲🇿" },
    { value: "br", label: "Brasil", code: "+55", flag: "🇧🇷" },
    { value: "pt", label: "Portugal", code: "+351", flag: "🇵🇹" },
    { value: "ao", label: "Angola", code: "+244", flag: "🇦🇴" },
    { value: "za", label: "África do Sul", code: "+27", flag: "🇿🇦" },
    { value: "us", label: "EUA", code: "+1", flag: "🇺🇸" },
]

interface PhoneInputProps {
    value: string
    onChange: (value: string) => void
    disabled?: boolean
    className?: string
}

export function PhoneInput({ value, onChange, disabled, className }: PhoneInputProps) {
    const [selectedCountry, setSelectedCountry] = React.useState(countries[0])
    const [phoneNumber, setPhoneNumber] = React.useState("")

    // Initialize from value prop
    React.useEffect(() => {
        if (value) {
            // Try to find matching country code
            const country = countries.find(c => value.startsWith(c.code))
            if (country) {
                setSelectedCountry(country)
                setPhoneNumber(value.slice(country.code.length).trim())
            } else {
                // Default to MZ if no match found or empty, but keep existing number if any
                setPhoneNumber(value.replace(/^\+/, ""))
            }
        }
    }, []) // Run once on mount to set initial state from value

    const handleCountryChange = (value: string) => {
        const country = countries.find((c) => c.value === value) || countries[0]
        setSelectedCountry(country)
        triggerChange(country.code, phoneNumber)
    }

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Allow only numbers
        const input = e.target.value.replace(/\D/g, "")
        setPhoneNumber(input)
        triggerChange(selectedCountry.code, input)
    }

    const triggerChange = (code: string, number: string) => {
        onChange(`${code}${number}`)
    }

    return (
        <div className={cn("flex gap-2", className)}>
            <Select
                value={selectedCountry.value}
                onValueChange={handleCountryChange}
                disabled={disabled}
            >
                <SelectTrigger className="w-[140px] border-purple-200/30 bg-background/50">
                    <SelectValue placeholder="País" />
                </SelectTrigger>
                <SelectContent>
                    {countries.map((country) => (
                        <SelectItem key={country.value} value={country.value}>
                            <span className="flex items-center gap-2">
                                <span className="text-lg">{country.flag}</span>
                                <span className="text-muted-foreground">{country.code}</span>
                            </span>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Input
                type="tel"
                placeholder="84 123 4567"
                value={phoneNumber}
                onChange={handlePhoneChange}
                className="flex-1 border-purple-200/30 bg-background/50"
                disabled={disabled}
            />
        </div>
    )
}
