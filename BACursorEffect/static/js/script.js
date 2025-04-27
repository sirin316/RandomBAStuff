// BA trail effect
// Created by (Sirin)

// Main config object (atur sesuai selera wkwk) ==================================
const config = {
    trail: {
        maxPoints: 15,
        width: 10,
        fadeDuration: 50,
        idleThreshold: 10
    },
    triangles: {
        count: 1,
        minSize: 4,
        maxSize: 9,
        maxDistance: 80,
        rotationSpeed: 0.1,
        spawnChance: 0.4,
        solidChance: 0.3,
        duration: 1.0
    },
    clickEffects: {
        circles: {
            maxSize: 60,
            fadeDuration: 0.5,
            count: 8
        },
        triangles: {
            count: 3,
            maxDistance: 150,
            duration: 0.8
        }
    },
    colors: {
        basecolor: { 
            r: 150, 
            g: 255, 
            b: 255,
            a: 0.5 
        }
    }
};

// canvas
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// variables
let trailPoints = [];
let triangles = [];
let clickEffects = [];
let lastMouseMoveTime = 0;
let animationFrameId;

// initialize effect
function init() {
    setupCanvas();
    setupEventListeners();
    startAnimation();
}

// dimensi kanvas
function setupCanvas() {
    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    resize();
    
    window.addEventListener('resize', () => {
        resize();
    });
}

// anim loop
function startAnimation() {
    function animate() {
        clearCanvas();
        drawTrail();
        drawTriangles();
        drawClickEffects();
        animationFrameId = requestAnimationFrame(animate);
    }
    
    animate();
}

// Clear canvas
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// timestamp
function getCurrentTime() {
    return performance.now();
}

// ease
function smoothEaseOut(t) {
    return 1 - Math.pow(1 - t, 2);
}

// trail
function drawTrail() {
    if (trailPoints.length < 2) return;
    
    const currentTime = getCurrentTime();
    const isCursorStopped = (currentTime - lastMouseMoveTime) > config.trail.idleThreshold;
    const color = config.colors.basecolor;
    
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowBlur = 15;
    
    // munculin trail
    for (let i = 0; i < trailPoints.length - 1; i++) {
        const progress = i / trailPoints.length;
        const width = config.trail.width * (1 - progress);
        const alpha = (isCursorStopped ? 
            1 - (currentTime - lastMouseMoveTime) / config.trail.fadeDuration : 1) * color.a;
        
        ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
        ctx.shadowColor = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha * 0.7})`;
        ctx.lineWidth = width;
        
        ctx.beginPath();
        ctx.moveTo(trailPoints[i].x, trailPoints[i].y);
        ctx.lineTo(trailPoints[i+1].x, trailPoints[i+1].y);
        ctx.stroke();
    }
    
    ctx.shadowBlur = 0;
    
    // hilangin jejak
    if (isCursorStopped) {
        trailPoints = trailPoints.filter(point => 
            (currentTime - point.time) < config.trail.fadeDuration
        );
    }
}

// efek segitiga
function drawTriangles() {
    const currentTime = getCurrentTime();
    const color = config.colors.basecolor;
    
    triangles.forEach(triangle => {
        const { x, y, size, baseAngle, rotationSpeed, startTime, isSolid } = triangle;
        const elapsed = (currentTime - startTime) / 1000;
        const progress = Math.min(elapsed / config.triangles.duration, 1);
        const easedProgress = smoothEaseOut(progress);
        
        // posisi
        const distance = config.triangles.maxDistance * easedProgress;
        const angle = baseAngle + (rotationSpeed * elapsed * 3);
        const currentX = x + Math.cos(baseAngle) * distance;
        const currentY = y + Math.sin(baseAngle) * distance;
        
        // muncul
        ctx.beginPath();
        ctx.moveTo(
            currentX + Math.cos(angle) * size * 2,
            currentY + Math.sin(angle) * size * 2
        );
        ctx.lineTo(
            currentX + Math.cos(angle + Math.PI * 2/3) * size * 2,
            currentY + Math.sin(angle + Math.PI * 2/3) * size * 2
        );
        ctx.lineTo(
            currentX + Math.cos(angle - Math.PI * 2/3) * size * 2,
            currentY + Math.sin(angle - Math.PI * 2/3) * size * 2
        );
        ctx.closePath();
        
        const opacity = 0.7 * (1 - progress) * color.a;
        ctx.shadowBlur = 10;
        ctx.shadowColor = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity * 0.5})`;
        
        if (isSolid) {
            ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`;
            ctx.fill();
        } else {
            ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }
    });
    
    // hilangin segitiga
    triangles = triangles.filter(t => 
        (currentTime - t.startTime) / 1000 < config.triangles.duration
    );
}

// klik
function drawClickEffects() {
    const currentTime = getCurrentTime();
    const color = config.colors.basecolor;
    
    clickEffects.forEach(effect => {
        const { x, y, type, startTime, size, angle, distance } = effect;
        const elapsed = (currentTime - startTime) / 1000;
        
        // lingkaran
        if (type === 'circle') {
            const progress = Math.min(elapsed / config.clickEffects.circles.fadeDuration, 1);
            const currentSize = size + (config.clickEffects.circles.maxSize * smoothEaseOut(progress));
            const opacity = (1 - progress) * color.a;
            
            ctx.beginPath();
            ctx.arc(x, y, currentSize, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`;
            ctx.lineWidth = 2;
            ctx.stroke();
        } 
        // segitiga
        else if (type === 'triangle') {
            const progress = Math.min(elapsed / config.clickEffects.triangles.duration, 1);
            const easedProgress = smoothEaseOut(progress);
            const currentDistance = distance * easedProgress;
            const currentX = x + Math.cos(angle) * currentDistance;
            const currentY = y + Math.sin(angle) * currentDistance;
            const rotation = angle + (elapsed * 2);
            const opacity = 0.8 * (1 - progress) * color.a;
            
            ctx.beginPath();
            ctx.moveTo(
                currentX + Math.cos(rotation) * size * 2,
                currentY + Math.sin(rotation) * size * 2
            );
            ctx.lineTo(
                currentX + Math.cos(rotation + Math.PI * 2/3) * size * 2,
                currentY + Math.sin(rotation + Math.PI * 2/3) * size * 2
            );
            ctx.lineTo(
                currentX + Math.cos(rotation - Math.PI * 2/3) * size * 2,
                currentY + Math.sin(rotation - Math.PI * 2/3) * size * 2
            );
            ctx.closePath();
            
            ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }
    });
    
    // Clean up finished effects
    clickEffects = clickEffects.filter(effect => {
        const elapsed = (currentTime - effect.startTime) / 1000;
        return (effect.type === 'circle' && elapsed < config.clickEffects.circles.fadeDuration) ||
               (effect.type === 'triangle' && elapsed < config.clickEffects.triangles.duration);
    });
}

