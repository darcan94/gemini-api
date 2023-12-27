import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coldarkDark } from "react-syntax-highlighter/dist/cjs/styles/prism";

interface CodeBlock{
    syntax?: string;
    children: React.ReactNode
}

export default function CodeBlock({ syntax, children }: CodeBlock){
    return(
        <div className="mockup-code">
            <pre data-prefix="$">{syntax}</pre>
            <SyntaxHighlighter
                style={coldarkDark}
                language={syntax}
                customStyle={{
                    background: 'transparent',
                }}>
                {children}
            </SyntaxHighlighter>
        </div>
    );
}