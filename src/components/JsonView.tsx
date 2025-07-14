// @ts-ignore
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
// @ts-ignore
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Spinner } from "@/components/SpinnerElement";

interface JsonViewProps {
    jsonData: string;
    evaluation: {
        fits: boolean;
        reason: string;
    };
}

export function JsonView({ jsonData, evaluation }: JsonViewProps) {
    if (jsonData !== "{}") {
        return (
            <div className="text-sm">
                <SyntaxHighlighter
                    language="json"
                    style={{
                        ...oneDark,
                        'pre[class*="language-"]': {
                            ...oneDark['pre[class*="language-"]'],
                            background: "transparent",
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                        },
                        'code[class*="language-"]': {
                            ...oneDark['code[class*="language-"]'],
                            background: "transparent",
                        },
                    }}
                    customStyle={{
                        margin: 0,
                        padding: "1rem",
                        background: "transparent",
                        fontSize: "0.875rem",
                        lineHeight: "1.5",
                    }}
                    wrapLongLines={true}
                    wrapLines={true}
                >
                    {jsonData}
                </SyntaxHighlighter>
            </div>
        );
    } else if (!evaluation.fits && jsonData === "{}") {
        return (
            <div className="flex justify-center items-center h-40 text-gray-500">
                <p>No Data</p>
            </div>
        );
    } else {
        return (
            <div className="flex justify-center items-center h-40">
                <Spinner color="secondary" />
            </div>
        );
    }
} 