import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
// import style from "react-syntax-highlighter/dist/esm/styles/hljs/a11y-dark";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

type CodeBlockProps = {
  code: string;
  language: string;
};

export default function CodeBlock({ code, language }: CodeBlockProps) {
  return (
    <div className="max-h-[600px] overflow-y-auto rounded-b-2xl">
      <SyntaxHighlighter
        language={language}
        style={oneDark}
        showLineNumbers={true}
        wrapLines={true}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
