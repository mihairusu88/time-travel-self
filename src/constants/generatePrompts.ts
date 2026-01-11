export interface PromptTemplate {
  id: string
  name: string
  emoji: string
  prompt: string
}

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'custom',
    name: 'Custom Prompt',
    emoji: '✍️',
    prompt: '',
  },
  {
    id: 'hyper-realistic',
    name: 'Hyper-realistic',
    emoji: '✨',
    prompt:
      'Generate a hyper-realistic, fashion-style photo with strong, direct flash lighting, grainy texture, and a cool, confident pose.',
  },
  {
    id: 'superhero',
    name: 'Epic Superhero',
    emoji: '🦸',
    prompt:
      'Create a photorealistic, cinematic superhero composite. Use the face image to preserve identity. Place head accessories naturally on head, body items on torso, hand props in hands, and leg items on feet. Use dramatic lighting, epic background with explosions or fantasy setting, dynamic pose, motion blur, and vivid colors. Ultra high quality, perfect blending, sharp details.',
  },
  {
    id: 'action-hero',
    name: 'Action Hero',
    emoji: '💥',
    prompt:
      'Transform into an action movie hero with explosive background, dramatic lighting, intense pose, and cinematic effects. Make it look like a blockbuster movie poster with perfect face preservation and seamless prop integration.',
  },
  {
    id: 'fantasy-warrior',
    name: 'Fantasy Warrior',
    emoji: '⚔️',
    prompt:
      'Create an epic fantasy warrior scene with medieval or magical setting. Add mystical lighting, fantasy landscape background, heroic battle-ready pose. Integrate all props naturally - weapons in hands, armor on body, helmet on head. Photorealistic with fantasy art style.',
  },
  {
    id: 'space-explorer',
    name: 'Space Explorer',
    emoji: '🚀',
    prompt:
      'Transform into a space explorer or astronaut. Futuristic sci-fi background with stars, planets, or space station. High-tech equipment and props integrated naturally. Cinematic lighting with lens flares, dramatic pose, photorealistic quality.',
  },
  {
    id: 'retro-hero',
    name: 'Retro Hero',
    emoji: '📺',
    prompt:
      'Create a retro 80s/90s style hero image with vintage aesthetics. Add VHS effects, nostalgic color grading, classic action pose. Integrate props with retro styling. Make it look like a classic action figure or vintage poster.',
  },
  {
    id: 'anime-style',
    name: 'Anime Style',
    emoji: '🎌',
    prompt:
      'Transform into anime/manga style character while preserving facial features. Dynamic anime pose, vibrant colors, dramatic background with speed lines or energy effects. Integrate props in anime aesthetic. Semi-realistic anime art style.',
  },
  {
    id: 'comic-book',
    name: 'Comic Book',
    emoji: '💢',
    prompt:
      'Create a comic book style hero image with bold colors, dramatic shadows, and dynamic pose. Add comic-style background elements, action lines, and dramatic lighting. Integrate all props naturally while maintaining comic art aesthetic.',
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    emoji: '🌃',
    prompt:
      'Transform into a cyberpunk character with neon-lit futuristic city background. Add cybernetic enhancements, neon lighting, rain effects, and high-tech props. Dramatic pose with cinematic depth, vibrant neon colors.',
  },
  {
    id: 'steampunk',
    name: 'Steampunk',
    emoji: '⚙️',
    prompt:
      'Create a steampunk adventurer with Victorian-era industrial aesthetic. Brass and copper tones, steam effects, mechanical props, vintage clothing. Dramatic lighting with warm tones, intricate details, photorealistic quality.',
  },
  {
    id: 'pirate-captain',
    name: 'Pirate Captain',
    emoji: '🏴‍☠️',
    prompt:
      'Transform into a legendary pirate captain on the high seas. Dramatic ocean background with ship, treasure, or island. Integrate pirate props naturally - sword in hand, hat on head, boots on feet. Cinematic lighting with dramatic sky.',
  },
  {
    id: 'medieval-knight',
    name: 'Medieval Knight',
    emoji: '🛡️',
    prompt:
      'Create a medieval knight in shining armor. Castle or battlefield background, dramatic medieval setting. Integrate armor, weapons, and medieval props naturally. Heroic pose with cinematic lighting, photorealistic quality.',
  },
  {
    id: 'wild-west',
    name: 'Wild West',
    emoji: '🤠',
    prompt:
      'Transform into a Wild West gunslinger or cowboy. Desert landscape or old western town background. Integrate western props - hat, boots, weapons. Dramatic sunset lighting, dusty atmosphere, cinematic western movie style.',
  },
  {
    id: 'samurai',
    name: 'Samurai Warrior',
    emoji: '🗾',
    prompt:
      'Create a legendary samurai warrior in traditional Japanese setting. Cherry blossoms, temple, or battlefield background. Integrate katana, armor, and traditional props naturally. Dramatic lighting with Japanese aesthetic, photorealistic quality.',
  },
  {
    id: 'rockstar',
    name: 'Rockstar',
    emoji: '🎸',
    prompt:
      'Transform into a rockstar performer on stage. Concert venue background with dramatic stage lighting, crowd, pyrotechnics. Integrate music props and accessories naturally. Dynamic performance pose, vibrant colors, photorealistic quality.',
  },
  {
    id: 'athlete',
    name: 'Super Athlete',
    emoji: '🏆',
    prompt:
      'Create a super athlete in action. Stadium or sports arena background with dramatic lighting and crowd. Integrate sports equipment and props naturally. Dynamic athletic pose with motion blur, photorealistic quality.',
  },
  {
    id: 'movie-poster',
    name: 'Movie Poster',
    emoji: '🎬',
    prompt:
      'Transform into a movie poster hero with cinematic composition. Dramatic lighting, epic background, professional poster layout. Integrate all props naturally. Make it look like a blockbuster movie poster with perfect composition.',
  },
]

