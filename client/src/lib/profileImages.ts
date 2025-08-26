// Profile image management utilities

// Import profile images - add your .png files here after uploading them
// Example: import image1 from '@assets/profile-images/avatar1.png';

// For now, we'll use a placeholder system that you can update after uploading images
const profileImages: string[] = [
  // Add your imported image paths here after uploading
  // Example: image1, image2, image3, etc.
];

// Fallback to initials if no images are available yet
export function getRandomProfileImage(): string | null {
  if (profileImages.length === 0) {
    return null; // Will fall back to initials
  }
  
  const randomIndex = Math.floor(Math.random() * profileImages.length);
  return profileImages[randomIndex];
}

// Function to get a deterministic image based on user ID (so it stays consistent)
export function getProfileImageForUser(userId: string): string | null {
  if (profileImages.length === 0) {
    return null; // Will fall back to initials
  }
  
  // Create a simple hash from the user ID for deterministic selection
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  const index = Math.abs(hash) % profileImages.length;
  return profileImages[index];
}

export function getAllProfileImages(): string[] {
  return [...profileImages];
}