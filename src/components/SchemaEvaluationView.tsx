import ReactMarkdown from "react-markdown";
import FitBadge from "@/components/Badge";
import { Badge } from "./ui/badge";

interface SchemaEvaluationViewProps {
    evaluation: {
        fits: boolean;
        reason: string;
    };
}

export function SchemaEvaluationView({ evaluation }: SchemaEvaluationViewProps) {
    if (evaluation.reason) {
        return (
            <div className="text-[#e6edf3] prose prose-invert max-w-none text-sm leading-relaxed">
                <FitBadge fits={evaluation.fits} />
                <ReactMarkdown
                    components={{
                        h1: ({ children }) => (
                            <h1 className="text-xl font-semibold border-b border-[#30363d] pb-2 mb-4 leading-loose">
                                {children}
                            </h1>
                        ),
                        h2: ({ children }) => (
                            <h2 className="mt-6 mb-3 text-lg font-semibold leading-loose">
                                {children}
                            </h2>
                        ),
                        h3: ({ children }) => (
                            <h3 className="mt-4 mb-2 text-base font-semibold leading-loose">
                                {children}
                            </h3>
                        ),
                        ul: ({ children }) => (
                            <ul className="list-disc pl-6 mb-4 text-[#e6edf3] leading-relaxed">
                                {children}
                            </ul>
                        ),
                        li: ({ children }) => <li className="my-3">{children}</li>,
                        p: ({ children }) => (
                            <p className="mb-4 text-[#e6edf3] leading-relaxed">
                                {children}
                            </p>
                        ),
                        em: ({ children }) => (
                            <Badge
                                className="bg-gray-800 mx-[1px] hover:bg-gray-700"
                                variant="default"
                            >
                                {children}
                            </Badge>
                        ),
                    }}
                >
                    {evaluation.reason}
                </ReactMarkdown>
            </div>
        );
    } else {
        return (
            <div className="flex justify-center items-center h-40 text-gray-500">
                <p>No Data</p>
            </div>
        );
    }
} 