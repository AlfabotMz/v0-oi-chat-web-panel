"use client"

import { useEffect } from "react"

export function PWARegistration() {
    useEffect(() => {
        // Permitir Service Worker no localhost ou via https.
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        if ("serviceWorker" in navigator && (window.location.protocol === "https:" || isLocalhost)) {
            window.addEventListener("load", () => {
                navigator.serviceWorker
                    .register("/sw.js")
                    .then((registration) => {
                        console.log("SW registered: ", registration)
                    })
                    .catch((registrationError) => {
                        console.log("SW registration failed: ", registrationError)
                    })
            })
        }
    }, [])

    return null
}