// Legacy prompts for backward compatibility
export const GENERATE_PROMPTS = {
  default: `
Create a photorealistic, funny, and cinematic superhero-style composite using all provided images. 
Each image belongs to a specific body region group (head, body, hands, legs). 
Use these logical groupings to decide placement — not the filenames.

REQUIRED ELEMENTS:
- Face: Use the provided face image to preserve the person’s identity (can enhance expression for humor).
- Head Group: Place all images from this group naturally around or on the head (e.g., hats, helmets, crowns, goggles, glasses, etc.).
- Body Group: Place all images from this group logically on the torso (e.g., belts, shirts, armor, jackets, vests, accessories).
- Left Hand Group: Attach items from this group to or near the left hand (e.g., objects being held, props, weapons, funny gadgets).
- Right Hand Group: Attach items from this group to or near the right hand (same logic as left hand).
- Left Leg Group: Place items from this group on or near the left leg or foot (e.g., shoes, boots, pants, armor).
- Right Leg Group: Place items from this group on or near the right leg or foot.
- Use the hero body base image as the main figure.

CREATIVE FREEDOM:
- Choose any funny, exaggerated superhero or fantasy pose.
- Background: cinematic, dramatic, or humorous (chaotic scene, fantasy world, comic explosion, etc.).
- Enhance composition with dramatic lighting, wind, motion blur, and vivid colors.
- Maintain a cohesive, seamless photorealistic look.

TECHNICAL QUALITY:
- Ultra high quality, photorealistic rendering.
- Perfect blending between all image layers.
- Sharp details, vibrant tones, 3D cinematic depth.

GOAL:
Make a creative, funny superhero image that clearly shows the user's face and logically arranges all items by their body region group.

negative_prompt: "distorted face, mismatched props, misplaced body parts, bad blending, boring background, nudity, text overlays, offensive content"
  `,
}
