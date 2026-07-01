import type { Preset } from 'unocss'
import type { ResolvedUnivaUnocss, UnoCSSOptions } from '../types'
import { presetUni } from '@uni-helper/unocss-preset-uni'
import presetLegacyCompat from '@unocss/preset-legacy-compat'
import { presetIcons, transformerDirectives, transformerVariantGroup } from 'unocss'
import UnoCSS from 'unocss/vite'
import { ID } from '../constant'

function presetUniva(userOptions: ResolvedUnivaUnocss): Preset {
  const presets = []
  if (userOptions.presetLegacyCompat) {
    presets.push(presetLegacyCompat({
      commaStyleColorFunction: true,
      legacyColorSpace: true,
    }))
  }
  return {
    name: `${ID}-preset`,
    presets: [
      presetUni(userOptions.uniPreset),
      presetIcons({
        scale: 1.2,
        warn: true,
        extraProperties: {
          'display': 'inline-block',
          'vertical-align': 'middle',
        },
      }),
      ...presets,
    ],
    shortcuts: [
      ['border-s', 'border border-solid'],
      ['wh-full', 'w-full h-full'],
      ['f-c-c', 'flex justify-center items-center'],
      ['f-col-c', 'flex-col justify-center items-center'],
      ['flex-items', 'flex items-center'],
      ['flex-justify', 'flex justify-center'],
      ['flex-col', 'flex flex-col'],
    ],
    transformers: [transformerDirectives(), transformerVariantGroup()],
    rules: [
      [
        'p-safe',
        {
          padding:
          'env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)',
        },
      ],
      ['pt-safe', { 'padding-top': 'env(safe-area-inset-top)' }],
      ['pb-safe', { 'padding-bottom': 'env(safe-area-inset-bottom)' }],
    ],
    safelist: userOptions.safelist,
    theme: {
      colors: userOptions.themeColors,
    },
  }
}

export function createUnocssPlugin(univaOptions: ResolvedUnivaUnocss, unocssOptions: UnoCSSOptions = {}) {
  return UnoCSS({
    presets: [
      presetUniva(univaOptions),
    ],
    ...unocssOptions,
  })
}
