import { useState, useEffect, useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, ChevronDown, ChevronUp, Check, Loader2 } from "lucide-react";
import { fetchAvailableModels, Model } from "@/utils/requests";
import { cn } from "@/lib/utils";

interface ModelSelectorProps {
    selectedModel?: string;
    onModelSelect: (modelId: string) => void;
    className?: string;
}

export function ModelSelector({
    selectedModel,
    onModelSelect,
    className
}: ModelSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [models, setModels] = useState<Model[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch models when component mounts
    useEffect(() => {
        fetchModels();
    }, []);

    // Auto-select gpt-4.1 if it exists and no model is currently selected
    useEffect(() => {
        if (models.length > 0 && !selectedModel) {
            const gpt41Model = models.find(model => model.id === "gpt-4.1");
            if (gpt41Model) {
                onModelSelect(gpt41Model.id);
            }
        }
    }, [models, selectedModel, onModelSelect]);

    const fetchModels = async () => {
        setLoading(true);
        setError(null);

        try {
            const fetchedModels = await fetchAvailableModels();
            setModels(fetchedModels);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch models");
        } finally {
            setLoading(false);
        }
    };

    // Filter and sort models based on search term
    const filteredModels = useMemo(() => {
        let filtered = models;

        if (searchTerm) {
            filtered = models.filter(model =>
                model.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                model.owned_by.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Sort alphabetically by model id
        return filtered.sort((a, b) => a.id.localeCompare(b.id));
    }, [models, searchTerm]);

    const selectedModelData = models.find(model => model.id === selectedModel);

    return (
        <div className={cn("space-y-2", className)}>
            <Label htmlFor="model-selector" className="text-sm font-medium text-gray-100">
                Model
            </Label>

            <div className="relative">
                <Button
                    variant="outline"
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full justify-between h-9 bg-transparent border-gray-600 text-gray-100 hover:bg-gray-800 hover:border-gray-500 hover:text-gray-100"
                    disabled={loading}
                >
                    <span className="truncate">
                        {loading ? (
                            <div className="flex items-center">
                                <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                                Loading models...
                            </div>
                        ) : selectedModelData ? (
                            <div className="flex items-center">
                                <span className="truncate">{selectedModelData.id}</span>
                                <Badge variant="secondary" className="ml-2 text-xs">
                                    {selectedModelData.owned_by}
                                </Badge>
                            </div>
                        ) : (
                            "Select a model"
                        )}
                    </span>
                    {isOpen ? (
                        <ChevronUp className="w-4 h-4 opacity-50" />
                    ) : (
                        <ChevronDown className="w-4 h-4 opacity-50" />
                    )}
                </Button>

                {isOpen && (
                    <Card className="absolute top-full left-0 right-0 z-50 mt-1 bg-[#161b22] border-gray-700 shadow-lg">
                        <CardContent className="p-2">
                            <div className="relative mb-2">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search models..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-8 placeholder-gray-400 text-gray-100 bg-transparent border-gray-600"
                                />
                            </div>

                            {error && (
                                <div className="p-2 mb-2 text-sm text-red-400 rounded bg-red-950/20">
                                    {error}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={fetchModels}
                                        className="ml-2 text-xs"
                                    >
                                        Retry
                                    </Button>
                                </div>
                            )}

                            <div className="overflow-y-auto max-h-60">
                                {filteredModels.length > 0 ? (
                                    filteredModels.map((model) => (
                                        <Button
                                            key={model.id}
                                            variant="ghost"
                                            onClick={() => {
                                                onModelSelect(model.id);
                                                setIsOpen(false);
                                            }}
                                            className="w-full justify-start mb-1 h-auto p-2 text-left hover:bg-gray-800 hover:text-gray-100"
                                        >
                                            <div className="flex items-center w-full">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center">
                                                        <span className="text-gray-100 truncate">{model.id}</span>
                                                        {selectedModel === model.id && (
                                                            <Check className="ml-2 w-4 h-4 text-green-400" />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </Button>
                                    ))
                                ) : (
                                    <div className="py-4 text-sm text-center text-gray-400">
                                        {searchTerm ? "No models found matching your search" : "No models available"}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Click outside to close */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
} 