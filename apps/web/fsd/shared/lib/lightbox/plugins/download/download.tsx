import * as React from 'react';

import { PLUGIN_DOWNLOAD } from '~shared/lib/lightbox/consts';
import { PluginProps } from '~shared/lib/lightbox/types';
import { addToolbarButton } from '~shared/lib/lightbox/utils';

import { DownloadButton } from './download-button';
import { resolveDownloadProps } from './props';

export function Download({ augment }: PluginProps) {
  augment(({ toolbar, download, ...restProps }) => ({
    toolbar: addToolbarButton(toolbar, PLUGIN_DOWNLOAD, <DownloadButton />),
    download: resolveDownloadProps(download),
    ...restProps,
  }));
}
