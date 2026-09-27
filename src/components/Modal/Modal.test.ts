import { describe, expect, it, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { Modal } from './index'

afterEach(() => {
  document.body.style.overflow = ''
  document.body.innerHTML = ''
})

describe('Modal', () => {
  it('renders nothing when closed', () => {
    const wrapper = mount(Modal, { props: { open: false } })
    expect(document.body.querySelector('.lumen-modal')).toBeNull()
    wrapper.unmount()
  })

  it('renders a dialog with role and title when open', async () => {
    const wrapper = mount(Modal, {
      props: { open: true, title: 'Hello' },
      slots: { default: 'Body text' },
    })
    await nextTick()
    const panel = document.body.querySelector('.lumen-modal__panel')
    expect(panel).not.toBeNull()
    expect(panel?.getAttribute('role')).toBe('dialog')
    expect(panel?.getAttribute('aria-modal')).toBe('true')
    expect(document.body.querySelector('.lumen-modal__title')?.textContent).toBe('Hello')
    expect(document.body.querySelector('.lumen-modal__body')?.textContent).toBe('Body text')
    wrapper.unmount()
  })

  it('the header slot overrides the title prop', async () => {
    const wrapper = mount(Modal, {
      props: { open: true, title: 'Title prop' },
      slots: { header: 'Custom header' },
    })
    await nextTick()
    expect(document.body.querySelector('.lumen-modal__header')?.textContent).toBe('Custom header')
    expect(document.body.querySelector('.lumen-modal__title')).toBeNull()
    wrapper.unmount()
  })

  it('renders the footer slot and applies size classes', async () => {
    const wrapper = mount(Modal, {
      props: { open: true, size: 'lg' },
      slots: { footer: 'Actions' },
    })
    await nextTick()
    expect(document.body.querySelector('.lumen-modal__footer')?.textContent).toBe('Actions')
    expect(document.body.querySelector('.lumen-modal__panel')?.classList).toContain(
      'lumen-modal__panel--lg',
    )
    wrapper.unmount()
  })

  it('close button emits update:open=false and close', async () => {
    const wrapper = mount(Modal, { props: { open: true }, attachTo: document.body })
    await nextTick()
    const close = document.body.querySelector('.lumen-modal__close') as HTMLButtonElement
    expect(close.getAttribute('aria-label')).toBe('Close dialog')
    close.click()
    await nextTick()
    expect(wrapper.emitted('update:open')).toEqual([[false]])
    expect(wrapper.emitted('close')).toHaveLength(1)
    wrapper.unmount()
  })

  it('Escape closes by default, but not when closeOnEscape=false', async () => {
    const wrapper = mount(Modal, { props: { open: true }, attachTo: document.body })
    await nextTick()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await nextTick()
    expect(wrapper.emitted('update:open')).toEqual([[false]])
    wrapper.unmount()

    const noEsc = mount(Modal, {
      props: { open: true, closeOnEscape: false },
      attachTo: document.body,
    })
    await nextTick()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await nextTick()
    expect(noEsc.emitted('update:open')).toBeUndefined()
    noEsc.unmount()
  })

  it('backdrop click closes by default, but not when closeOnBackdrop=false', async () => {
    const wrapper = mount(Modal, { props: { open: true }, attachTo: document.body })
    await nextTick()
    ;(document.body.querySelector('.lumen-modal__backdrop') as HTMLElement).click()
    await nextTick()
    expect(wrapper.emitted('update:open')).toEqual([[false]])
    wrapper.unmount()

    const noBackdrop = mount(Modal, {
      props: { open: true, closeOnBackdrop: false },
      attachTo: document.body,
    })
    await nextTick()
    ;(document.body.querySelector('.lumen-modal__backdrop') as HTMLElement).click()
    await nextTick()
    expect(noBackdrop.emitted('update:open')).toBeUndefined()
    noBackdrop.unmount()
  })

  it('locks body scroll while open and restores it on close', async () => {
    const wrapper = mount(Modal, { props: { open: false }, attachTo: document.body })
    await wrapper.setProps({ open: true })
    await nextTick()
    expect(document.body.style.overflow).toBe('hidden')
    await wrapper.setProps({ open: false })
    await nextTick()
    expect(document.body.style.overflow).toBe('')
    wrapper.unmount()
  })

  it('focuses the first focusable element and returns focus on close', async () => {
    const trigger = document.createElement('button')
    trigger.textContent = 'trigger'
    document.body.appendChild(trigger)
    trigger.focus()
    expect(document.activeElement).toBe(trigger)

    const wrapper = mount(Modal, {
      props: { open: true },
      slots: { default: '<button>inner</button>' },
      attachTo: document.body,
    })
    await nextTick()
    await nextTick()
    // first focusable in DOM order is the header close button
    expect(document.activeElement?.classList.contains('lumen-modal__close')).toBe(true)

    await wrapper.setProps({ open: false })
    await nextTick()
    expect(document.activeElement).toBe(trigger)
    trigger.remove()
    wrapper.unmount()
  })
})
