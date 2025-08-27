// Profile image management utilities

// Import retro Halloween profile images
import avatar1 from '@assets/profile-images/avatar1.png';
import avatar2 from '@assets/profile-images/avatar2.png';
import avatar3 from '@assets/profile-images/avatar3.png';
import avatar4 from '@assets/profile-images/avatar4.png';
import avatar5 from '@assets/profile-images/avatar5.png';
import avatar6 from '@assets/profile-images/avatar6.png';
import avatar7 from '@assets/profile-images/avatar7.png';
import avatar8 from '@assets/profile-images/avatar8.png';
import avatar9 from '@assets/profile-images/avatar9.png';

const profileImages: string[] = [
  avatar1, // Witch Ghost
  avatar2, // Retro Owl
  avatar3, // Black Cat
  avatar4, // Mummy with Candy
  avatar5, // Retro Devil
  avatar6, // Skeleton Pumpkin
  avatar7, // Vintage Witch
  avatar8, // Spider Web
  avatar9, // Pumpkin Ghost
];

// Get random profile image from our retro Halloween collection
export function getRandomProfileImage(): string | null {
  if (profileImages.length === 0) {
    return null; // Will fall back to initials
  }
  
  const randomIndex = Math.floor(Math.random() * profileImages.length);
  return profileImages[randomIndex];
}

// Get deterministic image based on user ID (consistent for each user)
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