'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

import { useRouter } from '@bprogress/next';
import { motion } from 'motion/react';

export const MotionContainer = ({ children, className }) => {
  const router = useRouter();
  const path = usePathname();
  const [loading, setLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      let foundTarget = target;

      if (target.tagName.toLowerCase() !== 'a' && target.tagName.toLowerCase() !== 'button') {
        const closestAnchor = target.closest('a');
        if (closestAnchor) {
          foundTarget = closestAnchor;
        }
      }
      const lcTagName = foundTarget.tagName.toLowerCase();

      if (lcTagName === 'a' || lcTagName === 'button') {
        const href = foundTarget.getAttribute('href');
        if (href && href.startsWith('/')) {
          e.preventDefault();
          if (href !== path) {
            setLoading(true);
          }
          router.push(href);
        }
      }
    };

    window.addEventListener('click', onClick);
    return () => window.removeEventListener('click', onClick);
  }, [router, path]);

  useEffect(() => {
    // window.scrollTo(0, 0);
    setLoading(false);
    setIsInitialLoading(false);
  }, [path]);

  return (
    <motion.main
      className={className}
      style={{ height: '100%' }}
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: !isInitialLoading && loading ? 0 : 1,
      }}
      transition={{
        type: 'spring',
        duration: 0.25,
      }}
    >
      {children}
    </motion.main>
  );
};
