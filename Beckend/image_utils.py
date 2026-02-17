import os
import io
from imagekitio import AsyncImageKit
from dotenv import load_dotenv
from PIL import Image
import logging
import anyio

logger = logging.getLogger(__name__)

load_dotenv()

imagekit = AsyncImageKit(
    private_key=os.getenv("IMAGEKIT_PRIVATE_KEY"),
    timeout=300.0,
    max_retries=0
)

def compress_image(file_content, quality=75):
    """
    Compresses image to JPEG with specified quality.
    """
    try:
        img = Image.open(io.BytesIO(file_content))
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")
        
        # Max dimensions 3000px
        if img.width > 3000 or img.height > 3000:
            img.thumbnail((3000, 3000), Image.Resampling.LANCZOS)
            
        output = io.BytesIO()
        img.save(output, format="JPEG", quality=quality, optimize=True)
        return output.getvalue()
    except Exception as e:
        logger.error(f"Compression error: {e}")
        return file_content

def apply_watermark(file_content):
    """
    Applies logo.png as a watermark to the bottom-right corner of the image.
    """
    try:
        # Load the uploaded image
        img = Image.open(io.BytesIO(file_content))
        
        # Ensure it's in RGBA for transparency support during pasting if needed
        if img.mode != 'RGBA':
            img = img.convert('RGBA')
            
        # Keep original size unless it's excessively large (safety measure)
        if img.width > 4000 or img.height > 4000:
            img.thumbnail((4000, 4000), Image.Resampling.LANCZOS)
            
        # Load logo
        logo_path = os.path.join(os.path.dirname(__file__), "logo.png")
        if not os.path.exists(logo_path):
            print(f"Logo not found at {logo_path}, skipping watermark.")
            # Still save with lower quality to compress
            output = io.BytesIO()
            img = img.convert('RGB')
            img.save(output, format="JPEG", quality=70, optimize=True)
            return output.getvalue()
            
        logo = Image.open(logo_path)
        
        # Resize logo to be roughly 15% of the image width
        target_width = int(img.width * 0.15)
        w_percent = (target_width / float(logo.size[0]))
        target_height = int((float(logo.size[1]) * float(w_percent)))
        logo = logo.resize((target_width, target_height), Image.Resampling.LANCZOS)
        
        # Position: Bottom Right with 20px padding
        padding = 20
        position = (img.width - logo.width - padding, img.height - logo.height - padding)
        
        # Paste logo (use logo as its own mask if it has transparency)
        img.paste(logo, position, logo if 'A' in logo.getbands() else None)
        
        # Convert back to RGB for saving (JPEG doesn't support transparency)
        img = img.convert('RGB')
        
        # Save to buffer with optimized settings
        output = io.BytesIO()
        img.save(output, format="JPEG", quality=75, optimize=True, subsampling=0)
        return output.getvalue()
        
    except Exception as e:
        logger.error(f"Watermark error: {e}")
        return file_content

async def upload_image(file_content, file_name, folder="/megastroy", apply_logo=False):
    """
    Uploads a file to ImageKit and returns the URL.
    """
    try:
        # Compress image to optimize upload speed (essential for large PNGs/JPEGs)
        file_content = await anyio.to_thread.run_sync(compress_image, file_content)

        # Apply watermark if requested
        if apply_logo:
            # Run watermark (CPU intensive) in a separate thread to avoid blocking loop
            file_content = await anyio.to_thread.run_sync(apply_watermark, file_content)

        size_kb = len(file_content) / 1024
        logger.info(f"Starting ImageKit upload for {file_name} (Size: {size_kb:.2f} KB)...")
        upload = await imagekit.files.upload(
            file=file_content,
            file_name=file_name,
            folder=folder,
            use_unique_file_name=True
        )
        logger.info(f"ImageKit upload successful for {file_name}: {upload.url}")
        return upload.url
    except Exception as e:
        logger.error(f"ImageKit upload error: {e}", exc_info=True)
        return None

async def delete_image(file_id):
    """
    Deletes an image from ImageKit.
    """
    try:
        await imagekit.files.delete(file_id)
        return True
    except Exception as e:
        logger.error(f"ImageKit delete error: {e}")
        return False
