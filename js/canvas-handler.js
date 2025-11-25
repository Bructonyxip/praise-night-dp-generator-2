/**
 * MATEPLUX DP GENERATOR - CANVAS HANDLER (PERFECTLY POSITIONED)
 * Mateplux Media Systems Ltd.
 * Coordinates matched to your exact frame template
 */

class DPCanvasHandler {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d', { alpha: false });
        
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // PERFECTLY MATCHED to your frame template
this.config = {
    photo: {
        centerX: this.width * 0.674,   // Perfect horizontal alignment
        centerY: this.height * 0.3696, // From tested result 367.2 px
        radius: this.width * 0.23      // Clean circle crop based on test
    },
    name: {
        centerX: this.width * 0.69,    // Alignment matched to photo
        centerY: this.height * 0.615,  // Mid-point between 0.58 and 0.63
        maxWidth: this.width * 0.338,  // Good readable space
        fontSize: { min: 38, max: 52 }
    }
};

        
        this.userImage = null;
        this.frameImage = null;
        this.userName = '';
        this.imageZoom = 1;
        this.imagePosX = 0;
        this.imagePosY = 0;
        
        this.setupHighDPI();
    }

    setupHighDPI() {
        const dpr = window.devicePixelRatio || 1;
        if (dpr > 1) {
            const rect = this.canvas.getBoundingClientRect();
            this.canvas.width = rect.width * dpr;
            this.canvas.height = rect.height * dpr;
            this.ctx.scale(dpr, dpr);
            this.canvas.style.width = rect.width + 'px';
            this.canvas.style.height = rect.height + 'px';
        }
    }

    loadFrame() {
        return new Promise((resolve) => {
            this.frameImage = new Image();
            
            this.frameImage.onload = () => {
                console.log('✅ FRAME LOADED SUCCESSFULLY!');
                this.draw();
                resolve(true);
            };
            
            this.frameImage.onerror = (error) => {
                console.error('❌ FRAME FAILED TO LOAD:', error);
                this.drawError('Failed to load frame template');
                resolve(false);
            };
            
            const basePath = window.location.origin + window.location.pathname.replace(/\/$/, '');
            this.frameImage.src = basePath + '/assets/images/frame.png';
            
            console.log('🔄 Loading frame from:', this.frameImage.src);
        });
    }

    setUserImage(image) {
        this.userImage = image;
        console.log('📸 User image set:', image.width, 'x', image.height);
        this.draw();
    }

    setUserName(name) {
        this.userName = name.trim().substring(0, 25);
        console.log('✏️ User name set:', this.userName);
        this.draw();
    }

    setImageZoom(zoom) {
        this.imageZoom = parseFloat(zoom);
        this.draw();
    }

    setImagePosition(x, y) {
        this.imagePosX = parseInt(x);
        this.imagePosY = parseInt(y);
        this.draw();
    }

    resetAdjustments() {
        this.imageZoom = 1;
        this.imagePosX = 0;
        this.imagePosY = 0;
        this.draw();
    }

    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // White background
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // IMPORTANT: Draw in correct order
        // 1. Draw frame FIRST (as background)
        if (this.frameImage) {
            this.drawFrame();
        }

        // 2. Draw user photo SECOND (on top of frame, inside the circle area)
        if (this.userImage) {
            this.drawUserPhoto();
        } else {
            this.drawPhotoPlaceholder();
        }

        // 3. Draw user name LAST (on top of everything)
        if (this.userName) {
            this.drawUserName();
        }
    }

    drawFrame() {
        this.ctx.save();
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';
        // Draw the frame at full size
        this.ctx.drawImage(this.frameImage, 0, 0, this.width, this.height);
        this.ctx.restore();
        console.log('🖼️ Frame drawn');
    }

    drawUserPhoto() {
        const { centerX, centerY, radius } = this.config.photo;

        this.ctx.save();
        
        // Create circular clipping path to match the white circle on frame
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.closePath();
        this.ctx.clip();

        // Calculate scaling to fill the circle completely
        const scale = Math.max(
            (radius * 2) / this.userImage.width,
            (radius * 2) / this.userImage.height
        ) * this.imageZoom;

        const imgWidth = this.userImage.width * scale;
        const imgHeight = this.userImage.height * scale;
        const imgX = centerX - imgWidth / 2 + this.imagePosX;
        const imgY = centerY - imgHeight / 2 + this.imagePosY;

        // Draw the photo
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';
        this.ctx.drawImage(this.userImage, imgX, imgY, imgWidth, imgHeight);
        
        this.ctx.restore();
        
        console.log('📸 Photo drawn at:', centerX, centerY, 'radius:', radius);
    }

    drawPhotoPlaceholder() {
        const { centerX, centerY, radius } = this.config.photo;

        this.ctx.save();
        
        // Draw a subtle circle outline
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.stroke();

        // Placeholder text
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.font = 'bold 32px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('Your Photo', centerX, centerY - 12);
        this.ctx.font = '24px Arial';
        this.ctx.fillText('Here', centerX, centerY + 18);
        
        this.ctx.restore();
    }

    drawUserName() {
        if (!this.userName) return;

        const { centerX, centerY, maxWidth, fontSize } = this.config.name;

        this.ctx.save();
        
        // Black text (to show on white box)
        this.ctx.fillStyle = '#000000';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        // Calculate optimal font size based on name length
        let size = fontSize.max;
        const nameLength = this.userName.length;
        
        if (nameLength > 10) size = 48;
        if (nameLength > 14) size = 42;
        if (nameLength > 18) size = 36;
        if (nameLength > 22) size = fontSize.min;

        this.ctx.font = `bold ${size}px Arial, sans-serif`;
        
        // Measure text width and shrink if needed
        let textWidth = this.ctx.measureText(this.userName.toUpperCase()).width;
        
        while (textWidth > maxWidth && size > fontSize.min) {
            size -= 1;
            this.ctx.font = `bold ${size}px Arial, sans-serif`;
            textWidth = this.ctx.measureText(this.userName.toUpperCase()).width;
        }

        // Add shadow for better visibility
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
        this.ctx.shadowBlur = 2;
        this.ctx.shadowOffsetX = 1;
        this.ctx.shadowOffsetY = 1;

        // Draw the name in UPPERCASE
        this.ctx.fillText(this.userName.toUpperCase(), centerX, centerY, maxWidth);
        
        this.ctx.restore();
        
        console.log('✅ Name drawn at:', centerX, centerY, 'Size:', size, 'Text:', this.userName);
    }

    drawError(message) {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.fillStyle = '#1a0a3e';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        this.ctx.fillStyle = '#ef4444';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('Error', this.width / 2, this.height / 2 - 40);
        
        this.ctx.font = '24px Arial';
        this.ctx.fillStyle = '#9370DB';
        this.ctx.fillText(message, this.width / 2, this.height / 2 + 20);
    }

    isReadyForDownload() {
        return this.userImage !== null && this.frameImage !== null;
    }

    reset() {
        this.userImage = null;
        this.userName = '';
        this.imageZoom = 1;
        this.imagePosX = 0;
        this.imagePosY = 0;
        this.draw();
    }

    getStats() {
        return {
            hasImage: this.userImage !== null,
            hasFrame: this.frameImage !== null,
            hasName: this.userName.length > 0,
            zoom: this.imageZoom,
            position: { x: this.imagePosX, y: this.imagePosY },
            config: this.config
        };
    }

    // Fine-tune positions if needed
    adjustPositions(photoX, photoY, photoRadius, nameY) {
        if (photoX) this.config.photo.centerX = this.width * photoX;
        if (photoY) this.config.photo.centerY = this.height * photoY;
        if (photoRadius) this.config.photo.radius = this.width * photoRadius;
        if (nameY) this.config.name.centerY = this.height * nameY;
        
        this.draw();
        console.log('🔧 Positions adjusted:', this.config);
    }
}

function initializeCanvas(canvasId = 'dpCanvas') {
    const handler = new DPCanvasHandler(canvasId);
    
    // Make adjustment function globally available for easy testing
    window.adjustDP = function(photoX, photoY, photoRadius, nameY) {
        handler.adjustPositions(photoX, photoY, photoRadius, nameY);
        console.log('Current config:', handler.config);
    };
    
    return handler;
}

if (typeof window !== 'undefined') {
    window.DPCanvasHandler = DPCanvasHandler;
    window.initializeCanvas = initializeCanvas;
}



