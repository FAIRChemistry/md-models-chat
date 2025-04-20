import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Github, HelpCircle } from "lucide-react";

interface RepositoryFormProps {
    githubUrl: string;
    path: string;
    selectedModel: string | null;
    openAIKey: string;
    availableFiles: string[];
    options: string[];
    isLoading: boolean;
    onGithubUrlChange: (value: string) => void;
    onPathChange: (value: string) => void;
    onModelChange: (value: string) => void;
    onOpenAIKeyChange: (value: string) => void;
    onSubmit: (e: React.FormEvent) => void;
}

export function RepositoryForm({
    githubUrl,
    path,
    selectedModel,
    openAIKey,
    availableFiles,
    options,
    isLoading,
    onGithubUrlChange,
    onPathChange,
    onModelChange,
    onOpenAIKeyChange,
    onSubmit,
}: RepositoryFormProps) {
    return (
        <Card className="shadow-lg bg-[#161b22] border-gray-700 mb-8">
            <CardHeader>
                <CardTitle className="flex items-center text-2xl font-semibold text-gray-100">
                    <Github className="mr-2" /> Repository Details
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={onSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* GitHub URL Input */}
                        <div className="space-y-2">
                            <Label htmlFor="github-url" className="flex items-center text-gray-300">
                                GitHub URL
                                <Tooltip>
                                    <TooltipTrigger>
                                        <HelpCircle className="w-4 h-4 ml-2 text-gray-400" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Enter the repository user and name. E.g. User/Repo</p>
                                    </TooltipContent>
                                </Tooltip>
                            </Label>
                            <Input
                                id="github-url"
                                value={githubUrl}
                                onChange={(e) => onGithubUrlChange(e.target.value)}
                                placeholder="User/Repo"
                                className="bg-[#0d1117] border-gray-700 text-white placeholder-gray-500"
                            />
                        </div>

                        {/* Path Select */}
                        <div className="space-y-2">
                            <Label htmlFor="path" className="flex items-center text-gray-300">
                                Path
                                <Tooltip>
                                    <TooltipTrigger>
                                        <HelpCircle className="w-4 h-4 ml-2 text-gray-400" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Specify the file or directory path within the repository</p>
                                    </TooltipContent>
                                </Tooltip>
                            </Label>
                            <Select onValueChange={onPathChange} value={path} disabled={availableFiles.length === 0}>
                                <SelectTrigger className="bg-[#0d1117] border-gray-700 text-white">
                                    <SelectValue placeholder="Select a path" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#0d1117] border-gray-700 text-white">
                                    {availableFiles.map((pathOption) => (
                                        <SelectItem key={pathOption} value={pathOption}>
                                            {pathOption}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Model Select */}
                        <div className="space-y-2">
                            <Label htmlFor="option" className="flex items-center text-gray-300">
                                Select Model
                                <Tooltip>
                                    <TooltipTrigger>
                                        <HelpCircle className="w-4 h-4 ml-2 text-gray-400" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Choose a model for data processing</p>
                                    </TooltipContent>
                                </Tooltip>
                            </Label>
                            <Select
                                onValueChange={onModelChange}
                                disabled={options.length === 0}
                                value={selectedModel || undefined}
                            >
                                <SelectTrigger className="bg-[#0d1117] border-gray-700 text-white">
                                    <SelectValue placeholder="Select an option" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#0d1117] border-gray-700 text-white">
                                    {options.map((option) => (
                                        <SelectItem key={option} value={option}>
                                            {option}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* OpenAI Key Input */}
                        <div className="space-y-2">
                            <Label htmlFor="openai-key" className="flex items-center text-gray-300">
                                OpenAI Key
                                <Tooltip>
                                    <TooltipTrigger>
                                        <HelpCircle className="w-4 h-4 ml-2 text-gray-400" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Enter your OpenAI API key</p>
                                    </TooltipContent>
                                </Tooltip>
                            </Label>
                            <Input
                                id="openai-key"
                                type="password"
                                value={openAIKey}
                                onChange={(e) => onOpenAIKeyChange(e.target.value)}
                                placeholder="Enter your OpenAI API key"
                                className="bg-[#0d1117] border-gray-700 text-white placeholder-gray-500"
                            />
                        </div>
                    </div>
                    <Button
                        type="submit"
                        className="w-full bg-[#238636] hover:bg-[#2ea043] text-white"
                        disabled={!selectedModel || isLoading}
                    >
                        {isLoading ? "Loading..." : "Extract Data"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
} 