// Handle mouse move
function handleMouseMove(e) {
    lastMouseMoveTime = getCurrentTime();
    
    trailPoints.unshift({ 
        x: e.clientX, 
        y: e.clientY, 
        time: lastMouseMoveTime 
    });
    
    if (trailPoints.length > config.trail.maxPoints) {
        trailPoints.pop();
    }
    
    // Spawn segitiga
    if (trailPoints.length > 3 && Math.random() < config.triangles.spawnChance) {
        for (let i = 0; i < config.triangles.count; i++) {
            const trailIndex = Math.floor(Math.random() * Math.min(5, trailPoints.length));
            const spawnPoint = trailPoints[trailIndex];
            
            triangles.push({
                x: spawnPoint.x,
                y: spawnPoint.y,
                size: Math.random() * (config.triangles.maxSize - config.triangles.minSize) + config.triangles.minSize,
                baseAngle: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * config.triangles.rotationSpeed,
                startTime: lastMouseMoveTime,
                isSolid: Math.random() < config.triangles.solidChance
            });
        }
    }
}

// Handle mouse klik
function handleClick(e) {
    const now = getCurrentTime();
    const color = config.colors.basecolor;
    
    // circle effects
    for (let i = 0; i < config.clickEffects.circles.count; i++) {
        clickEffects.push({
            x: e.clientX,
            y: e.clientY,
            type: 'circle',
            startTime: now,
            size: Math.random() * 3
        });
    }
    
    // triangle effects
    for (let i = 0; i < config.clickEffects.triangles.count; i++) {
        clickEffects.push({
            x: e.clientX,
            y: e.clientY,
            type: 'triangle',
            startTime: now,
            size: 3 + Math.random() * 4,
            angle: Math.random() * Math.PI * 2,
            distance: 30 + Math.random() * config.clickEffects.triangles.maxDistance
        });
    }
}

// Set up event
function setupEventListeners() {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('click', handleClick);
    
    // Clean up
    window.addEventListener('beforeunload', () => {
        cancelAnimationFrame(animationFrameId);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('click', handleClick);
        window.removeEventListener('resize', setupCanvas);
    });
}

document.addEventListener('DOMContentLoaded', init);