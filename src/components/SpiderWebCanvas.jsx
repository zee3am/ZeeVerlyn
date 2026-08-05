import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SpiderWebCanvas() {
  const canvasRef = useRef(null);
  const targetMouseRef = useRef({ x: -1000, y: -1000, active: false });
  const smoothMouseRef = useRef({ x: -1000, y: -1000 });
  const websRef = useRef([]);
  const [popups, setPopups] = useState([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initNodes();
    };

    window.addEventListener('resize', handleResize);

    // Responsive Web Nodes
    let nodes = [];
    const nodeCount = Math.floor((width * height) / 22000);

    function initNodes() {
      nodes = [];
      for (let i = 0; i < nodeCount; i++) {
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          radius: Math.random() * 2 + 1.2,
          color: i % 3 === 0 ? '#ff6fa5' : i % 3 === 1 ? '#00f0ff' : '#f4a6c1',
          anchorX: Math.random() * width,
          anchorY: Math.random() * height,
        });
      }
    }

    initNodes();

    // Smooth Mouse tracking with LERP
    const handleMouseMove = (e) => {
      targetMouseRef.current.x = e.clientX;
      targetMouseRef.current.y = e.clientY;
      targetMouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      targetMouseRef.current.active = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    // Web Shooter Click event
    const handleCanvasClick = (e) => {
      const targetTag = e.target.tagName.toLowerCase();
      if (['button', 'a', 'input', 'textarea', 'select'].includes(targetTag) || e.target.closest('button')) {
        return;
      }

      fireWebBurst(e.clientX, e.clientY);
    };

    window.addEventListener('click', handleCanvasClick);

    // Smooth Render Loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth LERP mouse coordinates for fluid web physics
      const sm = smoothMouseRef.current;
      const tm = targetMouseRef.current;
      sm.x += (tm.x - sm.x) * 0.15;
      sm.y += (tm.y - sm.y) * 0.15;

      // Render Nodes & Web Strands
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        node.x += node.vx;
        node.y += node.vy;

        // Bounce gently off boundaries
        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        // Node dot
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.shadowBlur = 4;
        ctx.shadowColor = node.color;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Connect Nodes with Curved Spider-Web Strands
        for (let j = i + 1; j < nodes.length; j++) {
          const node2 = nodes[j];
          const dx = node.x - node2.x;
          const dy = node.y - node2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 140) {
            const alpha = (1 - dist / 140) * 0.22;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);

            // Subtle curved web strand
            const cx = (node.x + node2.x) / 2 + (dy * 0.08);
            const cy = (node.y + node2.y) / 2 - (dx * 0.08);
            ctx.quadraticCurveTo(cx, cy, node2.x, node2.y);

            ctx.strokeStyle = `rgba(244, 166, 193, ${alpha})`;
            ctx.lineWidth = 0.9;
            ctx.stroke();
          }
        }

        // Fluid Mouse Web Thread connection
        if (tm.active) {
          const mDx = node.x - sm.x;
          const mDy = node.y - sm.y;
          const mDist = Math.sqrt(mDx * mDx + mDy * mDy);

          if (mDist < 200) {
            const alpha = (1 - mDist / 200) * 0.55;
            ctx.beginPath();
            ctx.moveTo(sm.x, sm.y);

            // Smooth elastic web curve to cursor
            const ctrlX = (sm.x + node.x) / 2 + Math.sin(Date.now() * 0.003 + i) * 12;
            const ctrlY = (sm.y + node.y) / 2 + Math.cos(Date.now() * 0.003 + i) * 12;

            ctx.quadraticCurveTo(ctrlX, ctrlY, node.x, node.y);
            ctx.strokeStyle = i % 2 === 0 ? `rgba(255, 111, 165, ${alpha})` : `rgba(0, 240, 255, ${alpha})`;
            ctx.lineWidth = 1.1;
            ctx.stroke();
          }
        }
      }

      // Render Active Click Web Bursts (THWIP effect)
      const now = Date.now();
      websRef.current = websRef.current.filter((web) => {
        const age = now - web.startTime;
        const progress = Math.min(age / web.duration, 1);
        if (progress >= 1) return false;

        // Smooth ease-out animation curve
        const easeProgress = Math.sin(progress * Math.PI * 0.5);
        const currentRadius = web.maxRadius * easeProgress;
        const opacity = 1 - progress;

        ctx.save();
        ctx.translate(web.x, web.y);

        // 8 Smooth Curved Web Strands
        const strands = 8;
        for (let s = 0; s < strands; s++) {
          const angle = (s * Math.PI * 2) / strands;
          const endX = Math.cos(angle) * currentRadius;
          const endY = Math.sin(angle) * currentRadius;

          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(endX, endY);
          ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.9})`;
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(endX, endY);
          ctx.strokeStyle = `rgba(255, 111, 165, ${opacity})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }

        // Concentric Curved Arcs
        const rings = 3;
        for (let r = 1; r <= rings; r++) {
          const ringRadius = (currentRadius / rings) * r;
          ctx.beginPath();
          for (let s = 0; s <= strands; s++) {
            const angle = (s * Math.PI * 2) / strands;
            const rx = Math.cos(angle) * ringRadius;
            const ry = Math.sin(angle) * ringRadius;

            if (s === 0) ctx.moveTo(rx, ry);
            else {
              const prevAngle = ((s - 1) * Math.PI * 2) / strands;
              const midAngle = (angle + prevAngle) / 2;
              const ctrlR = ringRadius * 0.85; // Inward curve for realistic web arc
              const cx = Math.cos(midAngle) * ctrlR;
              const cy = Math.sin(midAngle) * ctrlR;
              ctx.quadraticCurveTo(cx, cy, rx, ry);
            }
          }
          ctx.strokeStyle = `rgba(0, 240, 255, ${opacity * 0.75})`;
          ctx.lineWidth = 1.1;
          ctx.stroke();
        }

        ctx.restore();
        return true;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('click', handleCanvasClick);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const fireWebBurst = (x, y) => {
    websRef.current.push({
      x,
      y,
      maxRadius: Math.random() * 50 + 70,
      duration: 550,
      startTime: Date.now(),
    });

    const words = ['THWIP! 🕸️', 'LOVE WEB! 💕', 'SPIDER-SENSE! ⚡', 'ZIP! 🕸️', 'ZEEVERLYN! ✨'];
    const randomWord = words[Math.floor(Math.random() * words.length)];
    const newPopup = {
      id: Date.now() + Math.random(),
      x,
      y: y - 20,
      text: randomWord,
    };

    setPopups((prev) => [...prev.slice(-3), newPopup]);
    setTimeout(() => {
      setPopups((prev) => prev.filter((p) => p.id !== newPopup.id));
    }, 900);
  };

  const triggerManualThwip = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    for (let i = 0; i < 4; i++) {
      setTimeout(() => {
        fireWebBurst(
          Math.random() * (width - 200) + 100,
          Math.random() * (height - 200) + 100
        );
      }, i * 130);
    }
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-[15]"
        style={{ opacity: 0.85 }}
      />

      {/* Popups */}
      <div className="fixed inset-0 pointer-events-none z-[45]">
        <AnimatePresence>
          {popups.map((popup) => (
            <motion.div
              key={popup.id}
              initial={{ opacity: 0, scale: 0.4, y: popup.y, x: popup.x - 50, rotate: -6 }}
              animate={{ opacity: 1, scale: 1.1, y: popup.y - 35, rotate: 3 }}
              exit={{ opacity: 0, scale: 0.6, y: popup.y - 50 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="absolute bg-[#111111] text-[#00f0ff] font-[Anybody] font-black text-xs uppercase px-3 py-1.5 border-2 border-[#ff6fa5] comic-shadow-pink pointer-events-none"
            >
              {popup.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* THWIP Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        <motion.button
          whileHover={{ scale: 1.08, rotate: 3 }}
          whileTap={{ scale: 0.92 }}
          onClick={triggerManualThwip}
          className="group relative bg-[#ff6fa5] text-white font-[Anybody] font-black text-sm uppercase px-4 py-3 border-2 border-[#111111] rounded-full comic-shadow flex items-center gap-2 shadow-lg"
          title="Shoot Spider Webs!"
        >
          <span className="text-xl transition-transform group-hover:rotate-45 inline-block">
            🕸️
          </span>
          <span className="tracking-wider">THWIP!</span>
          <span className="bg-[#111111] text-[#00f0ff] text-[10px] px-1.5 py-0.5 rounded font-mono">
            WEB
          </span>
        </motion.button>
      </div>
    </>
  );
}
