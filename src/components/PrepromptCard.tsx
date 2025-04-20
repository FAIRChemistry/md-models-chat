import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

interface PrepromptCardProps {
    preprompt: string;
    onChange: (value: string) => void;
}

export function PrepromptCard({ preprompt, onChange }: PrepromptCardProps) {
    return (
        <Card className="shadow-lg bg-[#161b22] border-gray-700 mb-8">
            <CardHeader>
                <CardTitle className="flex items-center text-2xl font-semibold text-gray-100">
                    Preprompt
                    <Tooltip>
                        <TooltipTrigger>
                            <HelpCircle className="w-4 h-4 ml-2 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Enter a preprompt to guide the data analysis</p>
                        </TooltipContent>
                    </Tooltip>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Textarea
                    value={preprompt}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Enter your preprompt here..."
                    className="min-h-[100px] bg-[#0d1117] border-gray-700 text-white placeholder-gray-500"
                />
            </CardContent>
        </Card>
    );
} 