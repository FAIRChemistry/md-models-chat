import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle, Play, Settings2 } from "lucide-react";
import { Spinner } from "@/components/SpinnerElement";
import { ResponseSettingsModal } from "@/components/ResponseSettingsModal";
import { useState } from "react";

interface InstructionCardProps {
    text: string;
    onChange: (value: string) => void;
    onExtract: (e: React.FormEvent) => Promise<void>;
    isLoading: boolean;
    settings: {
        enableSchemaEvaluation: boolean;
        enableKnowledgeGraph: boolean;
        enableJsonExtraction: boolean;
        enableMultipleOutputs: boolean;
        selectedModel?: string;
    };
    onSettingsChange: (key: string, value: boolean | string) => void;
}

export function InstructionCard({
    text,
    onChange,
    onExtract,
    isLoading,
    settings,
    onSettingsChange,
}: InstructionCardProps) {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const handleExtractClick = async (e: React.FormEvent) => {
        await onExtract(e);
    };

    return (
        <>
            <Card className="shadow-lg bg-[#161b22] border-gray-700 h-full flex flex-col">
                <CardHeader className="flex flex-row justify-between items-center">
                    <CardTitle className="flex items-center text-2xl font-semibold text-gray-100">
                        Text Input
                        <Tooltip>
                            <TooltipTrigger>
                                <HelpCircle className="ml-2 w-4 h-4 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Enter the text you want to analyze and extract data from</p>
                            </TooltipContent>
                        </Tooltip>
                    </CardTitle>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                onClick={() => setIsSettingsOpen(true)}
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 bg-[#21262d] border-gray-600 hover:bg-[#30363d] text-white"
                            >
                                <Settings2 className="w-4 h-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Configure response settings</p>
                        </TooltipContent>
                    </Tooltip>
                </CardHeader>
                <CardContent className="flex flex-col flex-1 space-y-4">
                    <Textarea
                        value={text}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="Enter the text you want to analyze and extract data from..."
                        className="min-h-[200px] lg:min-h-[300px] bg-[#0d1117] border-gray-700 text-white placeholder-gray-500 text-lg flex-1"
                    />
                    <div className="flex justify-end">
                        <Button
                            onClick={handleExtractClick}
                            disabled={isLoading || !text.trim()}
                            className="bg-[#238636] hover:bg-[#2ea043] text-white px-6 py-2 flex items-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Spinner size="sm" color="secondary" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Play className="w-4 h-4" />
                                    Extract Data
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <ResponseSettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                settings={settings}
                onSettingsChange={onSettingsChange}
            />
        </>
    );
} 