import { withInstall } from '../utils'
import type { PickerGroupProps } from './PickerGroup'
import _PickerGroup from './PickerGroup'

export const PickerGroup = withInstall(_PickerGroup)
export default PickerGroup
export { pickerGroupProps } from './PickerGroup'
export type { PickerGroupProps }
export type { PickerGroupThemeVars } from './types'

declare module 'vue' {
  export interface GlobalComponents {
    VanPickerGroup: typeof PickerGroup
  }
}
