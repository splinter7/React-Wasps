/**
 * Particle animation script – canvas-based floating particles.
 * Uses requestAnimationFrame to update and draw particles.
 */

const DEFAULT_OPTIONS = {
  count: 20,
  minSize: 0.8,
  maxSize: 2.2,
  minSpeed: -0.5,
  maxSpeed: 0.5,
  colors: [[255, 255, 255, 1]],
  glowBlur: 10,
  repulsionRadius: 120,
  repulsionStrength: 2,
  maxSpeedFlee: 1.8,
  slowdownRate: 0.04,
  particleRepulsionRadius: 28,
  particleRepulsionStrength: 0.6,
};

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function createParticle(width, height, options) {
  const { minSize, maxSize, minSpeed, maxSpeed, colors } = options;
  const size = randomBetween(minSize, maxSize);
  const color = colors[Math.floor(Math.random() * colors.length)];
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    vx: randomBetween(minSpeed, maxSpeed),
    vy: randomBetween(minSpeed, maxSpeed),
    size,
    color,
  };
}

export function createParticleAnimation(canvas, userOptions = {}) {
  const options = { ...DEFAULT_OPTIONS, ...userOptions };
  const ctx = canvas.getContext("2d");
  let width = canvas.width;
  let height = canvas.height;
  let particles = [];
  let rafId = null;
  const mouse = { x: null, y: null };

  function handleMouseMove(e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  }

  function initParticles() {
    particles = [];
    for (let i = 0; i < options.count; i++) {
      particles.push(createParticle(width, height, options));
    }
  }

  function resize(w, h) {
    width = w;
    height = h;
    canvas.width = width;
    canvas.height = height;
    initParticles();
  }

  function applyRepulsion(p, ox, oy, radius, strength) {
    const dx = p.x - ox, dy = p.y - oy;
    const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
    if (dist >= radius) return;
    const factor = (1 - dist / radius) * strength;
    p.vx += (dx / dist) * factor;
    p.vy += (dy / dist) * factor;
  }

  function wrap(p) {
    if (p.x < -p.size) p.x = width + p.size;
    if (p.x > width + p.size) p.x = -p.size;
    if (p.y < -p.size) p.y = height + p.size;
    if (p.y > height + p.size) p.y = -p.size;
  }

  function update() {
    const {
      repulsionRadius: radius = 120,
      repulsionStrength: strength = 2,
      maxSpeedFlee: maxFlee = 1.8,
      slowdownRate = 0.04,
      particleRepulsionRadius: particleRadius = 28,
      particleRepulsionStrength: particleStrength = 0.6,
    } = options;
    const baseMaxSpeed = Math.abs(options.maxSpeed ?? 0.5);

    const cellSize = Math.max(1, particleRadius);
    const key = (cx, cy) => `${cx},${cy}`;
    const grid = new Map();
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const k = key(Math.floor(p.x / cellSize), Math.floor(p.y / cellSize));
      if (!grid.has(k)) grid.set(k, []);
      grid.get(k).push(i);
    }

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const cx = Math.floor(p.x / cellSize), cy = Math.floor(p.y / cellSize);
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          const cell = grid.get(key(cx + dx, cy + dy));
          if (!cell) continue;
          for (let k = 0; k < cell.length; k++) {
            const j = cell[k];
            if (i === j) continue;
            applyRepulsion(p, particles[j].x, particles[j].y, particleRadius, particleStrength);
          }
        }
      }
      let inRepulsionZone = false;
      if (mouse.x != null && mouse.y != null) {
        const dx = p.x - mouse.x, dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
        inRepulsionZone = dist < radius;
        applyRepulsion(p, mouse.x, mouse.y, radius, strength);
      }
      let speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (inRepulsionZone && speed > maxFlee) {
        p.vx = (p.vx / speed) * maxFlee;
        p.vy = (p.vy / speed) * maxFlee;
      } else if (!inRepulsionZone && speed > baseMaxSpeed) {
        const newSpeed = speed + (baseMaxSpeed - speed) * slowdownRate;
        p.vx *= newSpeed / speed;
        p.vy *= newSpeed / speed;
      }
      p.x += p.vx;
      p.y += p.vy;
      wrap(p);
    }
  }

  function draw() {
    if (!ctx) return;
    const glowBlur = options.glowBlur ?? 10;
    ctx.clearRect(0, 0, width, height);
    for (const p of particles) {
      ctx.save();
      ctx.shadowColor = `rgba(255, 255, 255, ${p.color[3]})`;
      ctx.shadowBlur = glowBlur;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color[0]}, ${p.color[1]}, ${p.color[2]}, ${p.color[3]})`;
      ctx.fill();
      ctx.restore();
    }
  }

  function tick() {
    update();
    draw();
    rafId = requestAnimationFrame(tick);
  }

  function start() {
    if (!particles.length) initParticles();
    window.addEventListener("mousemove", handleMouseMove);
    rafId = requestAnimationFrame(tick);
  }

  function stop() {
    window.removeEventListener("mousemove", handleMouseMove);
    if (rafId != null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  resize(width, height);

  return {
    start,
    stop,
    resize,
    initParticles,
  };
}
