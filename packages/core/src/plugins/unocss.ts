import type { Preset } from 'unocss'
import type { ResolvedOptions } from '../types'
import { presetUni } from '@uni-helper/unocss-preset-uni'
import presetLegacyCompat from '@unocss/preset-legacy-compat'
import { presetIcons, transformerDirectives, transformerVariantGroup } from 'unocss'
import UnoCSS from 'unocss/vite'
import { UNIVA_ID } from '../constant'

function presetUniva(resolved: ResolvedOptions): Preset {
  const { unocss } = resolved
  const presets = []
  if (unocss.presetLegacyCompat) {
    presets.push(presetLegacyCompat({
      commaStyleColorFunction: true,
      legacyColorSpace: true,
    }))
  }
  return {
    name: `${UNIVA_ID}-preset`,
    presets: [
      presetUni(unocss.uniPreset),
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
    safelist: unocss.safelist,
    theme: {
      colors: unocss.themeColors,
    },
  }
}

/**
 * 创建 UnoCSS 模块插件
 */
export function createUnocssPlugin(resolved: ResolvedOptions) {
  return UnoCSS({
    presets: [
      presetUniva(resolved),
    ],
    ...resolved.overrides.unocss,
  })
}
