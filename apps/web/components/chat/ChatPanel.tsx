'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useSocket } from '@/components/providers/socket-provider'
import { useSession } from 'next-auth/react'
import { CryptoService } from '@/lib/crypto-service'
import { offlineDB } from '@/lib/offline-db'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Lock, Send, WifiOff, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Message {
    id: string
    content: string
    senderId: string
    sentAt: string
    isEncrypted: boolean
    sender: {
        id: string
        name: string | null
        avatarUrl: string | null
    }
}

interface ChatPanelProps {
    jobId: string
    title?: string
}

export function ChatPanel({ jobId, title }: ChatPanelProps) {
    const { socket, isConnected } = useSocket()
    const { data: session } = useSession()
    const [messages, setMessages] = useState<Message[]>([])
    const [inputText, setInputText] = useState('')
    const [loading, setLoading] = useState(true)
    const [isTyping, setIsTyping] = useState(false)
    const [mounted, setMounted] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        if (!mounted) return
        loadMessages()
        
        if (socket && isConnected) {
            socket.emit('join:job', jobId)

            socket.on('receive:message', async (newMessage: Message) => {
                if (newMessage.isEncrypted) {
                    const decrypted = await CryptoService.decrypt(newMessage.content)
                    newMessage.content = decrypted
                }
                setMessages((prev) => [...prev, newMessage])
            })

            socket.on('typing:start', (data: { userId: string }) => {
                if (data.userId !== session?.user?.id) setIsTyping(true)
            })

            socket.on('typing:stop', () => {
                setIsTyping(false)
            })
        }

        return () => {
            if (socket) {
                socket.off('receive:message')
                socket.off('typing:start')
                socket.off('typing:stop')
            }
        }
    }, [socket, isConnected, jobId, mounted])

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    const loadMessages = async () => {
        try {
            setLoading(true)

            // 1. Load from Local DB first (Instant)
            const localMessages = await offlineDB.messages
                .where('jobId')
                .equals(jobId)
                .sortBy('sentAt')
            
            // Cast Dexie result to Message type for state (assuming structure match mostly)
            if (localMessages.length > 0) {
                // Need to map LocalMessage to component's Message interface
                // Ideally we store full object in Dexie including sender details
                setMessages(localMessages as any) // Using any for quick mapping, ideally align types
                setLoading(false) // Show data immediately
            }

            // 2. Fetch from API (Network)
            const response = await fetch(`/api/messages?jobId=${jobId}`)
            if (!response.ok) throw new Error('Failed to fetch')
            
            const data = await response.json()
            
            // 3. Process and Decrypt
            const processedMessages = await Promise.all(
                data.map(async (msg: any) => {
                    let content = msg.content
                    if (msg.isEncrypted) {
                        content = await CryptoService.decrypt(msg.content)
                    }
                    return { ...msg, content, status: 'sent' }
                })
            )
            
            setMessages(processedMessages)

            // 4. Update Local DB
            await offlineDB.messages.bulkPut(processedMessages)

        } catch (error) {
            console.error('Chat load error:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSend = async () => {
        if (!inputText.trim() || !session?.user?.id) return

        const content = inputText.trim()
        setInputText('')

        try {
            // Encrypt before sending
            const encryptedContent = await CryptoService.encrypt(content)

            const response = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: encryptedContent,
                    jobId,
                    isEncrypted: true
                })
            })

            if (!response.ok) throw new Error('Send failed')
            
            const sentMessage = await response.json()
            // The response will have encrypted content, but for UI we want plain
            setMessages((prev) => [...prev, { ...sentMessage, content }])

        } catch (error) {
            console.error('Send error:', error)
        }
    }

    if (!mounted || loading) {
        return (
            <div className="flex h-[400px] items-center justify-center rounded-lg border bg-card">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="flex h-[500px] flex-col rounded-lg border bg-card shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-bottom p-3 bg-muted/50">
                <div className="flex items-center gap-2">
                    <div className={cn("h-2 w-2 rounded-full", isConnected ? "bg-green-500" : "bg-red-500")} />
                    <span className="text-sm font-semibold">{title || 'İş Sohbeti'}</span>
                </div>
                {!isConnected && <WifiOff className="h-4 w-4 text-muted-foreground" />}
            </div>

            {/* Messages Area */}
            <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4"
            >
                {messages.length === 0 ? (
                    <p className="text-center text-xs text-muted-foreground py-10 italic">
                        Henüz mesaj yok. İlk mesajı siz gönderin.
                    </p>
                ) : (
                    messages.map((msg) => {
                        const isMine = msg.senderId === session?.user?.id
                        return (
                            <div key={msg.id} className={cn("flex", isMine ? "justify-end" : "justify-start")}>
                                <div className={cn("flex max-w-[80%] gap-2", isMine ? "flex-row-reverse" : "flex-row")}>
                                    {!isMine && (
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={msg.sender.avatarUrl || ''} />
                                            <AvatarFallback>{msg.sender.name?.[0] || '?'}</AvatarFallback>
                                        </Avatar>
                                    )}
                                    <div className="flex flex-col">
                                        {!isMine && (
                                            <span className="text-[10px] font-medium mb-1 ml-1 text-muted-foreground">
                                                {msg.sender.name}
                                            </span>
                                        )}
                                        <div className={cn(
                                            "rounded-2xl px-3 py-2 text-sm shadow-sm relative",
                                            isMine ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-muted rounded-tl-none"
                                        )}>
                                            <p className="break-words">{msg.content}</p>
                                            <div className="flex items-center justify-end gap-1 mt-1 opacity-70">
                                                <span className="text-[9px]">
                                                    {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                {msg.isEncrypted && <Lock className="h-2 w-2" />}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-muted rounded-full px-4 py-2 text-[10px] animate-pulse">
                            Yazıyor...
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-3 border-t bg-background">
                <form 
                    onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                    className="flex gap-2"
                >
                    <Input 
                        placeholder="Mesajınızı yazın..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        className="flex-1 h-9 bg-muted/30 focus-visible:ring-primary"
                        onKeyDown={(e) => {
                            // Simple typing indicator logic
                            if (socket && isConnected) {
                                socket.emit('typing:start', { jobId, userId: session?.user?.id })
                                // This would need a debounce to emit stop
                            }
                        }}
                    />
                    <Button 
                        type="submit" 
                        size="icon" 
                        disabled={!inputText.trim() || !isConnected}
                        className="h-9 w-9 shrink-0"
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
                <div className="mt-1 flex items-center justify-center gap-1">
                    <Lock className="h-2 w-2 text-muted-foreground" />
                    <span className="text-[8px] text-muted-foreground">Mesajlar uçtan uca şifrelenir.</span>
                </div>
            </div>
        </div>
    )
}
