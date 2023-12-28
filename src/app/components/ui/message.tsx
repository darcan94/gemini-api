import remarkGfm from "remark-gfm";
import { MemoizedMarkdown } from "./memoizedMarkdown";
import CodeBlock from "./codeBlock";

export default function Message({ message }: { message: any}) {
 const user = message.role === 'user';
 console.log(message);
 return(
    <div className={`chat ${user ? 'chat-end' : 'chat-start' }`}>
        <div className={`chat-bubble ${user ? 'chat-bubble-primary': ''}`}>
            <MemoizedMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                    p({children}){
                        return <p className="mb-2 last:mb-0">{children}</p>
                    },
                    code({ node, className, children, ...props }){
                        const match = /language-(\w+)/.exec(className || "");
                        
                        return  match ? (
                            <CodeBlock 
                                syntax={match[1]} 
                                value={String(children).replace(/\n$/, "")}
                            />
                        ) : (
                            <code className={className} {...props}>
                                {children}
                            </code>
                        );
                    }
                }}>
                    {message.parts[0].text}
            </MemoizedMarkdown>        
        </div>
    </div>
 );
}