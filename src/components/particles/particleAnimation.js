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

  function update() {
    const radius = options.repulsionRadius ?? 120;
    const strength = options.repulsionStrength ?? 2;
    const maxFlee = options.maxSpeedFlee ?? 1.8;
    const baseMaxSpeed = Math.abs(options.maxSpeed);
    const slowdownRate = options.slowdownRate ?? 0.04;
    const particleRadius = options.particleRepulsionRadius ?? 28;
    const particleStrength = options.particleRepulsionStrength ?? 0.6;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      for (let j = 0; j < particles.length; j++) {
        if (i === j) continue;
        const other = particles[j];
        const dx = p.x - other.x;
        const dy = p.y - other.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
        if (dist < particleRadius) {
          const factor = (1 - dist / particleRadius) * particleStrength;
          const ux = dx / dist;
          const uy = dy / dist;
          p.vx += ux * factor;
          p.vy += uy * factor;
        }
      }
      let inRepulsionZone = false;
      if (mouse.x != null && mouse.y != null) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
        if (dist < radius) {
          inRepulsionZone = true;
          const factor = (1 - dist / radius) * strength;
          const ux = dx / dist;
          const uy = dy / dist;
          p.vx += ux * factor;
          p.vy += uy * factor;
        }
      }
      let speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (inRepulsionZone && speed > maxFlee) {
        p.vx = (p.vx / speed) * maxFlee;
        p.vy = (p.vy / speed) * maxFlee;
        speed = maxFlee;
      } else if (!inRepulsionZone && speed > baseMaxSpeed) {
        const targetSpeed = baseMaxSpeed;
        const newSpeed = speed + (targetSpeed - speed) * slowdownRate;
        const scale = newSpeed / speed;
        p.vx *= scale;
        p.vy *= scale;
        speed = newSpeed;
      }
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < -p.size) p.x = width + p.size;
      if (p.x > width + p.size) p.x = -p.size;
      if (p.y < -p.size) p.y = height + p.size;
      if (p.y > height + p.size) p.y = -p.size;
    }
  }

  function draw() {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const glowBlur = options.glowBlur ?? 10;
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
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
