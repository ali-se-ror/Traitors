# Profile Images Setup Guide

I've implemented the infrastructure for random profile images! Here's how to complete the setup:

## 1. Upload Your Profile Images

1. Create/drag your .png files into the folder: `client/src/assets/profile-images/`
2. Name them something like: `avatar1.png`, `avatar2.png`, `avatar3.png`, etc.
3. Upload as many as you want - the more variety, the better!

## 2. After Uploading, Update the profileImages.ts File

Once you've uploaded your images, update `client/src/lib/profileImages.ts`:

```typescript
// Import your uploaded images
import avatar1 from '@assets/profile-images/avatar1.png';
import avatar2 from '@assets/profile-images/avatar2.png';
import avatar3 from '@assets/profile-images/avatar3.png';
// ... add more imports for each image

// Add them to the array
const profileImages: string[] = [
  avatar1,
  avatar2, 
  avatar3,
  // ... add all your imported images here
];
```

## 3. How It Works

- **New players**: Will get a random profile image assigned when they register
- **Existing players**: Will continue showing their spooky symbol until they get assigned an image
- **Fallback**: If no images are available, players see their spooky symbol or initials
- **Consistency**: Each player always gets the same image (deterministic based on their user ID)

## 4. Where Profile Images Appear

✅ **Already Updated:**
- Player cards on dashboard
- Voting page player cards  
- Secret messages (when added)
- All avatar components throughout the app

## 5. Future Enhancement Option

If you want to let users choose their own profile image later, we can add a profile settings page where they can pick from your collection or upload their own.

Just upload your .png files and let me know when they're ready - I'll update the imports for you!