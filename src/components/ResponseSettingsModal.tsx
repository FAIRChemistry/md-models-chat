import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { X, Settings2 } from "lucide-react";
import { ModelSelector } from "./ModelSelector";

interface ResponseSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    settings: {
        enableSchemaEvaluation: boolean;
        enableKnowledgeGraph: boolean;
        enableJsonExtraction: boolean;
        enableMultipleOutputs: boolean;
        selectedModel?: string;
    };
    onSettingsChange: (key: string, value: boolean | string) => void;
}

export function ResponseSettingsModal({
    isOpen,
    onClose,
    settings,
    onSettingsChange,
}: ResponseSettingsModalProps) {
    if (!isOpen) return null;

    return (
        <div className="flex fixed inset-0 z-50 justify-center items-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 backdrop-blur-sm bg-black/50"
                onClick={onClose}
            />

            {/* Modal */}
            <Card className="relative w-full max-w-md mx-4 bg-[#161b22] border-gray-700 shadow-2xl">
                <CardHeader className="flex flex-row justify-between items-center">
                    <CardTitle className="flex items-center text-xl font-semibold text-gray-100">
                        <Settings2 className="mr-2 w-5 h-5" />
                        Response Settings
                    </CardTitle>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="p-0 w-8 h-8 text-gray-400 hover:text-white hover:bg-gray-800"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Model Selection */}
                    <div className="space-y-2">
                        <ModelSelector
                            selectedModel={settings.selectedModel}
                            onModelSelect={(modelId) => onSettingsChange('selectedModel', modelId)}
                        />
                        <p className="text-xs text-gray-400">
                            Select the AI model to use for processing your requests. Different models may have varying capabilities and performance characteristics.
                        </p>
                    </div>

                    {/* JSON Extraction */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <Label htmlFor="json-extraction" className="text-sm font-medium text-gray-100">
                                JSON Extraction
                            </Label>
                            <Switch
                                id="json-extraction"
                                checked={settings.enableJsonExtraction}
                                onCheckedChange={(checked) => onSettingsChange('enableJsonExtraction', checked)}
                                className="data-[state=checked]:bg-[#238636]"
                            />
                        </div>
                        <p className="text-xs text-gray-400">
                            Extracts structured data from your text based on the selected schema.
                            This is the core functionality that converts unstructured text into JSON format.
                        </p>
                    </div>

                    {/* Schema Evaluation */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <Label htmlFor="schema-evaluation" className="text-sm font-medium text-gray-100">
                                Schema Evaluation
                            </Label>
                            <Switch
                                id="schema-evaluation"
                                checked={settings.enableSchemaEvaluation}
                                onCheckedChange={(checked) => onSettingsChange('enableSchemaEvaluation', checked)}
                                className="data-[state=checked]:bg-[#238636]"
                            />
                        </div>
                        <p className="text-xs text-gray-400">
                            Evaluates whether your input text is compatible with the selected schema.
                            Provides feedback on data quality and suggests improvements if the text doesn't fit well.
                        </p>
                    </div>

                    {/* Knowledge Graph */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <Label htmlFor="knowledge-graph" className="text-sm font-medium text-gray-100">
                                Knowledge Graph
                            </Label>
                            <Switch
                                id="knowledge-graph"
                                checked={settings.enableKnowledgeGraph}
                                onCheckedChange={(checked) => onSettingsChange('enableKnowledgeGraph', checked)}
                                className="data-[state=checked]:bg-[#238636]"
                            />
                        </div>
                        <p className="text-xs text-gray-400">
                            Generates a knowledge graph showing relationships between entities in your text.
                            Creates triplets (subject-predicate-object) that can be visualized to understand data connections.
                        </p>
                    </div>

                    {/* Multiple Outputs */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <Label htmlFor="multiple-outputs" className="text-sm font-medium text-gray-100">
                                Multiple Outputs
                            </Label>
                            <Switch
                                id="multiple-outputs"
                                checked={settings.enableMultipleOutputs}
                                onCheckedChange={(checked) => onSettingsChange('enableMultipleOutputs', checked)}
                                className="data-[state=checked]:bg-[#238636]"
                            />
                        </div>
                        <p className="text-xs text-gray-400">
                            Enables extraction of multiple instances of the same schema from your text.
                            Useful when your text contains multiple entities that match the same structure.
                        </p>
                    </div>

                    <div className="pt-4 border-t border-gray-700">
                        <Button
                            onClick={onClose}
                            className="w-full bg-[#238636] hover:bg-[#2ea043] text-white"
                        >
                            Apply Settings
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 