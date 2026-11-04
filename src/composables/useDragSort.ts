import { nextTick, onBeforeUnmount, ref, type Ref } from 'vue'

// how close to the top or bottom of the screen the pointer must be for the page to scroll
const EDGE = 120
const MAX_SCROLL_SPEED = 14

/**
 * Drag-to-reorder for a vertical list.
 * The dragged element follows the pointer, and the list changes order
 * as soon as the element's middle passes a neighbour's middle.
 */
export function useDragSort<T>(items: Ref<T[]>, elementAt: (index: number) => HTMLElement | undefined) {
  const draggingIndex = ref<number | null>(null)
  const dragOffset = ref(0)

  let startPageY = 0
  let startTop = 0
  let pointerY = 0
  let lastScrollY = 0
  let frame = 0
  // between a swap and the next render the elements are still in their old places
  let settling = false

  function startDrag(event: PointerEvent, index: number) {
    const element = elementAt(index)

    if (event.button !== 0 || !element) return

    event.preventDefault()

    draggingIndex.value = index
    dragOffset.value = 0
    pointerY = event.clientY
    startPageY = event.clientY + window.scrollY
    startTop = element.offsetTop
    lastScrollY = window.scrollY
    document.body.style.userSelect = 'none'

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', stopDrag)
    window.addEventListener('pointercancel', stopDrag)
    frame = requestAnimationFrame(onFrame)
  }

  function onMove(event: PointerEvent) {
    pointerY = event.clientY
    update()
  }

  // offsetTop is the element's place in the layout, so the offset is "where the pointer is" minus "where the slot is"
  function follow(element: HTMLElement) {
    dragOffset.value = startTop + (pointerY + window.scrollY - startPageY) - element.offsetTop
  }

  async function update() {
    const index = draggingIndex.value
    const element = index === null ? undefined : elementAt(index)

    if (index === null || !element || settling) return

    follow(element)

    const middle = element.offsetTop + dragOffset.value + element.offsetHeight / 2
    const previous = elementAt(index - 1)
    const next = elementAt(index + 1)

    let target = index

    if (previous && middle < previous.offsetTop + previous.offsetHeight / 2) target = index - 1
    else if (next && middle > next.offsetTop + next.offsetHeight / 2) target = index + 1

    if (target === index) return

    const [item] = items.value.splice(index, 1)
    items.value.splice(target, 0, item!)
    draggingIndex.value = target

    settling = true
    await nextTick()
    settling = false

    // the element jumped into its new slot: put it back under the pointer,
    // and keep swapping if a fast flick carried it past more than one neighbour
    update()
  }

  // scrolls the page near the screen edges, and keeps the element under the pointer while the page moves
  function onFrame() {
    const depth =
      pointerY < EDGE ? pointerY - EDGE : pointerY > window.innerHeight - EDGE ? pointerY - (window.innerHeight - EDGE) : 0

    if (depth) window.scrollBy(0, (depth / EDGE) * MAX_SCROLL_SPEED)

    if (window.scrollY !== lastScrollY) {
      lastScrollY = window.scrollY
      update()
    }

    frame = requestAnimationFrame(onFrame)
  }

  function stopDrag() {
    draggingIndex.value = null
    dragOffset.value = 0
    document.body.style.userSelect = ''
    cancelAnimationFrame(frame)

    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerup', stopDrag)
    window.removeEventListener('pointercancel', stopDrag)
  }

  onBeforeUnmount(stopDrag)

  return { draggingIndex, dragOffset, startDrag }
}
