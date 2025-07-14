import { X, FileText, Image } from "lucide-react";
import { Button } from "@/components/ui/button";

export enum FileType {
    PDF = 'PDF',
    IMAGE = 'IMAGE'
}

export interface UploadedFile {
    id: string;
    file: File;
    path: string;
    type: FileType;
}

interface FileChipProps {
    uploadedFile: UploadedFile;
    onRemove: (id: string) => void;
}

export function FileChip({ uploadedFile, onRemove }: FileChipProps) {
    const getFileIcon = () => {
        if (uploadedFile.type === FileType.PDF) {
            return <FileText className="w-4 h-4 text-red-400" />;
        }
        return <Image className="w-4 h-4 text-blue-400" />;
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="flex items-center gap-1.5 px-2 py-1.5 bg-[#21262d] border border-gray-600 rounded-md text-xs text-gray-300 max-w-48">
            {getFileIcon()}
            <div className="flex-1 min-w-0">
                <div className="font-medium truncate">
                    {uploadedFile.file.name}
                </div>
                <div className="text-xs text-gray-500">
                    {formatFileSize(uploadedFile.file.size)}
                </div>
            </div>
            <Button
                variant="ghost"
                size="sm"
                className="p-0 w-4 h-4 text-gray-400 hover:bg-red-600/20 hover:text-red-400"
                onClick={() => onRemove(uploadedFile.id)}
            >
                <X className="w-2.5 h-2.5" />
            </Button>
        </div>
    );
} 