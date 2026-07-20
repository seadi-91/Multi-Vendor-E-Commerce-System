# FarmConnect Video Instructions

## Video File Setup

To display your FarmConnect introduction video on the homepage, follow these steps:

### 1. Video File Requirements
- **Filename**: `farmconnect-intro.mp4`
- **Location**: Place the video in `client/public/assets/` folder
- **Format**: MP4 (H.264 codec recommended for best browser compatibility)
- **Recommended Specifications**:
  - Resolution: 1920x1080 (Full HD) or higher
  - Aspect Ratio: 16:9
  - Duration: 30-60 seconds (will loop automatically)
  - File Size: Under 10MB for optimal loading
  - Frame Rate: 30fps or 60fps

### 2. Video Content Suggestions
Your video should showcase:
- Fresh produce and farm scenes
- Farmers working in fields
- Happy customers receiving deliveries
- The FarmConnect platform/app interface
- Community and sustainability themes

### 3. Video Placement
1. Place your video file at: `client/public/assets/farmconnect-intro.mp4`
2. The video will automatically:
   - Autoplay when the homepage loads
   - Loop continuously
   - Play muted (to comply with browser autoplay policies)
   - Have a fallback image if video fails to load

### 4. Testing Your Video
After placing the video:
1. Restart your development server
2. Navigate to the homepage
3. The video should start playing automatically in the hero section

### 5. Fallback Image
If no video is available, a default farm image will display instead.

### 6. Alternative Video Sources
If you don't have a video yet, you can:
- Use stock footage from sites like Pexels or Unsplash (video section)
- Create a simple slideshow video using Canva or similar tools
- Record footage at local farms
- Use AI video generation tools

### 7. Update Video Path
If you want to use a different filename or location, update line in `Home.jsx`:
```javascript
<source src="/assets/your-video-name.mp4" type="video/mp4" />
```

---

**Note**: Make sure your video follows copyright and licensing requirements.
