import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Download, HelpCircle } from "lucide-react";
import { Spinner } from "@/components/spinner";
import { Viewer } from "@/components/viewer";
import { KnowledgeGraph as KnowledgeGraphType } from "@/utils/requests";
import { EvaluateSchemaPromptResponse } from "@/utils/requests";

interface ResponseCardProps {
    isEvaluating: boolean;
    jsonData: any;
    evaluation: EvaluateSchemaPromptResponse;
    graph: KnowledgeGraphType;
    onDownload: () => void;
}

export function ResponseCard({
    isEvaluating,
    jsonData,
    evaluation,
    graph,
    onDownload,
}: ResponseCardProps) {
    return (
        <Card className="shadow-lg bg-[#161b22] border-gray-700 flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center text-xl font-semibold text-gray-100">
                    Response
                    <Tooltip>
                        <TooltipTrigger>
                            <HelpCircle className="w-4 h-4 ml-2 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>View the data and evaluation of the extracted data.</p>
                        </TooltipContent>
                    </Tooltip>
                </CardTitle>
                <Button
                    onClick={onDownload}
                    variant="outline"
                    size="icon"
                    className="h-6 w-6 bg-[#21262d] border-gray-600 hover:bg-[#30363d] text-white"
                    title="Download JSON"
                >
                    <Download className="w-3 h-3" />
                    <span className="sr-only">Download JSON</span>
                </Button>
            </CardHeader>
            <CardContent className="flex-1">
                {isEvaluating ? (
                    <div className="flex justify-center items-center min-h-[300px] lg:min-h-[400px]">
                        <Spinner size="lg" color="secondary" />
                    </div>
                ) : (
                    <Viewer
                        jsonData={JSON.stringify(jsonData, null, 2)}
                        evaluation={evaluation}
                        knowledgeGraph={graph}
                    />
                )}
            </CardContent>
        </Card>
    );
} 