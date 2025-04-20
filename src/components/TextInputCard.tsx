import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

interface TextInputCardProps {
    text: string;
    isMultiple: boolean;
    onTextChange: (value: string) => void;
    onMultipleChange: (value: boolean) => void;
}

export function TextInputCard({
    text,
    isMultiple,
    onTextChange,
    onMultipleChange,
}: TextInputCardProps) {
    return (
        <Card className="shadow-lg bg-[#161b22] border-gray-700 flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center text-xl font-semibold text-gray-100">
                    Text Input
                    <Tooltip>
                        <TooltipTrigger>
                            <HelpCircle className="w-4 h-4 ml-2 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Enter the text you want to parse</p>
                        </TooltipContent>
                    </Tooltip>
                </CardTitle>
                <div className="flex items-center space-x-2">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="flex items-center space-x-2">
                                <Label htmlFor="multiple-switch" className="text-sm text-gray-400">
                                    Multiple
                                </Label>
                                <Switch
                                    id="multiple-switch"
                                    checked={isMultiple}
                                    onCheckedChange={onMultipleChange}
                                    className="data-[state=checked]:bg-[#238636]"
                                />
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Toggle to enable multiple outputs</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
            </CardHeader>
            <CardContent className="flex-1">
                <Textarea
                    value={text}
                    onChange={(e) => onTextChange(e.target.value)}
                    placeholder="Enter text here..."
                    className="h-full min-h-[300px] lg:min-h-[400px] bg-[#0d1117] border-gray-700 text-white placeholder-gray-500 text-xl"
                />
            </CardContent>
        </Card>
    );
} 