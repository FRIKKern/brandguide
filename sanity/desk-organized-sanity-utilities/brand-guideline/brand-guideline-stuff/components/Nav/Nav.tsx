"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Interface for SubPage
interface SubPage {
  _key?: string;
  title?: string;
  components?: any[];
}

// Interface for Nav props
interface NavProps {
  logo?: string;
  subPages?: SubPage[]; // Add subPages prop
}

const Nav: React.FC<NavProps> = ({ logo, subPages = [] }) => {
  const hasLogo = logo && logo.length > 0;
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const pathname = usePathname();
  const scrollTimerRef = useRef<number | null>(null);
  const isManualNavRef = useRef<boolean>(false);

  // Helper to debounce scroll events
  const debounce = (func: Function, delay: number) => {
    if (scrollTimerRef.current) {
      clearTimeout(scrollTimerRef.current);
    }
    scrollTimerRef.current = window.setTimeout(func, delay);
  };

  // Track active section based on scroll position and URL hash
  useEffect(() => {
    if (!subPages?.length) return;

    // Update active section based on scroll position
    const handleScroll = () => {
      // Skip scroll detection if the user just clicked a navigation link
      if (isManualNavRef.current) {
        return;
      }

      debounce(() => {
        const scrollPosition = window.scrollY + 150; // Offset for better trigger point

        // Get all section elements
        const sections = subPages.map(subPage => 
          document.getElementById(`section-${subPage._key || subPage.title?.replace(/\s+/g, '-').toLowerCase()}`)
        ).filter(Boolean);

        // Find the current active section
        for (let i = sections.length - 1; i >= 0; i--) {
          const section = sections[i];
          if (!section) continue;
          
          const sectionTop = section.offsetTop;
          
          if (scrollPosition >= sectionTop) {
            const id = section.getAttribute('id')?.replace('section-', '') || null;
            if (activeSection !== id) {
              setActiveSection(id);
            }
            break;
          }
        }
      }, 100); // Debounce scroll events by 100ms
    };

    // Update active section when URL hash changes
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        const sectionKey = hash.replace('section-', '');
        setActiveSection(sectionKey);
        
        // Set flag to ignore scroll events briefly after hash change
        isManualNavRef.current = true;
        setTimeout(() => {
          isManualNavRef.current = false;
        }, 1000); // Ignore scroll events for 1 second after hash change
      } else if (subPages.length > 0) {
        // Set first section as active if no hash
        const firstSectionKey = subPages[0]?._key || 
          subPages[0]?.title?.replace(/\s+/g, '-').toLowerCase();
        setActiveSection(firstSectionKey);
      }
    };

    // Initial checks
    handleHashChange();
    handleScroll();

    // Set up event listeners
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      if (scrollTimerRef.current) {
        clearTimeout(scrollTimerRef.current);
      }
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [subPages]); // Remove activeSection dependency to prevent re-running

  // Handle manual navigation click
  const handleNavClick = (sectionKey: string) => {
    setActiveSection(sectionKey);
    isManualNavRef.current = true;
    setTimeout(() => {
      isManualNavRef.current = false;
    }, 1000);
  };

  // Sidebar navigation styles - improved sticky positioning
  const sidebarClasses = 'sticky top-20 flex flex-col space-y-4 h-full max-h-[calc(100vh-6rem)] overflow-y-auto pr-2';

  return (
    <>
      {/* Side Navigation for SubPages */}
      <div className={sidebarClasses}>
        {subPages?.length > 0 && (
          <nav className="space-y-3">
            <h3 className="font-light text-lg mb-4 uppercase tracking-normal font-[Aker_Brygge_Display]">Innhold</h3>
            <div className="space-y-2 border-l border-black pl-3">
              {subPages.map((subPage, index) => {
                if (!subPage.title) return null;
                
                const sectionKey = subPage._key || subPage.title.replace(/\s+/g, '-').toLowerCase();
                const sectionId = `section-${sectionKey}`;
                const isActive = activeSection === sectionKey;
                
                return (
                  <Link
                    key={sectionKey || index}
                    href={`${pathname}#${sectionId}`}
                    className={`block w-full text-left px-3 py-2 transition-colors duration-200 flex items-center ${
                      isActive 
                        ? 'text-[#3A66F8] font-normal' 
                        : 'hover:text-[#3A66F8] text-black'
                    }`}
                    onClick={() => handleNavClick(sectionKey)}
                  >
                    <span className={`inline-flex justify-center items-center w-6 h-6 rounded-full ${
                      isActive 
                        ? 'bg-[#3A66F8] text-white' 
                        : 'bg-[#EFE3D3] text-black'
                    } text-xs font-normal mr-3`}>
                      {index + 1}
                    </span>
                    <span className="flex-1">{subPage.title}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        )}
      </div>
    </>
  );
};

export default Nav; 