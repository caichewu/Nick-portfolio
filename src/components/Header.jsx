
import React, { useState, useContext, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ThemeContext } from '../context/themeContext';
import { motion, AnimatePresence } from 'framer-motion';

const Header = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const MotionDiv = motion.div;
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const active = location.pathname === '/' ? 'home' : location.pathname.replace('/', '');
  const navRef = useRef(null);
  const portfolioRef = useRef(null);
  const skillsRef = useRef(null);
  const experienceRef = useRef(null);
  const notesRef = useRef(null);
  const contactRef = useRef(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0, visible: false });

  const moveIndicatorToEl = useCallback((el) => {
    const nav = navRef.current;
    if (!el || !nav) return;
    const navRect = nav.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    setIndicator({
      left: elRect.left - navRect.left,
      width: elRect.width,
      visible: true,
    });
  }, []);

  const getActiveEl = useCallback(() => {
    if (active === 'portfolio') return portfolioRef.current;
    if (active === 'skills') return skillsRef.current;
    if (active === 'experience') return experienceRef.current;
    if (active === 'notes') return notesRef.current;
    if (active === 'contact') return contactRef.current;
    return null;
  }, [active]);

  useEffect(() => {
    const el = getActiveEl();
    if (!el) {
      const id = requestAnimationFrame(() => setIndicator((s) => ({ ...s, visible: false })));
      return () => cancelAnimationFrame(id);
    }
    const id = requestAnimationFrame(() => moveIndicatorToEl(el));
    return () => cancelAnimationFrame(id);
  }, [active, getActiveEl, moveIndicatorToEl]);

  useEffect(() => {
    const onResize = () => {
      const el = getActiveEl();
      if (el) moveIndicatorToEl(el);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [getActiveEl, moveIndicatorToEl]);

  const menuVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <header className="bg-dark-card/70 backdrop-blur-[8px] sticky top-0 z-50 border-b border-ui-border shadow-md transition-colors duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <button
          type="button"
          className="text-2xl font-bold text-primary drop-shadow-glow"
          onClick={() => navigate('/')}
          aria-label="返回首页"
        >
          MyPortfolio
        </button>
        
        {/* Desktop Menu */}
        <div ref={navRef} className="hidden md:flex items-center space-x-6 relative">
          {indicator.visible && (
            <span
              className="absolute -bottom-1 h-[2px] bg-primary transition-all duration-300"
              style={{ left: indicator.left, width: indicator.width }}
            />
          )}
          <a
            ref={portfolioRef}
            href="/portfolio"
            onClick={(e) => {
              e.preventDefault();
              navigate('/portfolio');
            }}
            onMouseEnter={(e) => moveIndicatorToEl(e.currentTarget)}
            onMouseLeave={() => {
              const el = getActiveEl();
              if (el) moveIndicatorToEl(el);
            }}
            className={`relative transition-colors ${active==='portfolio' ? 'text-primary' : 'text-dark-subtext hover:text-primary'}`}
          >
            作品
          </a>
          <a
            ref={skillsRef}
            href="/skills"
            onClick={(e) => {
              e.preventDefault();
              navigate('/skills');
            }}
            onMouseEnter={(e) => moveIndicatorToEl(e.currentTarget)}
            onMouseLeave={() => {
              const el = getActiveEl();
              if (el) moveIndicatorToEl(el);
            }}
            className={`relative transition-colors ${active==='skills' ? 'text-primary' : 'text-dark-subtext hover:text-primary'}`}
          >
            技能
          </a>
          <a
            ref={experienceRef}
            href="/experience"
            onClick={(e) => {
              e.preventDefault();
              navigate('/experience');
            }}
            onMouseEnter={(e) => moveIndicatorToEl(e.currentTarget)}
            onMouseLeave={() => {
              const el = getActiveEl();
              if (el) moveIndicatorToEl(el);
            }}
            className={`relative transition-colors ${active==='experience' ? 'text-primary' : 'text-dark-subtext hover:text-primary'}`}
          >
            经验
          </a>
          <a
            ref={notesRef}
            href="/notes"
            onClick={(e) => {
              e.preventDefault();
              navigate('/notes');
            }}
            onMouseEnter={(e) => moveIndicatorToEl(e.currentTarget)}
            onMouseLeave={() => {
              const el = getActiveEl();
              if (el) moveIndicatorToEl(el);
            }}
            className={`relative transition-colors ${active==='notes' ? 'text-primary' : 'text-dark-subtext hover:text-primary'}`}
          >
            碎碎念
          </a>
          <a
            ref={contactRef}
            href="/contact"
            onClick={(e) => {
              e.preventDefault();
              navigate('/contact');
            }}
            onMouseEnter={(e) => moveIndicatorToEl(e.currentTarget)}
            onMouseLeave={() => {
              const el = getActiveEl();
              if (el) moveIndicatorToEl(el);
            }}
            className={`relative transition-colors ${active==='contact' ? 'text-primary' : 'text-dark-subtext hover:text-primary'}`}
          >
            联系
          </a>
          <button 
            onClick={toggleTheme} 
            className="px-3 py-2 rounded-md ui-btn focus:outline-none"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>

        {/* Mobile Menu Button & Theme Toggle */}
        <div className="md:hidden flex items-center space-x-4">
          <button 
            onClick={toggleTheme} 
            className="p-2 rounded-md ui-btn focus:outline-none"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="p-2 rounded-md ui-btn focus:outline-none"
            aria-label="Open menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={!isOpen ? "M4 6h16M4 12h16m-7 6h7" : "M6 18L18 6M6 6l12 12"} />
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <MotionDiv 
            className="md:hidden bg-dark-card/90 backdrop-blur-[8px] absolute w-full shadow-lg border-b border-ui-border"
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <button
              type="button"
              className="block w-full text-left py-3 px-6 text-dark-subtext hover:text-primary underline decoration-transparent hover:decoration-primary underline-offset-8"
              onClick={() => {
                setIsOpen(false);
                navigate('/portfolio');
              }}
            >
              作品
            </button>
            <button
              type="button"
              className="block w-full text-left py-3 px-6 text-dark-subtext hover:text-primary underline decoration-transparent hover:decoration-primary underline-offset-8"
              onClick={() => {
                setIsOpen(false);
                navigate('/skills');
              }}
            >
              技能
            </button>
            <button
              type="button"
              className="block w-full text-left py-3 px-6 text-dark-subtext hover:text-primary underline decoration-transparent hover:decoration-primary underline-offset-8"
              onClick={() => {
                setIsOpen(false);
                navigate('/experience');
              }}
            >
              经验
            </button>
            <button
              type="button"
              className="block w-full text-left py-3 px-6 text-dark-subtext hover:text-primary underline decoration-transparent hover:decoration-primary underline-offset-8"
              onClick={() => {
                setIsOpen(false);
                navigate('/notes');
              }}
            >
              碎碎念
            </button>
            <button
              type="button"
              className="block w-full text-left py-3 px-6 text-dark-subtext hover:text-primary underline decoration-transparent hover:decoration-primary underline-offset-8"
              onClick={() => {
                setIsOpen(false);
                navigate('/contact');
              }}
            >
              联系
            </button>
          </MotionDiv>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
