"use client";

import { useState, useRef } from "react";
import { Loader2, Send, ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "./StarRating";
import { createReview, uploadReviewImage } from "@/lib/supabase/reviews";
import { compressImage } from "@/lib/image-compression";

interface ReviewFormProps {
  productId: string;
  orderId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const MAX_IMAGES = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB before compression

export function ReviewForm({
  productId,
  orderId,
  onSuccess,
  onCancel,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const remaining = MAX_IMAGES - imageFiles.length;
    
    if (remaining <= 0) {
      setError(`Maksimal ${MAX_IMAGES} foto`);
      return;
    }

    const filesToAdd = newFiles.slice(0, remaining);
    const validFiles: File[] = [];
    const previews: string[] = [];

    for (const file of filesToAdd) {
      if (file.size > MAX_FILE_SIZE) {
        setError(`File ${file.name} terlalu besar (maks 10MB)`);
        continue;
      }
      if (!file.type.startsWith("image/")) {
        setError(`File ${file.name} bukan gambar`);
        continue;
      }
      validFiles.push(file);
      previews.push(URL.createObjectURL(file));
    }

    setImageFiles(prev => [...prev, ...validFiles]);
    setImagePreviews(prev => [...prev, ...previews]);
    setError(null);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError("Silakan pilih rating");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Upload images first
      const imageUrls: string[] = [];
      if (imageFiles.length > 0) {
        setUploadProgress("Mengompres foto...");
        const compressedFiles = await Promise.all(
          imageFiles.map(f => compressImage(f, 'product'))
        );

        for (let i = 0; i < compressedFiles.length; i++) {
          setUploadProgress(`Mengunggah foto ${i + 1}/${compressedFiles.length}...`);
          const url = await uploadReviewImage(compressedFiles[i]);
          if (url) {
            imageUrls.push(url);
          }
        }
        setUploadProgress(null);
      }

      const review = await createReview({
        productId,
        orderId,
        rating,
        reviewText: reviewText.trim() || undefined,
        images: imageUrls.length > 0 ? imageUrls : undefined,
      });

      if (review) {
        // Cleanup previews
        imagePreviews.forEach(p => URL.revokeObjectURL(p));
        setRating(0);
        setReviewText("");
        setImageFiles([]);
        setImagePreviews([]);
        onSuccess?.();
      } else {
        setError("Gagal mengirim ulasan. Silakan coba lagi.");
      }
    } catch (err) {
      console.error("Review error:", err);
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
      setUploadProgress(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Rating</label>
        <StarRating
          rating={rating}
          size="lg"
          interactive
          onChange={setRating}
        />
      </div>

      <div>
        <label htmlFor="review" className="block text-sm font-medium mb-2">
          Ulasan (opsional)
        </label>
        <Textarea
          id="review"
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="Bagikan pengalaman Anda dengan produk ini..."
          rows={4}
          maxLength={1000}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          {reviewText.length}/1000 karakter
        </p>
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Foto (opsional, maks {MAX_IMAGES})
        </label>
        
        {/* Preview Grid */}
        {imagePreviews.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative group">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="h-20 w-20 rounded-lg object-cover border"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {imageFiles.length < MAX_IMAGES && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              multiple
              onChange={handleImageSelect}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSubmitting}
            >
              <ImagePlus className="mr-2 h-4 w-4" />
              Tambah Foto
            </Button>
          </>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {uploadProgress && (
        <p className="text-sm text-muted-foreground">{uploadProgress}</p>
      )}

      <div className="flex gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Batal
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting || rating === 0}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {uploadProgress || "Mengirim..."}
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Kirim Ulasan
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
