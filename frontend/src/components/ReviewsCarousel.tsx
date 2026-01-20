import { useEffect, useRef, useState, useCallback } from "react";
import "./ReviewsCarousel.css";
import { Review } from "../api";
import { ReviewCard } from "./ReviewCard";
import btnL from "../../assets/btn-l.png";
import btnLHover from "../../assets/btn-l-h.png";
import btnR from "../../assets/btn-r.png";
import btnRHover from "../../assets/btn-r-h.png";

interface Props {
  reviews: Review[];
}

const AUTO_SCROLL_DELAY = 3000;
const SWIPE_THRESHOLD = 50;
const DRAG_THRESHOLD = 30;

export const ReviewsCarousel = ({ reviews }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isHoveringLeft, setIsHoveringLeft] = useState(false);
  const [isHoveringRight, setIsHoveringRight] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const isSwiping = useRef(false);
  const dragStartX = useRef(0);
  const dragCurrentX = useRef(0);
  const autoScrollTimer = useRef<NodeJS.Timeout | null>(null);
  const isInteracting = useRef(false);
  const lastTransitionTime = useRef<number>(0);
  const TRANSITION_DELAY = 500; // Время анимации в ms

  // Если нет отзывов
  if (!reviews || reviews.length === 0) {
    return (
      <div className="carousel-wrapper">
        <div className="no-reviews-message">No reviews to display</div>
      </div>
    );
  }

  // Создаем расширенный массив для бесконечной прокрутки
  const items = [
    reviews[reviews.length - 1], // Клонируем последний слайд в начало
    ...reviews,
    reviews[0], // Клонируем первый слайд в конец
  ];

  // Начинаем с индекса 1 (первый реальный слайд)
  const [currentIndex, setCurrentIndex] = useState(1);
  const totalSlides = items.length;

  // Получаем ширину карточки и отступы в зависимости от экрана
  const getCardDimensions = () => {
    if (!containerRef.current) return { width: 360, gap: 20 };

    const containerWidth = containerRef.current.clientWidth;

    if (containerWidth < 768) {
      return { width: 280, gap: 16 };
    } else if (containerWidth < 1024) {
      return { width: 320, gap: 18 };
    } else if (containerWidth < 1440) {
      return { width: 360, gap: 20 };
    } else {
      return { width: 400, gap: 24 };
    }
  };

  // Вычисляем смещение для центрирования
  const getTransform = useCallback(() => {
    const containerWidth = containerRef.current?.clientWidth || 0;
    const { width: cardWidth, gap } = getCardDimensions();
    const slideWidth = cardWidth + gap;

    // Центрируем активный слайд
    const centerOffset = (containerWidth / 2) - (cardWidth / 2);
    const translateX = centerOffset - (currentIndex * slideWidth);

    return { translateX, cardWidth, slideWidth };
  }, [currentIndex]);

  // Переход к следующему слайду
  const goToNext = useCallback(() => {
    const now = Date.now();
    if (now - lastTransitionTime.current < TRANSITION_DELAY) return;

    setIsTransitioning(true);
    lastTransitionTime.current = now;

    setCurrentIndex(prev => {
      return prev + 1;
    });
  }, []);

  // Переход к предыдущему слайду
  const goToPrev = useCallback(() => {
    const now = Date.now();
    if (now - lastTransitionTime.current < TRANSITION_DELAY) return;

    setIsTransitioning(true);
    lastTransitionTime.current = now;

    setCurrentIndex(prev => {
      return prev - 1;
    });
  }, []);

  // Переход к конкретному слайду
  const goToSlide = useCallback((index: number) => {
    const now = Date.now();
    if (now - lastTransitionTime.current < TRANSITION_DELAY) return;

    setIsTransitioning(true);
    lastTransitionTime.current = now;

    setCurrentIndex(index + 1);
  }, []);

  // Обработка перехода на клонированные слайды
  useEffect(() => {
    if (!isTransitioning) return;

    const timer = setTimeout(() => {
      setIsTransitioning(false);

      // Если достигли клонированного первого слайда (индекс 0)
      if (currentIndex === 0) {
        // Мгновенно переходим к последнему реальному слайду
        trackRef.current!.style.transition = 'none';
        setCurrentIndex(reviews.length);

        // Даем React обновить DOM, затем восстанавливаем transition
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            trackRef.current!.style.transition = '';
          });
        });
      }
      // Если достигли клонированного последнего слайда (индекс totalSlides - 1)
      else if (currentIndex === totalSlides - 1) {
        // Мгновенно переходим к первому реальному слайду
        trackRef.current!.style.transition = 'none';
        setCurrentIndex(1);

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            trackRef.current!.style.transition = '';
          });
        });
      }
    }, TRANSITION_DELAY);

    return () => clearTimeout(timer);
  }, [currentIndex, totalSlides, reviews.length, isTransitioning]);

  // Автопрокрутка
  useEffect(() => {
    if (isPaused || reviews.length <= 1 || isInteracting.current) return;

    if (autoScrollTimer.current) {
      clearInterval(autoScrollTimer.current);
    }

    autoScrollTimer.current = setInterval(() => {
      goToNext();
    }, AUTO_SCROLL_DELAY);

    return () => {
      if (autoScrollTimer.current) {
        clearInterval(autoScrollTimer.current);
      }
    };
  }, [isPaused, goToNext, reviews.length]);

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    isSwiping.current = true;
    isInteracting.current = true;
    setIsPaused(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping.current) return;
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!isSwiping.current) return;

    const distance = touchStartX.current - touchEndX.current;

    if (Math.abs(distance) > SWIPE_THRESHOLD) {
      if (distance > 0) {
        goToNext();
      } else {
        goToPrev();
      }
    }

    isSwiping.current = false;
    // Не сбрасываем isInteracting сразу - подождем немного
    setTimeout(() => {
      isInteracting.current = false;
      setIsPaused(false);
    }, 1000);
  };

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    dragStartX.current = e.clientX;
    isSwiping.current = true;
    isInteracting.current = true;
    setIsPaused(true);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isSwiping.current) return;
      dragCurrentX.current = moveEvent.clientX;
    };

    const handleMouseUp = () => {
      if (!isSwiping.current) return;

      const distance = dragStartX.current - dragCurrentX.current;

      if (Math.abs(distance) > DRAG_THRESHOLD) {
        if (distance > 0) {
          goToNext();
        } else {
          goToPrev();
        }
      }

      isSwiping.current = false;
      // Не сбрасываем isInteracting сразу - подождем немного
      setTimeout(() => {
        isInteracting.current = false;
        setIsPaused(false);
      }, 1000);

      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Определяем реальный индекс для индикаторов
  const getRealIndex = () => {
    if (currentIndex === 0) return reviews.length - 1;
    if (currentIndex === totalSlides - 1) return 0;
    return currentIndex - 1;
  };

  const realIndex = getRealIndex();
  const { translateX, cardWidth, slideWidth } = getTransform();

  return (
    <div
      className="carousel-wrapper"
      ref={containerRef}
      onMouseEnter={() => {
        setIsPaused(true);
        isInteracting.current = true;
      }}
      onMouseLeave={() => {
        setIsPaused(false);
        isInteracting.current = false;
        setIsHoveringLeft(false);
        setIsHoveringRight(false);
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
    >
      <div className="carousel-container">
        <div
          className="carousel-track"
          ref={trackRef}
          style={{
            transform: `translateX(${translateX}px)`,
            transition: isTransitioning ? `transform ${TRANSITION_DELAY}ms ease` : 'none',
          }}
        >
          {items.map((review, index) => {
            // Определяем позицию относительно активного слайда
            const position = index - currentIndex;

            // Определяем класс в зависимости от позиции
            let cardClass = 'far';
            if (position === 0) {
              cardClass = 'center';
            } else if (Math.abs(position) === 1) {
              cardClass = 'side';
            }

            // Используем индекс для ключа, так как у нас могут быть дубликаты
            const isClone = index === 0 || index === items.length - 1;
            const key = isClone ? `${review.id}-clone-${index}` : `${review.id}-${index}`;

            return (
              <div
                key={key}
                className={`carousel-card-wrapper ${cardClass}`}
                style={{
                  width: `${cardWidth}px`,
                  margin: `0 ${slideWidth / 2 - cardWidth / 2}px`,
                }}
              >
                <ReviewCard review={review} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Кнопки навигации - всегда внизу справа */}
      <div className="carousel-controls-bottom">
        <button
          className="carousel-button"
          onClick={() => {
            isInteracting.current = true;
            setIsPaused(true);
            goToPrev();
            // Возобновляем автопрокрутку через секунду
            setTimeout(() => {
              isInteracting.current = false;
              setIsPaused(false);
            }, 1000);
          }}
          onMouseEnter={() => setIsHoveringLeft(true)}
          onMouseLeave={() => setIsHoveringLeft(false)}
          aria-label="Previous review"
        >
          <img
            src={isHoveringLeft ? btnLHover : btnL}
            alt="Previous"
            className="carousel-button-icon"
          />
        </button>

        <button
          className="carousel-button"
          onClick={() => {
            isInteracting.current = true;
            setIsPaused(true);
            goToNext();
            // Возобновляем автопрокрутку через секунду
            setTimeout(() => {
              isInteracting.current = false;
              setIsPaused(false);
            }, 1000);
          }}
          onMouseEnter={() => setIsHoveringRight(true)}
          onMouseLeave={() => setIsHoveringRight(false)}
          aria-label="Next review"
        >
          <img
            src={isHoveringRight ? btnRHover : btnR}
            alt="Next"
            className="carousel-button-icon"
          />
        </button>
      </div>

      {/* Индикаторы прогресса */}
      <div className="carousel-indicators">
        {reviews.map((_, index) => (
          <button
            key={index}
            className={`carousel-indicator ${index === realIndex ? 'active' : ''}`}
            onClick={() => {
              isInteracting.current = true;
              setIsPaused(true);
              goToSlide(index);
              // Возобновляем автопрокрутку через секунду
              setTimeout(() => {
                isInteracting.current = false;
                setIsPaused(false);
              }, 1000);
            }}
            aria-label={`Go to review ${index + 1}`}
          />
        ))}
      </div>

      {/* Индикатор свайпа для мобильных устройств */}
      <div className="swipe-hint">
        <span className="swipe-hint-text">← Swipe →</span>
      </div>
    </div>
  );
};