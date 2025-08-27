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
import avatar10 from '@assets/profile-images/avatar10.png';
import avatar11 from '@assets/profile-images/avatar11.png';
import avatar12 from '@assets/profile-images/avatar12.png';
import avatar13 from '@assets/profile-images/avatar13.png';
import avatar14 from '@assets/profile-images/avatar14.png';
import avatar15 from '@assets/profile-images/avatar15.png';
import avatar16 from '@assets/profile-images/avatar16.png';
import avatar17 from '@assets/profile-images/avatar17.png';
import avatar18 from '@assets/profile-images/avatar18.png';
import avatar19 from '@assets/profile-images/avatar19.png';
import avatar20 from '@assets/profile-images/avatar20.png';
import avatar21 from '@assets/profile-images/avatar21.png';
import avatar22 from '@assets/profile-images/avatar22.png';
import avatar23 from '@assets/profile-images/avatar23.png';
import avatar24 from '@assets/profile-images/avatar24.png';
import avatar25 from '@assets/profile-images/avatar25.png';
import avatar26 from '@assets/profile-images/avatar26.png';
import avatar27 from '@assets/profile-images/avatar27.png';
import avatar28 from '@assets/profile-images/avatar28.png';

const profileImages: string[] = [
  avatar1,  // Witch Ghost
  avatar2,  // Retro Owl
  avatar3,  // Black Cat
  avatar4,  // Mummy with Candy
  avatar5,  // Retro Devil
  avatar6,  // Skeleton Pumpkin
  avatar7,  // Vintage Witch
  avatar8,  // Spider Web
  avatar9,  // Pumpkin Ghost
  avatar10, // Cute Bat
  avatar11, // Retro Skull
  avatar12, // Cat on Skull
  avatar13, // Witch Moon
  avatar14, // Witch Hat Pumpkin
  avatar15, // Dancing Skeleton
  avatar16, // Classic Vampire
  avatar17, // Retro Witch with Cat
  avatar18, // Spooky Vampire
  avatar19, // Green Skull
  avatar20, // Pumpkin Head Skeleton
  avatar21, // Halloween Black Cat
  avatar22, // Retro Owl
  avatar23, // Classic Jack-o'-Lantern
  avatar24, // Scary Monster
  avatar25, // Rock Skeleton
  avatar26, // Spooky Ghost
  avatar27, // Green Witch
  avatar28, // Bat on Moon
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