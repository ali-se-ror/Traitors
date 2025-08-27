// Profile image management utilities

// Import retro Halloween profile images from attached assets
import avatar1 from '@assets/RETRO-HALLOWEEN-38_1756253370945.png';
import avatar2 from '@assets/RETRO-HALLOWEEN-39_1756253370945.png';
import avatar3 from '@assets/RETRO-HALLOWEEN-41_1756253370946.png';
import avatar4 from '@assets/RETRO-HALLOWEEN-44_1756253370946.png';
import avatar5 from '@assets/RETRO-HALLOWEEN-48_1756253370946.png';
import avatar6 from '@assets/RETRO-HALLOWEEN-49_1756253370946.png';
import avatar7 from '@assets/RETRO-HALLOWEEN-55_1756253370947.png';
import avatar8 from '@assets/RETRO-HALLOWEEN-56_1756253370947.png';
import avatar9 from '@assets/RETRO-HALLOWEEN-64_1756253370947.png';

const profileImages: Record<string, string> = {
  'retro-38': avatar1,  // Retro Halloween 38
  'retro-39': avatar2,  // Retro Halloween 39
  'retro-41': avatar3,  // Retro Halloween 41
  'retro-44': avatar4,  // Retro Halloween 44
  'retro-48': avatar5,  // Retro Halloween 48
  'retro-49': avatar6,  // Retro Halloween 49
  'retro-55': avatar7,  // Retro Halloween 55
  'retro-56': avatar8,  // Retro Halloween 56
  'retro-64': avatar9,  // Retro Halloween 64
};

// Resolve profile image by identifier
export function resolveProfileImage(identifier: string | null): string | null {
  if (!identifier) return null;
  return profileImages[identifier] || null;
}

// Get random profile image from our retro Halloween collection
export function getRandomProfileImage(): string | null {
  const keys = Object.keys(profileImages);
  if (keys.length === 0) {
    return null; // Will fall back to initials
  }
  
  const randomIndex = Math.floor(Math.random() * keys.length);
  return profileImages[keys[randomIndex]];
}

// Get deterministic image based on user ID (consistent for each user)
export function getProfileImageForUser(userId: string): string | null {
  const keys = Object.keys(profileImages);
  if (keys.length === 0) {
    return null; // Will fall back to initials
  }
  
  // Create a simple hash from the user ID for deterministic selection
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  const index = Math.abs(hash) % keys.length;
  return profileImages[keys[index]];
}

export function getAllProfileImages(): string[] {
  return Object.values(profileImages);
}