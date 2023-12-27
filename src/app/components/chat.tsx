'use client'
import { useAutoScroll } from "@/app/utils/hooks/useScroll";
import { FormEvent, KeyboardEvent, useRef, useState } from "react";
import Message from "@/app/components/ui/message";

export default function Chat(){
    const formRef = useRef<HTMLFormElement>(null);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<any[]>([]);
    const [isLoading, setLoading] = useState(false);
    const chatListRef = useAutoScroll(messages);

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
        setLoading(true);
        const newMessage = {role: 'user', parts: input}
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

        setLoading(false);

        const { candidates } = await response.json();
        const { content } = candidates[0];
        const parts = content.parts[0].text;
        const newGeminiMessage = {parts, role: content.role}
        setMessages(prevData => [...prevData, newGeminiMessage]);
    }

    return (
        <div className="w-4/5 h-full mx-auto flex flex-col justify-end gap-5">
            <div ref={chatListRef} className="overflow-y-auto">
            {
                messages.map((message, i) => (                    
                    <Message key={i} message={message} />
                ))
            }
            </div>
            <div className="sticky bottom-1">
                <form ref={formRef} className="flex justify-center gap-1" onSubmit={handleSubmit}>
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
                    <button disabled={isLoading || input===''} type='submit' className="btn btn-primary">Send</button>
                </form>
            </div>
        </div>
    );
}