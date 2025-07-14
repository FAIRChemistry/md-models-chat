import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle, Plus, FileText } from "lucide-react";
import { FileChip, UploadedFile, FileType } from "@/components/ui/file-chip";
import { useRef } from "react";

interface FileInputCardProps {
    uploadedFiles: UploadedFile[];
    onFileUpload: (files: UploadedFile[]) => void;
    onFileRemove: (id: string) => void;
}

export function FileInputCard({
    uploadedFiles,
    onFileUpload,
    onFileRemove,
}: FileInputCardProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;

        const newFiles: UploadedFile[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            // Validate file type
            const isImage = file.type.startsWith('image/');
            const isPdf = file.type === 'application/pdf';

            if (!isImage && !isPdf) {
                alert(`File "${file.name}" is not supported. Please upload only PDF or image files.`);
                continue;
            }

            // Validate file size (max 25MB for safety)
            const maxSize = 25 * 1024 * 1024; // 25MB
            if (file.size > maxSize) {
                alert(`File "${file.name}" is too large. Maximum size is 25MB.`);
                continue;
            }

            const uploadedFile: UploadedFile = {
                id: `${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`,
                file,
                path: file.name,
                type: isPdf ? FileType.PDF : FileType.IMAGE,
            };

            newFiles.push(uploadedFile);
        }

        if (newFiles.length > 0) {
            onFileUpload(newFiles);
        }

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const triggerFileUpload = () => {
        fileInputRef.current?.click();
    };

    return (
        <Card className="shadow-lg bg-[#161b22] border-gray-700 h-full flex flex-col">
            <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle className="flex items-center text-xl font-semibold text-gray-100">
                    <FileText className="mr-2 w-5 h-5" />
                    Files
                    <Tooltip>
                        <TooltipTrigger>
                            <HelpCircle className="ml-2 w-4 h-4 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Upload PDF or image files to supplement your text analysis</p>
                        </TooltipContent>
                    </Tooltip>
                </CardTitle>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            onClick={triggerFileUpload}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#238636]/20 text-gray-400 hover:text-white transition-colors border border-gray-600 hover:border-[#238636]"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Upload PDF or image files</p>
                    </TooltipContent>
                </Tooltip>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
                {/* File Upload Input (Hidden) */}
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.png,.jpg,.jpeg,.gif,.bmp,.webp,.svg"
                    onChange={handleFileUpload}
                    className="hidden"
                />

                {/* Uploaded Files Display */}
                {uploadedFiles.length > 0 ? (
                    <div className="space-y-2 flex-1 flex flex-col">
                        <p className="text-sm text-gray-400 mb-3">
                            {uploadedFiles.length} file{uploadedFiles.length !== 1 ? 's' : ''} uploaded
                        </p>
                        <div className="flex flex-col gap-2 flex-1 overflow-y-auto">
                            {uploadedFiles.map((file) => (
                                <FileChip
                                    key={file.id}
                                    uploadedFile={file}
                                    onRemove={onFileRemove}
                                />
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500 flex-1 flex flex-col justify-center">
                        <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No files uploaded</p>
                        <p className="text-xs mt-1">Click the + button to add files</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
} 