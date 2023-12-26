'use client'
import { FormEvent, KeyboardEvent, useRef, useState } from "react";

export default function Chat(){
    const formRef = useRef<HTMLFormElement>(null);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<any[]>([]);

    function handleInputChange(evt: any){
        setInput(evt.target.value);
    }

    const handleKeyDown = (evt: KeyboardEvent<HTMLTextAreaElement>): void => {
        if (evt.key === "Enter" && !evt.shiftKey) {
          formRef.current?.requestSubmit();
          evt.preventDefault();
        }
    }

    function handleSubmit(evt: FormEvent<HTMLFormElement>){
        evt.preventDefault()
        const newMessage = {
            role: 'user',
            parts: input
        }
        const newMessages = [...messages, newMessage];
        setMessages(newMessages);
        setInput('');
        sentMessages(newMessages);
    }

    const sentMessages = async (messages: any[]) => {
        const response = await fetch('/api/chat', {
            method: 'POST',
            body: JSON.stringify(messages)
        })

        const { candidates } = await response.json();
        const { content } = candidates[0];
        const parts = content.parts[0].text;
        const newGeminiMessage = {parts, role: content.role}
        setMessages(prevData => [...prevData, newGeminiMessage]);
    }

    return (
        <div className="w-4/5 h-full mx-auto flex flex-col justify-end gap-5">
            <div>
            {
                messages.map((message, i) => (                    
                    <div key={i} className={`chat ${message.role === 'user' 
                    ? 'chat-end' : 'chat-start' }`}>
                        <p className={`chat-bubble ${message.role === 'user'
                    ? 'chat-bubble-primary': ''}`}>{message.parts}</p>
                    </div>
                ))
            }
            </div>
            <div className="sticky bottom-1">
                <form ref={formRef} className="flex" onSubmit={handleSubmit}>
                    <textarea
                        tabIndex={0}
                        rows={1}
                        className="textarea w-11/12 resize-none px-4 py-[.5rem] text-font outline-none sm:text-sm"
                        onKeyDown={(evt) => handleKeyDown(evt)}
                        value={input}
                        onChange={handleInputChange}
                        placeholder="Send a message"
                        >
                    </textarea>
                    <button type='submit' className="btn btn-primary">Send</button>
                </form>
            </div>
        </div>
    );
}