from PIL import Image
import os

def resize_icon(source, target, size):
    with Image.open(source) as img:
        # Create a square background if needed, or just resize
        # For our case, we'll just resize to the target size
        img = img.convert("RGBA")
        # If it's not square, paste it onto a square canvas
        if img.width != img.height:
            new_size = max(img.width, img.height)
            new_img = Image.new("RGBA", (new_size, new_size), (0, 0, 0, 0))
            new_img.paste(img, ((new_size - img.width) // 2, (new_size - img.height) // 2))
            img = new_img
        
        resized = img.resize((size, size), Image.Resampling.LANCZOS)
        resized.save(target)
        print(f"Saved {target} ({size}x{size})")

def resize_splash(source, target, width, height, bg_color=(255, 255, 255)): # White #FFFFFF
    with Image.open(source) as img:
        img = img.convert("RGBA")
        
        # Create full splash canvas
        splash = Image.new("RGB", (width, height), bg_color)
        
        # Resize logo to fit nicely (e.g. 50% of splash width for enter.png)
        logo_width = int(width * 0.5)
        aspect_ratio = img.height / img.width
        logo_height = int(logo_width * aspect_ratio)
        
        logo_resized = img.resize((logo_width, logo_height), Image.Resampling.LANCZOS)
        
        # Paste logo in center
        paste_pos = ((width - logo_width) // 2, (height - logo_height) // 2)
        splash.paste(logo_resized, paste_pos, logo_resized)
        
        splash.save(target)
        print(f"Saved {target} ({width}x{height})")

if __name__ == "__main__":
    assets_dir = "c:/Users/king/Desktop/yangiUstalar/MobileApp/assets"
    icon_src = os.path.join(assets_dir, "icon.png")
    splash_src = os.path.join(assets_dir, "enter.png")
    
    # 1. Main Icon (1024x1024)
    resize_icon(icon_src, os.path.join(assets_dir, "app-icon.png"), 1024)
    
    # 2. Adaptive Icon (1024x1024)
    resize_icon(icon_src, os.path.join(assets_dir, "adaptive-icon-new.png"), 1024)
    
    # 3. Splash Screen (1242x2436)
    resize_splash(splash_src, os.path.join(assets_dir, "splash-new.png"), 1242, 2436)
    
    # 4. Favicon (for web)
    resize_icon(icon_src, os.path.join("c:/Users/king/Desktop/yangiUstalar/Frontend/public", "favicon.png"), 64)
