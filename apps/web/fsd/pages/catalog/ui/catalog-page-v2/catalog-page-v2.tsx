import SettingsIcon from '@re/ui-kit/icons/settings';
import { cn } from '@re/ui-kit/utils/cn';

import { Container } from '~shared/ui/container';

import { getTitlesFiltersOptions } from './features/title-filters/api/queries';
import { SelectOrderingFilter } from './features/title-filters/ui/select-ordering';
import { TypePanelFilter } from './features/title-filters/ui/type-panel-filter';
import {
  TitlesFeedContent,
  TitlesFeedFiltersToggle,
  TitlesFeedResponisveFilters,
} from './widgets/titles-feed';
import { TitlesFeedFiltersContent } from './widgets/titles-feed-filters/ui/content';
import { TitlesFeedPresetsProvider } from './widgets/titles-feed-presets/model/context';
import { getServerCookieCustomPresets } from './widgets/titles-feed-presets/model/server';
import { PresetItemUi } from './widgets/titles-feed-presets/ui/preset-item';
import { PresetManageButton } from './widgets/titles-feed-presets/ui/preset-manage-button';
import { PresetManageDialogProvider } from './widgets/titles-feed-presets/ui/preset-manage-dialog/model/context';
import { PresetManageResponsiveModal } from './widgets/titles-feed-presets/ui/preset-manage-dialog/ui/responsive-modal/responsive-modal.async';
import { PresetSaveButton } from './widgets/titles-feed-presets/ui/preset-save-button';
import { PresetSaveDialogProvider } from './widgets/titles-feed-presets/ui/preset-save-dialog/model/context';
import { PresetSaveResponsiveModal } from './widgets/titles-feed-presets/ui/preset-save-dialog/ui/dialog/responsive-modal.async';
import { TitlesFeedPresetsList } from './widgets/titles-feed-presets/ui/presets-list';
import { NormalizedCatalogProvider } from './normalized-catalog-provider';
import { TitleHeader } from './title-header';

export const CatalogPageV2 = async () => {
  const filtersOptions = await getTitlesFiltersOptions();
  const defaultCustomPresets = await getServerCookieCustomPresets();
  return (
    <NormalizedCatalogProvider filtersOptions={filtersOptions}>
      <Container slim className="mt-4">
        <TitleHeader />
      </Container>
      <div
        className={cn(
          'border-border/50 w-full border-b',
          'sticky top-[var(--header-height)] z-20 max-sm:top-0'
        )}
      >
        <Container
          slim
          className={cn(
            'bg-background flex flex-col gap-4 py-3 md:py-4'
            // 'sticky top-[var(--header-height)] z-10'
            // 'max-sm:border-b'
          )}
        >
          <div className="flex w-full justify-between gap-3 max-lg:flex-wrap lg:gap-12">
            {/* <TitlesFeedSearch className="w-full" /> */}
            <SelectOrderingFilter className="max-lg:order-1" />

            <TypePanelFilter className="max-lg:w-fulld mx-auto max-lg:order-3 max-lg:mt-1 max-sm:hidden" />

            <TitlesFeedFiltersToggle className="max-lg:order-2" />
          </div>
        </Container>
      </div>
      {/* <Container slim className="mb-4 p-2 py-0">
        <div className="flex justify-end pt-1">
          <TitlesFeedSearch className="w-full" />

          <TitlesFeedOrdering />
        </div>
      </Container> */}
      <Container slim className="relative flex w-full max-w-full flex-row">
        <TitlesFeedPresetsProvider defaultCustomPresets={defaultCustomPresets}>
          <PresetSaveDialogProvider>
            <PresetManageDialogProvider>
              <div className="mt-4 flex w-full max-w-full flex-col gap-4 overflow-hidden max-lg:px-1">
                <TitlesFeedPresetsList
                  startItems={
                    <PresetManageButton
                      CustomComponent={
                        <PresetItemUi isActive={false} circle>
                          <SettingsIcon />
                        </PresetItemUi>
                      }
                    />
                  }
                />
                <TitlesFeedContent />
              </div>
              <TitlesFeedResponisveFilters>
                <TitlesFeedFiltersContent presetsButtonSlot={<PresetSaveButton />} />
              </TitlesFeedResponisveFilters>

              <PresetManageResponsiveModal />
              <PresetSaveResponsiveModal />
            </PresetManageDialogProvider>
          </PresetSaveDialogProvider>
        </TitlesFeedPresetsProvider>
      </Container>
    </NormalizedCatalogProvider>
  );
};
