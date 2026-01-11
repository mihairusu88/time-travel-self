# Props & Templates Storage Guide

This guide explains how to add new props and templates to the application by uploading images to Supabase Storage.

## Storage Structure

The application automatically loads props and templates from two Supabase Storage buckets:

### Props Bucket: `hero_props`

```
hero_props/
├── hands/
│   ├── beer.png
│   ├── burger.png
│   ├── sword.png
│   └── ...
├── head/
│   ├── crown.png
│   ├── hat.png
│   └── ...
├── body/
│   ├── armor.png
│   ├── cape.png
│   └── ...
└── legs/
    ├── boots.png
    ├── pants.png
    └── ...
```

### Templates Bucket: `hero_templates`

```
hero_templates/
├── playful/
│   ├── birthday-hero.png
│   ├── family-adventures.png
│   └── ...
├── retro/
│   ├── retro-90s-cartoon.png
│   ├── vhs-nostalgia.png
│   └── ...
├── action/
│   ├── space-explorer.png
│   ├── pirate-captain.png
│   └── ...
├── cinematic/
│   ├── cyberpunk-neon.png
│   ├── super-athlete.png
│   └── ...
└── avengers/
    ├── iron-man.png
    ├── thor.png
    └── ...
```

## Folder Configuration

### Props Folders (`hero_props`)

Each folder corresponds to a prop category and has predefined positions where the props can be placed:

| Folder  | Category Name | Positions           |
| ------- | ------------- | ------------------- |
| `hands` | Hands         | leftHand, rightHand |
| `head`  | Head          | head                |
| `body`  | Body          | body                |
| `legs`  | Legs          | leftLeg, rightLeg   |

### Templates Folders (`hero_templates`)

Each folder corresponds to a template category:

| Folder      | Category Name        |
| ----------- | -------------------- |
| `playful`   | Playful & Emotional  |
| `retro`     | Retro & Nostalgic    |
| `action`    | Action & Adventure   |
| `cinematic` | Cinematic & Stylized |
| `avengers`  | Avengers             |

## Adding New Props

### Step 1: Prepare Your Image

1. Create a PNG, JPG, JPEG, or WEBP image
2. Use descriptive filenames with underscores or hyphens (e.g., `magic_wand.png`, `pirate-hat.png`)
3. The filename will be automatically converted to a user-friendly name:
   - `magic_wand.png` → "Magic Wand"
   - `pirate-hat.png` → "Pirate Hat"

### Step 2: Upload to Supabase Storage

1. Go to your Supabase Dashboard
2. Navigate to **Storage** → **hero_props** bucket
3. Select the appropriate category folder (hands, head, body, or legs)
4. Click **Upload File** and select your image
5. The image will be automatically available in the application!

### Step 3: Verify

1. Restart your development server (if running locally)
2. Navigate to the Generate page
3. The new prop should appear in the appropriate category

## Adding New Templates

### Step 1: Prepare Your Image

1. Create a PNG, JPG, JPEG, or WEBP image
2. Use descriptive filenames with hyphens (e.g., `birthday-hero.png`, `space-explorer.png`)
3. The filename will be automatically converted to a user-friendly name:
   - `birthday-hero.png` → "Birthday Hero"
   - `space-explorer.png` → "Space Explorer"

### Step 2: Upload to Supabase Storage

1. Go to your Supabase Dashboard
2. Navigate to **Storage** → **hero_templates** bucket
3. Select the appropriate category folder (playful, retro, action, cinematic, or avengers)
4. Click **Upload File** and select your image
5. The template will be automatically available in the application!

### Step 3: Verify

1. Restart your development server (if running locally)
2. Navigate to the Generate page
3. Click "Select Template"
4. The new template should appear in the appropriate category tab

## Image Requirements

- **Formats**: PNG, JPG, JPEG, WEBP
- **Naming**: Use descriptive names with underscores or hyphens
- **Organization**: Place in the correct category folder
- **Transparency**: PNG format recommended for props with transparency

## Adding New Categories

### Adding a New Prop Category

To add a new prop category (e.g., "accessories"):

1. Open `src/lib/propsLoader.ts`
2. Add a new entry to the `categoryConfig` object:

```typescript
accessories: {
  name: 'Accessories',
  iconName: 'accessories',
  positions: ['head', 'leftHand', 'rightHand'], // Define where this category can be placed
},
```

3. Create a new folder `accessories/` in the `hero_props` Supabase Storage bucket
4. Upload images to the new folder

### Adding a New Template Category

To add a new template category (e.g., "fantasy"):

1. Open `src/lib/templatesLoader.ts`
2. Add a new entry to the `categoryConfig` object:

```typescript
fantasy: {
  name: 'Fantasy & Magic',
},
```

3. Create a new folder `fantasy/` in the `hero_templates` Supabase Storage bucket
4. Upload template images to the new folder (e.g., `wizard.png`, `dragon-rider.png`)

## How It Works

The application uses server-side data fetching to load both props and templates:

1. **Server-Side Loading**: Props and templates are loaded from Supabase Storage when the Generate page loads
2. **Automatic Naming**: Filenames are automatically converted to user-friendly names:
   - Props: `magic_wand.png` → "Magic Wand"
   - Templates: `birthday-hero.png` → "Birthday Hero"
3. **Category Mapping**: Folders are mapped to categories with predefined positions/types
4. **No Code Changes**: Adding new props or templates only requires uploading images to Supabase Storage
5. **App-Level Loading**: A global loading screen appears while fetching data
6. **Parallel Loading**: Props and templates are loaded simultaneously for optimal performance

## Troubleshooting

### Props/Templates Not Showing Up

1. **Check Bucket Permissions**: Ensure both `hero_props` and `hero_templates` buckets are publicly accessible
2. **Verify Folder Structure**: Make sure images are in the correct category folders
3. **Check File Extensions**: Only PNG, JPG, JPEG, and WEBP are supported
4. **Verify Folder Names**: Folder names must match the category IDs in the loader configuration
5. **Restart Server**: Changes may require restarting the development/production server

### Service Role Key Missing

If you see an error about `SUPABASE_SERVICE_ROLE_KEY`:

1. Go to Supabase Dashboard → Settings → API
2. Copy the `service_role` key (keep it secret!)
3. Add to your `.env.local` file:
   ```
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

## Benefits

✅ **No Code Changes**: Add props and templates by simply uploading images
✅ **Automatic Organization**: Props and templates are automatically categorized
✅ **User-Friendly Names**: Filenames are converted to readable names automatically
✅ **Server-Side Loading**: Fast initial page load with server-side data fetching
✅ **Parallel Loading**: Props and templates load simultaneously for better performance
✅ **Scalable**: Easy to add dozens or hundreds of props and templates
✅ **Flexible Naming**: Supports both hyphens and underscores in filenames
