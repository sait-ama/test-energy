import { createModule } from '~shared/lib/lightbox/config';
import { PLUGIN_CAPTIONS } from '~shared/lib/lightbox/consts';
import { PluginProps } from '~shared/lib/lightbox/types';
import { addToolbarButton } from '~shared/lib/lightbox/utils';

import { CaptionsButton } from './captions-button';
import { CaptionsContextProvider } from './captions-context';
import { Description } from './description';
import { Title } from './title';

/** Captions plugin */
export function Captions({ augment, addModule }: PluginProps) {
  augment(({ render: { slideFooter: renderFooter, ...restRender }, toolbar, ...restProps }) => {
    return {
      render: {
        slideFooter: ({ slide }) => (
          <>
            {renderFooter?.({ slide })}
            {slide.title && <Title title={slide.title} />}
            {slide.description && <Description description={slide.description} />}
          </>
        ),
        ...restRender,
      },
      toolbar: addToolbarButton(toolbar, PLUGIN_CAPTIONS, <CaptionsButton />),
      ...restProps,
    };
  });

  addModule(createModule(PLUGIN_CAPTIONS, CaptionsContextProvider));
}
