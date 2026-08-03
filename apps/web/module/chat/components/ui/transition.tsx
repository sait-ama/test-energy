import React, { ReactNode, useEffect, useRef, useState } from 'react';

import { cn } from '@re/ui-kit/utils/cn';

import styles from '../../styles/transitions.module.css';

export type AnimationName =
  | 'none'
  | 'fade'
  | 'slide'
  | 'slideRtl'
  | 'slideFade'
  | 'slideVertical'
  | 'scaleDownFromTop'
  | 'scaleUpFromBottom'
  | 'zoomFade'
  | 'zoomFadeBackwards';

export interface TransitionProps {
  children: ReactNode;
  name?: AnimationName;
  direction?: 'auto' | 'inverse' | 1 | -1;
  className?: string;
  slideClassName?: string;
  onStart?: () => void;
  onStop?: () => void;
  shouldRestoreHeight?: boolean;
  shouldDisableAnimation?: boolean;
  timeout?: number;
}

const DEFAULT_ANIMATION_TIMEOUT = 250;

const Transition: React.FC<TransitionProps> = ({
  children,
  name = 'none',
  direction = 'auto',
  className,
  slideClassName,
  onStart,
  onStop,
  shouldRestoreHeight = false,
  shouldDisableAnimation = false,
  timeout = DEFAULT_ANIMATION_TIMEOUT,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [prevChildren, setPrevChildren] = useState<ReactNode | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [activeClasses, setActiveClasses] = useState(false);
  const [currentDirection, setCurrentDirection] = useState<'forward' | 'backward'>(
    direction === -1 || direction === 'inverse' ? 'backward' : 'forward'
  );
  const [currentKey, setCurrentKey] = useState(0);

  // Обновляем currentDirection, когда меняется direction
  useEffect(() => {
    setCurrentDirection(direction === -1 || direction === 'inverse' ? 'backward' : 'forward');
  }, [direction]);

  // Функция для получения CSS-класса анимации
  const getAnimationClass = (isOld: boolean, isActive: boolean = false) => {
    if (shouldDisableAnimation || name === 'none') {
      return '';
    }

    const directionSuffix = currentDirection === 'backward' ? 'Backwards' : '';
    const baseClass = directionSuffix ? `${name}${directionSuffix}` : name;

    if (isOld) {
      // Анимация выхода для старого элемента
      return isActive
        ? styles[`${baseClass}ExitActive`] || styles.exitActive
        : styles[`${baseClass}Exit`] || styles.exit;
    } else {
      // Анимация входа для нового элемента
      return isActive
        ? styles[`${baseClass}EnterActive`] || styles.enterActive
        : styles[`${baseClass}Enter`] || styles.enter;
    }
  };

  // Обработка изменения children
  useEffect(() => {
    if (prevChildren === children) {
      return;
    }

    if (prevChildren !== null) {
      // Определяем направление
      let newDirection: 'forward' | 'backward' = 'forward';

      if (direction === -1) {
        newDirection = 'backward';
      } else if (direction === 1) {
        newDirection = 'forward';
      } else if (direction === 'inverse') {
        newDirection = 'backward';
      } else {
        newDirection = 'forward';
      }

      setCurrentDirection(newDirection);
      setIsAnimating(true);
      setActiveClasses(false);
      setCurrentKey((prev) => prev + 1);

      if (onStart) {
        onStart();
      }

      // Добавляем активные классы с небольшой задержкой
      // Это нужно, чтобы браузер успел применить начальные стили перед анимацией
      setTimeout(() => {
        setActiveClasses(true);
      }, 20);

      // Обработчик изменения высоты контейнера
      const handleHeightChange = () => {
        if (shouldRestoreHeight && containerRef.current) {
          const oldHeight = containerRef.current.offsetHeight;
          containerRef.current.style.height = `${oldHeight}px`;
          containerRef.current.style.overflow = 'hidden';

          // Через небольшую задержку анимируем до новой высоты
          requestAnimationFrame(() => {
            if (!containerRef.current) return;

            const elements = containerRef.current.querySelectorAll(`.${styles.slide}`);
            const newChild = elements[0] as HTMLElement;

            if (newChild) {
              const newHeight = newChild.offsetHeight;
              containerRef.current.style.transition = `height ${timeout}ms ease-out`;
              containerRef.current.style.height = `${newHeight}px`;

              // По окончании анимации сбрасываем стили
              setTimeout(() => {
                if (!containerRef.current) return;
                containerRef.current.style.height = 'auto';
                containerRef.current.style.transition = '';
                containerRef.current.style.overflow = '';
              }, timeout);
            }
          });
        }
      };

      handleHeightChange();

      // Заканчиваем анимацию через timeout
      setTimeout(() => {
        setIsAnimating(false);
        setActiveClasses(false);
        if (onStop) {
          onStop();
        }
      }, timeout);
    }

    setPrevChildren(children);
  }, [children, direction, shouldRestoreHeight, timeout, name, onStart, onStop]);

  return (
    <div ref={containerRef} className={cn(styles.container, className)}>
      {/* Новый элемент */}
      <div
        key={currentKey}
        className={cn(
          styles.slide,
          slideClassName,
          isAnimating && getAnimationClass(false),
          isAnimating && activeClasses && getAnimationClass(false, true)
        )}
        style={{
          zIndex: 2, // Новый элемент всегда сверху
        }}
      >
        {children}
      </div>

      {/* Предыдущий элемент (показывается только при анимации) */}
      {isAnimating && prevChildren !== null && prevChildren !== children && (
        <div
          key={`prev-${currentKey}`}
          className={cn(
            styles.slide,
            slideClassName,
            getAnimationClass(true),
            activeClasses && getAnimationClass(true, true)
          )}
          style={{
            zIndex: 1, // Старый элемент всегда снизу
          }}
        >
          {prevChildren}
        </div>
      )}
    </div>
  );
};

export { Transition };
