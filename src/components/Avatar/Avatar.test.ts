import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { Avatar, AvatarGroup } from './index'

describe('Avatar', () => {
  it('renders an image when src is provided', () => {
    const wrapper = mount(Avatar, { props: { src: 'https://example.com/a.png', name: 'Ada Lovelace' } })
    const img = wrapper.get('.lumen-avatar__img')
    expect(img.attributes('src')).toBe('https://example.com/a.png')
    expect(img.attributes('alt')).toBe('Ada Lovelace')
    expect(wrapper.get('.lumen-avatar').attributes('aria-label')).toBe('Ada Lovelace')
  })

  it('falls back to derived initials when the image fails', async () => {
    const wrapper = mount(Avatar, { props: { src: 'broken.png', name: 'Ada Lovelace' } })
    await wrapper.get('.lumen-avatar__img').trigger('error')
    expect(wrapper.find('.lumen-avatar__img').exists()).toBe(false)
    expect(wrapper.get('.lumen-avatar__initials').text()).toBe('AL')
  })

  it('prefers the explicit initials prop', () => {
    const wrapper = mount(Avatar, { props: { name: 'Ada Lovelace', initials: 'AD' } })
    expect(wrapper.get('.lumen-avatar__initials').text()).toBe('AD')
  })

  it('renders a generic icon when there is no name', () => {
    const wrapper = mount(Avatar)
    expect(wrapper.find('.lumen-avatar__icon').exists()).toBe(true)
  })

  it('renders the default slot instead of the fallback', () => {
    const wrapper = mount(Avatar, { props: { name: 'Ada' }, slots: { default: 'X' } })
    expect(wrapper.get('.lumen-avatar__fallback').text()).toBe('X')
  })

  it('applies size and shape classes, and numeric sizes as style', () => {
    const sized = mount(Avatar, { props: { size: 'lg', shape: 'square' } })
    expect(sized.get('.lumen-avatar').classes()).toContain('lumen-avatar--lg')
    expect(sized.get('.lumen-avatar').classes()).toContain('lumen-avatar--square')
    const numeric = mount(Avatar, { props: { size: 64 } })
    const style = numeric.get('.lumen-avatar').attributes('style') ?? ''
    expect(style).toContain('width: 64px')
    expect(style).toContain('height: 64px')
  })

  it('renders the status dot', () => {
    const wrapper = mount(Avatar, { props: { name: 'Ada', status: 'online' } })
    expect(wrapper.get('.lumen-avatar__status').classes()).toContain(
      'lumen-avatar__status--online',
    )
  })

  it('keeps the status dot outside the clipping container so it is never cut off', () => {
    const wrapper = mount(Avatar, { props: { name: 'Ada', status: 'online' } })
    const status = wrapper.get('.lumen-avatar__status')
    // The dot must be a direct child of .lumen-avatar, not nested inside
    // .lumen-avatar__body (which has overflow: hidden to clip the image).
    expect(status.element.parentElement?.classList.contains('lumen-avatar')).toBe(true)
    expect(wrapper.get('.lumen-avatar__body').find('.lumen-avatar__status').exists()).toBe(false)
  })
})

describe('AvatarGroup', () => {
  const threeAvatars = `
    <Avatar name="Ada Lovelace" />
    <Avatar name="Grace Hopper" />
    <Avatar name="Katherine Johnson" />
  `

  it('renders all avatars without max', () => {
    const wrapper = mount(AvatarGroup, {
      slots: { default: threeAvatars },
      global: { components: { Avatar } },
    })
    expect(wrapper.findAll('.lumen-avatar')).toHaveLength(3)
    expect(wrapper.find('.lumen-avatar-group__overflow').exists()).toBe(false)
  })

  it('collapses extra avatars into a +N overflow avatar', () => {
    const wrapper = mount(AvatarGroup, {
      props: { max: 2 },
      slots: { default: threeAvatars },
      global: { components: { Avatar } },
    })
    const avatars = wrapper.findAll('.lumen-avatar')
    expect(avatars).toHaveLength(3) // 2 shown + 1 overflow
    expect(wrapper.get('.lumen-avatar-group__overflow').text()).toBe('+1')
  })

  it('cascades size and shape to children unless overridden', () => {
    const wrapper = mount(AvatarGroup, {
      props: { size: 'sm', shape: 'square' },
      slots: { default: '<Avatar name="Ada" /><Avatar name="Grace" size="lg" />' },
      global: { components: { Avatar } },
    })
    const avatars = wrapper.findAll('.lumen-avatar')
    expect(avatars[0].classes()).toContain('lumen-avatar--sm')
    expect(avatars[0].classes()).toContain('lumen-avatar--square')
    expect(avatars[1].classes()).toContain('lumen-avatar--lg')
  })

  it('exposes group semantics', () => {
    const wrapper = mount(AvatarGroup, {
      slots: { default: threeAvatars },
      global: { components: { Avatar } },
    })
    expect(wrapper.get('.lumen-avatar-group').attributes('role')).toBe('group')
  })
})
