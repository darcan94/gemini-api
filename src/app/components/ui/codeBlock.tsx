import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coldarkDark } from "react-syntax-highlighter/dist/cjs/styles/prism";

interface CodeBlock{
    syntax: string;
    value: string
}

export default function CodeBlock({ syntax = "javascript", value }: CodeBlock){
    return(
        <div className="mockup-code bg-[#111b27]">
            <pre>{syntax}</pre>
            <SyntaxHighlighter
                language={syntax}
                style={coldarkDark}>
                {value}
            </SyntaxHighlighter>
        </div>
    );
}