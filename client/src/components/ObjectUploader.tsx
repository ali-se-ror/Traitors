import { useState, useRef } from "react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Image, Video, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ObjectUploaderProps {
  onUploadComplete?: (fileUrl: string, fileType: string) => void;
  acceptedTypes?: string;
  maxFileSize?: number;
  children?: ReactNode;
  className?: string;
  buttonBG?: string;
}

export function ObjectUploader({
  onUploadComplete,
  acceptedTypes = "image/*,video/*",
  maxFileSize = 10485760, // 10MB default
  children,
  className = "",
  buttonBG = "hover:bg-purple-900/30 border-purple-400/50",
}: ObjectUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > maxFileSize) {
      toast({
        title: "File too large",
        description: `File size must be less than ${Math.round(maxFileSize / 1024 / 1024)}MB`,
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Get upload URL from backend
      const response = await fetch("/api/objects/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to get upload URL");
      }

      const { uploadURL } = await response.json();

      // Upload file to signed URL
      const uploadResponse = await fetch(uploadURL, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file");
      }

      // Set ACL policy for the uploaded file
      const aclResponse = await fetch("/api/media-attachments", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mediaUrl: uploadURL,
          fileType: file.type,
        }),
      });

      if (!aclResponse.ok) {
        throw new Error("Failed to set file permissions");
      }

      const { objectPath } = await aclResponse.json();

      toast({
        title: "Upload successful",
        description: "Your file has been uploaded successfully",
      });

      onUploadComplete?.(objectPath, file.type);
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your file",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset the input value so the same file can be uploaded again
      event.target.value = "";
    }
  };

  const getFileIcon = () => {
    if (acceptedTypes.includes("image")) return <Image className="w-4 h-4" />;
    if (acceptedTypes.includes("video")) return <Video className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  return (
    <div className={className}>
      <input
        type="file"
        id="file-upload"
        accept={acceptedTypes}
        onChange={handleFileUpload}
        className="hidden"
        disabled={isUploading}
      />
      <label htmlFor="file-upload">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isUploading}
          className={`cursor-pointer ${buttonBG}`}
          asChild
        >
          <span>
            {isUploading ? (
              <>
                <Upload className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                {children || (
                  <>
                    {getFileIcon()}
                    <span className="ml-2">Upload</span>
                  </>
                )}
              </>
            )}
          </span>
        </Button>
      </label>
    </div>
  );
}