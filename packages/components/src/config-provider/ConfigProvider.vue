<script lang="ts" setup>
import {
  type CSSProperties,
  computed,
  onActivated,
  onBeforeUnmount,
  onDeactivated,
  provide,
  watch,
  watchEffect,
} from 'vue'
import {
  type Numeric,
  createNamespace,
  extend,
  inBrowser,
  kebabCase,
  makeStringProp,
} from '../utils'
import { setGlobalZIndex } from '../composables/use-global-z-index'
import type { ConfigProviderTheme, ConfigProviderThemeVarsScope, ThemeVars } from '.'
import { CONFIG_PROVIDER_KEY } from '.'

const props = defineProps({
  tag: makeStringProp<keyof HTMLElementTagNameMap>('div'),
  theme: makeStringProp<ConfigProviderTheme>('light'),
  zIndex: Number,
  themeVars: Object as ThemeVars,
  themeVarsDark: Object as ThemeVars,
  themeVarsLight: Object as ThemeVars,
  themeVarsScope: makeStringProp<ConfigProviderThemeVarsScope>('local'),
  iconPrefix: String,
})

const [name, bem] = createNamespace('config-provider')

/** map `gray1` to `gray-1` */
function insertDash(str: string) {
  return str.replace(/([a-zA-Z])(\d)/g, '$1-$2')
}

function mapThemeVarsToCSSVars(themeVars: Record<string, Numeric>) {
  const cssVars: Record<string, Numeric> = {}
  Object.keys(themeVars).forEach((key) => {
    const formattedKey = insertDash(kebabCase(key))
    cssVars[`--van-${formattedKey}`] = themeVars[key]
  })
  return cssVars
}

function syncThemeVarsOnRoot(
  newStyle: Record<string, Numeric> = {},
  oldStyle: Record<string, Numeric> = {},
) {
  Object.keys(newStyle).forEach((key) => {
    if (newStyle[key] !== oldStyle[key])
      document.documentElement.style.setProperty(key, newStyle[key] as string)
  })
  Object.keys(oldStyle).forEach((key) => {
    if (!newStyle[key])
      document.documentElement.style.removeProperty(key)
  })
}

const style = computed<CSSProperties | undefined>(() =>
  mapThemeVarsToCSSVars(
    extend(
      {},
      props.themeVars,
      props.theme === 'dark' ? props.themeVarsDark : props.themeVarsLight,
    ),
  ),
)

if (inBrowser) {
  const addTheme = () => {
    document.documentElement.classList.add(`van-theme-${props.theme}`)
  }
  const removeTheme = (theme = props.theme) => {
    document.documentElement.classList.remove(`van-theme-${theme}`)
  }

  watch(
    () => props.theme,
    (newVal, oldVal) => {
      if (oldVal)
        removeTheme(oldVal)

      addTheme()
    },
    { immediate: true },
  )

  onActivated(addTheme)
  onDeactivated(removeTheme)
  onBeforeUnmount(removeTheme)

  watch(style, (newStyle, oldStyle) => {
    if (props.themeVarsScope === 'global') {
      syncThemeVarsOnRoot(
        newStyle as Record<string, Numeric>,
        oldStyle as Record<string, Numeric>,
      )
    }
  })

  watch(
    () => props.themeVarsScope,
    (newScope, oldScope) => {
      if (oldScope === 'global') {
        // remove on Root
        syncThemeVarsOnRoot({}, style.value as Record<string, Numeric>)
      }
      if (newScope === 'global') {
        // add on root
        syncThemeVarsOnRoot(style.value as Record<string, Numeric>, {})
      }
    },
  )

  if (props.themeVarsScope === 'global') {
    // add on root
    syncThemeVarsOnRoot(style.value as Record<string, Numeric>, {})
  }
}

provide(CONFIG_PROVIDER_KEY, props)

watchEffect(() => {
  if (props.zIndex !== undefined)
    setGlobalZIndex(props.zIndex)
})
</script>

<template>
  <view :class="bem()" :style="themeVarsScope === 'local' ? style : undefined">
    <slot />
  </view>
</template>
