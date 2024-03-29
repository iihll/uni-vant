import type { Ref } from 'vue'
import type { BEM } from '../utils/create'
import { useHeight } from './use-height'

export function usePlaceholder(contentRef: Ref<Element | undefined>, bem: BEM) {
  const height = useHeight(contentRef, true)

  return (renderContent: () => JSX.Element) => (
    <div
      class={bem('placeholder')}
      style={{ height: height.value ? `${height.value}px` : undefined }}
    >
      {renderContent()}
    </div>
  )
}
