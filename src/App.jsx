import React, { useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Outlet, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Background from './components/Background';
import Footer from './components/Footer';
import BackToTop from './components/BackToTop';
import HomePage from './pages/HomePage';
import PortfolioPage from './pages/PortfolioPage';
import SkillsPage from './pages/SkillsPage';
import ContactPage from './pages/ContactPage';
import ExperiencePage from './pages/ExperiencePage';
import NotesPage from './pages/NotesPage';
import NotFoundPage from './pages/NotFoundPage';

const RouteGlow = () => {
  const overlayRef = useRef(null);
  const dotRef = useRef(null);
  const tailRef = useRef(null);

  useEffect(() => {
    const overlay = overlayRef.current;
    const dot = dotRef.current;
    const tail = tailRef.current;
    if (!overlay || !dot || !tail) return undefined;

    let targetX = window.innerWidth * 0.55;
    let targetY = window.innerHeight * 0.35;
    let x = targetX;
    let y = targetY;
    let tx = x;
    let ty = y;
    let vx = 0;
    let vy = 0;
    let running = true;

    const onMove = (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
    };

    const onClick = (e) => {
      const ring = document.createElement('span');
      ring.style.position = 'absolute';
      ring.style.left = `${e.clientX}px`;
      ring.style.top = `${e.clientY}px`;
      ring.style.width = '10px';
      ring.style.height = '10px';
      ring.style.border = '1px solid rgba(57,255,20,0.7)';
      ring.style.borderRadius = '9999px';
      ring.style.transform = 'translate(-50%, -50%) scale(0.7)';
      ring.style.opacity = '1';
      ring.style.transition = 'transform 650ms cubic-bezier(0.22,1,0.36,1), opacity 650ms linear';
      overlay.appendChild(ring);
      requestAnimationFrame(() => {
        ring.style.transform = 'translate(-50%, -50%) scale(7)';
        ring.style.opacity = '0';
      });
      setTimeout(() => {
        if (overlay.contains(ring)) overlay.removeChild(ring);
      }, 700);
    };

    const loop = () => {
      vx += (targetX - x) * 0.12;
      vy += (targetY - y) * 0.12;
      vx *= 0.8;
      vy *= 0.8;
      x += vx;
      y += vy;

      dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      tx += (x - tx) * 0.1;
      ty += (y - ty) * 0.1;
      tail.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;

      const px = Math.min(100, Math.max(0, (x / Math.max(1, window.innerWidth)) * 100));
      const py = Math.min(100, Math.max(0, (y / Math.max(1, window.innerHeight)) * 100));
      overlay.style.setProperty('--px', `${px}%`);
      overlay.style.setProperty('--py', `${py}%`);

      if (running) requestAnimationFrame(loop);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('click', onClick);
    requestAnimationFrame(loop);

    return () => {
      running = false;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('click', onClick);
    };
  }, []);

  return (
    <div
      ref={overlayRef}
      className="pointer-events-none fixed inset-0 z-0"
      style={{ '--px': '60%', '--py': '50%' }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 60% at var(--px) var(--py), rgba(168,85,247,0.35) 0%, rgba(0,0,0,0) 60%), radial-gradient(50% 50% at calc(100% - var(--px)) var(--py), rgba(59,130,246,0.25) 0%, rgba(0,0,0,0) 60%)',
          filter: 'blur(20px)',
        }}
      />
      <div ref={dotRef} className="absolute w-8 h-8 rounded-full" style={{ transform: 'translate3d(50px, 50px, 0)' }}>
        <div className="w-full h-full rounded-full" style={{ background: '#39FF14' }} />
      </div>
      <div ref={tailRef} className="absolute w-5 h-5 rounded-full opacity-70" style={{ transform: 'translate3d(50px, 50px, 0)' }}>
        <div className="w-full h-full rounded-full" style={{ background: 'rgba(57,255,20,0.5)', filter: 'blur(2px)' }} />
      </div>
    </div>
  );
};

const Layout = () => {
  const location = useLocation();

  return (
    <div className="text-light-text dark:text-dark-text font-sans transition-colors duration-300 ease-in-out">
      {location.pathname === '/' ? <Background /> : null}
      <RouteGlow />
      <Header />
      <div className="relative z-10">
        <main>
          <Outlet />
        </main>
        <Footer />
        <BackToTop />
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/skills" element={<SkillsPage />} />
          <Route path="/experience" element={<ExperiencePage />} />
          <Route path="/notes" element={<NotesPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
