import remarkGfm from "remark-gfm";
import { MemoizedMarkdown } from "./memoizedMarkdown";
import CodeBlock from "./codeBlock";

export default function Message({ message }: { message: any}) {
 const user = message.role === 'user';
 return(
    <div className={`chat ${user ? 'chat-end' : 'chat-start' }`}>
        <div className={`chat-bubble ${user ? 'chat-bubble-primary': ''}`}>
            <MemoizedMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                    p({children}){
                        return <p className="mb-2 last:mb-0">{children}</p>
                    },
                    code({ node, inline, className, children, ...props }){
                        const match = /language-(\w+)/.exec(className || "");
                        
                        return !inline && match ? (
                            <CodeBlock syntax={match[0]}>
                                {String(children).replace(/\n$/, "")}
                            </CodeBlock>
                        ) : (
                            <code className={className} {...props}>
                                {children}
                            </code>
                        );
                    }
                }}>
                    {message.parts}
            </MemoizedMarkdown>        
        </div>
    </div>
 );
}