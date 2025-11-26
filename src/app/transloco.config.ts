import { provideTransloco, translocoConfig } from '@jsverse/transloco';
import { TranslocoHttpLoader } from './transloco.loader';

export const provideTranslocoConfig = () =>
  provideTransloco({
    config: translocoConfig({
      availableLangs: ['en', 'ru'],
      //defaultLang: 'ru',
      reRenderOnLangChange: true,
      prodMode: false,
    }),
    loader: TranslocoHttpLoader   
  });