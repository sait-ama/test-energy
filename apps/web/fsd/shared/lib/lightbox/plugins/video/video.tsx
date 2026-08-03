import type { PluginProps, Slide, SlideVideo } from '../../types';
import { resolveVideoProps } from './props';
import { VideoSlide } from './video-slide';

function isVideoSlide(slide: Slide): slide is SlideVideo {
  return slide.type === 'video';
}

/** Video plugin */
export function Video({ augment }: PluginProps) {
  augment(({ render: { slide: renderSlide, ...restRender }, video, ...restProps }) => ({
    render: {
      slide: ({ slide, offset, rect }) =>
        isVideoSlide(slide) ? (
          <VideoSlide
            key={slide.sources?.map((source) => source.src).join('|')}
            slide={slide}
            offset={offset}
          />
        ) : (
          renderSlide?.({ slide, offset, rect })
        ),
      ...restRender,
    },
    video: resolveVideoProps(video),
    ...restProps,
  }));
}
