import * as React from 'react';

import { CarouselModule } from './modules/carousel';
import { ControllerModule } from './modules/controller/controller';
import { NavigationModule } from './modules/navigation/navigation';
import { NoScrollModule } from './modules/no-scroll/no-scroll';
import { PortalModule } from './modules/portal/portal';
import { RootModule } from './modules/root';
import { ToolbarModule } from './modules/toolbar';
import { EventsProvider } from './stores/events';
import { LightboxPropsProvider } from './stores/lightbox-props';
import { LightboxStateProvider } from './stores/lightbox-state';
import { TimeoutsProvider } from './stores/timeouts';
import { createNode, withPlugins } from './config';
import { lightboxDefaultProps } from './props';
import { AnimationSettings, LightBoxComponentProps, LightboxExternalProps, Node } from './types';

function renderNode(node: Node, props: LightBoxComponentProps): React.ReactElement {
  return React.createElement(
    node.module.component,
    { key: node.module.name, ...props },
    node.children?.map((child) => renderNode(child, props))
  );
}

function mergeAnimation(
  defaultAnimation: AnimationSettings,
  animation: LightboxExternalProps['animation'] = {}
) {
  const { easing: defaultAnimationEasing, ...restDefaultAnimation } = defaultAnimation;
  const { easing, ...restAnimation } = animation;
  return {
    easing: { ...defaultAnimationEasing, ...easing },
    ...restDefaultAnimation,
    ...restAnimation,
  };
}

/** Lightbox component */
export function Lightbox({
  carousel,
  animation,
  render,
  toolbar,
  controller,
  noScroll,
  on,
  plugins,
  slides,
  index,
  ...restProps
}: LightboxExternalProps) {
  const {
    animation: defaultAnimation,
    carousel: defaultCarousel,
    render: defaultRender,
    toolbar: defaultToolbar,
    controller: defaultController,
    noScroll: defaultNoScroll,
    on: defaultOn,
    slides: defaultSlides,
    index: defaultIndex,
    plugins: defaultPlugins,
    ...restDefaultProps
  } = lightboxDefaultProps;

  const { config, augmentation } = withPlugins(
    [
      createNode(PortalModule, [
        createNode(NoScrollModule, [
          createNode(ControllerModule, [
            createNode(CarouselModule),
            createNode(ToolbarModule),
            createNode(NavigationModule),
          ]),
        ]),
      ]),
    ],
    plugins || defaultPlugins
  );

  const props = augmentation({
    animation: mergeAnimation(defaultAnimation, animation),
    carousel: { ...defaultCarousel, ...carousel },
    render: { ...defaultRender, ...render },
    toolbar: { ...defaultToolbar, ...toolbar },
    controller: { ...defaultController, ...controller },
    noScroll: { ...defaultNoScroll, ...noScroll },
    on: { ...defaultOn, ...on },
    ...restDefaultProps,
    ...restProps,
  });

  if (!props.open) return null;

  return (
    <LightboxPropsProvider {...props}>
      <LightboxStateProvider
        slides={slides || defaultSlides}
        // safeguard against invalid `index` prop
        index={parseInt(String(index || defaultIndex))}
      >
        <TimeoutsProvider>
          <EventsProvider>{renderNode(createNode(RootModule, config), props)}</EventsProvider>
        </TimeoutsProvider>
      </LightboxStateProvider>
    </LightboxPropsProvider>
  );
}
