/**
 * Image validation utility
 * Provides consistent validation for image uploads across all forms
 */

export interface ImageValidationResult {
  isValid: boolean;
  error?: string;
}

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'] as const;
export const MAX_IMAGE_SIZE = 1 * 1024 * 1024; // 1MB in bytes

/**
 * Validates an image file
 * @param file - The file to validate
 * @param maxSize - Maximum file size in bytes (default: 1MB)
 * @returns Validation result with isValid flag and optional error message
 */
export const validateImageFile = (
  file: File,
  maxSize: number = MAX_IMAGE_SIZE
): ImageValidationResult => {
  // Check file type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as any)) {
    return {
      isValid: false,
      error: 'Only JPG, PNG, and WebP image formats are allowed'
    };
  }

  // Check file size
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
    return {
      isValid: false,
      error: `Image size must be less than ${maxSizeMB}MB. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`
    };
  }

  return { isValid: true };
};

/**
 * Validates that an image file matches exact width and height.
 * Used for strict banner dimension enforcement (e.g. 1920x900).
 */
export const validateImageDimensions = (
  file: File,
  requiredWidth: number,
  requiredHeight: number
): Promise<ImageValidationResult> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        if (img.width === requiredWidth && img.height === requiredHeight) {
          resolve({ isValid: true });
        } else {
          resolve({
            isValid: false,
            error: `Image dimensions must be exactly ${requiredWidth}x${requiredHeight}px. Current: ${img.width}x${img.height}px`
          });
        }
      };
      img.onerror = () =>
        resolve({
          isValid: false,
          error: 'Failed to read image dimensions. Please try another file.'
        });
      img.src = e.target?.result as string;
    };
    reader.onerror = () =>
      resolve({
        isValid: false,
        error: 'Failed to read image file. Please try another file.'
      });
    reader.readAsDataURL(file);
  });
};

/**
 * Gets the allowed image types as a string for accept attribute
 */
export const getAllowedImageTypesString = (): string => {
  return ALLOWED_IMAGE_TYPES.join(',');
};

/**
 * Gets a user-friendly description of allowed image types and size
 */
export const getImageValidationHint = (maxSizeMB: number = 1): string => {
  return `JPG, PNG, and WebP formats only. Maximum size: ${maxSizeMB}MB`;
};

/**
 * Gets a user-friendly description including required dimensions and size.
 * Useful for banner uploads where exact dimensions are required.
 */
export const getImageDimensionHint = (
  width: number,
  height: number,
  maxSizeMB: number = 1
): string => {
  return `Required size: ${width}x${height}px. JPG, PNG, and WebP formats only. Maximum size: ${maxSizeMB}MB`;
};

