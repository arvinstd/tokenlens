import type { Category, HealthScore, LibraryComponent, RecentUpdate, LinearTicket, DriftedToken } from '~/types'

export function useMockData() {
  const healthScore: HealthScore = {
    score: 73,
    change: 3,
    totalTokens: 142,
    synced: 111,
    drifted: 20,
    missing: 11,
  }

  const categories: Category[] = [
    { name: 'Colors', icon: 'palette', count: 48, synced: 41, drifted: 5, missing: 2, score: 85, delta: 4 },
    { name: 'Spacing', icon: 'square', count: 24, synced: 22, drifted: 1, missing: 1, score: 92, delta: 0 },
    { name: 'Typography', icon: 'type', count: 32, synced: 22, drifted: 6, missing: 4, score: 69, delta: -8 },
    { name: 'Shadows', icon: 'sun', count: 12, synced: 8, drifted: 3, missing: 1, score: 67, delta: -3 },
    { name: 'Border Radius', icon: 'box', count: 8, synced: 7, drifted: 1, missing: 0, score: 88, delta: 2 },
    { name: 'Sizing', icon: 'layers', count: 18, synced: 11, drifted: 4, missing: 3, score: 61, delta: -5 },
  ]

  const recentUpdates: RecentUpdate[] = [
    { name: 'Button', by: 'figma', time: '2 hours ago', change: 'Added 2 new variants (Small, Large)', status: 'drifted' },
    { name: 'Badge', by: 'figma', time: 'Yesterday', change: 'New Brand and Error variants', status: 'drifted' },
    { name: 'Tabs', by: 'code', time: 'Yesterday', change: 'Added Pills variant in code', status: 'drifted' },
    { name: 'Input', by: 'both', time: '2 days ago', change: 'Synced error state styling', status: 'synced' },
    { name: 'Card', by: 'both', time: '1 week ago', change: 'Synced all 3 variants', status: 'synced' },
  ]

  const linearTickets: LinearTicket[] = [
    { id: 'LIN-142', title: 'Update Button in code to match Figma', status: 'progress', assignee: 'DS', priority: 'high', component: 'Button' },
    { id: 'LIN-143', title: 'Update Badge in code to match Figma', status: 'todo', assignee: '—', priority: 'high', component: 'Badge' },
    { id: 'LIN-144', title: 'Implement Tooltip component', status: 'todo', assignee: '—', priority: 'medium', component: 'Tooltip' },
    { id: 'LIN-145', title: 'Update Avatar sizes in code', status: 'progress', assignee: 'MK', priority: 'medium', component: 'Avatar' },
    { id: 'LIN-146', title: 'Update Tabs design in Figma (Pills variant)', status: 'todo', assignee: 'DS', priority: 'low', component: 'Tabs' },
    { id: 'LIN-138', title: 'Sync Input error states', status: 'done', assignee: 'MK', priority: 'medium', component: 'Input' },
    { id: 'LIN-135', title: 'Sync Card variants', status: 'done', assignee: 'DS', priority: 'low', component: 'Card' },
  ]

  const tokens: DriftedToken[] = [
    { name: 'color.brand.primary', figma: '#2C2C2E', code: '#1A1A1C', category: 'Colors', severity: 'high' },
    { name: 'color.brand.secondary', figma: '#71717A', code: '#6B7280', category: 'Colors', severity: 'low' },
    { name: 'color.status.success', figma: '#16A34A', code: '#16A34A', category: 'Colors', severity: 'low' },
    { name: 'color.status.warning', figma: '#D97706', code: '#F59E0B', category: 'Colors', severity: 'medium' },
    { name: 'color.status.error', figma: '#DC2626', code: '#DC2626', category: 'Colors', severity: 'low' },
    { name: 'color.bg.page', figma: '#FFFFFF', code: '#FFFFFF', category: 'Colors', severity: 'low' },
    { name: 'color.bg.subtle', figma: '#FAFAFA', code: '#F9FAFB', category: 'Colors', severity: 'low' },
    { name: 'color.bg.muted', figma: '#F4F4F5', code: '#F3F4F6', category: 'Colors', severity: 'low' },
    { name: 'color.border.default', figma: '#E4E4E7', code: '#E5E7EB', category: 'Colors', severity: 'low' },
    { name: 'color.text.primary', figma: '#09090B', code: '#111827', category: 'Colors', severity: 'medium' },
    { name: 'spacing.1', figma: '4px', code: '4px', category: 'Spacing', severity: 'low' },
    { name: 'spacing.2', figma: '8px', code: '8px', category: 'Spacing', severity: 'low' },
    { name: 'spacing.3', figma: '12px', code: '12px', category: 'Spacing', severity: 'low' },
    { name: 'spacing.4', figma: '16px', code: '16px', category: 'Spacing', severity: 'low' },
    { name: 'spacing.5', figma: '20px', code: '24px', category: 'Spacing', severity: 'medium' },
    { name: 'spacing.6', figma: '24px', code: '24px', category: 'Spacing', severity: 'low' },
    { name: 'font.size.xs', figma: '11px', code: '12px', category: 'Typography', severity: 'medium' },
    { name: 'font.size.sm', figma: '13px', code: '14px', category: 'Typography', severity: 'medium' },
    { name: 'font.size.md', figma: '15px', code: '16px', category: 'Typography', severity: 'medium' },
    { name: 'font.size.lg', figma: '18px', code: '18px', category: 'Typography', severity: 'low' },
    { name: 'font.size.xl', figma: '24px', code: '24px', category: 'Typography', severity: 'low' },
    { name: 'font.weight.regular', figma: '400', code: '400', category: 'Typography', severity: 'low' },
    { name: 'font.weight.medium', figma: '500', code: '500', category: 'Typography', severity: 'low' },
    { name: 'font.weight.semibold', figma: '600', code: '600', category: 'Typography', severity: 'low' },
    { name: 'font.weight.bold', figma: '700', code: '700', category: 'Typography', severity: 'low' },
    { name: 'shadow.sm', figma: '0 1px 2px rgba(0,0,0,0.05)', code: '0 1px 2px rgba(0,0,0,0.06)', category: 'Shadows', severity: 'low' },
    { name: 'shadow.md', figma: '0 2px 8px rgba(0,0,0,0.08)', code: '0 4px 6px rgba(0,0,0,0.1)', category: 'Shadows', severity: 'medium' },
    { name: 'shadow.lg', figma: '0 4px 16px rgba(0,0,0,0.12)', code: '0 10px 15px rgba(0,0,0,0.1)', category: 'Shadows', severity: 'high' },
    { name: 'radius.sm', figma: '4px', code: '4px', category: 'Border Radius', severity: 'low' },
    { name: 'radius.md', figma: '8px', code: '6px', category: 'Border Radius', severity: 'medium' },
    { name: 'radius.lg', figma: '12px', code: '12px', category: 'Border Radius', severity: 'low' },
    { name: 'radius.xl', figma: '16px', code: '16px', category: 'Border Radius', severity: 'low' },
    { name: 'size.icon.sm', figma: '16px', code: '14px', category: 'Sizing', severity: 'medium' },
    { name: 'size.icon.md', figma: '20px', code: '20px', category: 'Sizing', severity: 'low' },
    { name: 'size.icon.lg', figma: '24px', code: '24px', category: 'Sizing', severity: 'low' },
    { name: 'size.btn.height.sm', figma: '32px', code: '28px', category: 'Sizing', severity: 'high' },
    { name: 'size.btn.height.md', figma: '40px', code: '36px', category: 'Sizing', severity: 'high' },
    { name: 'size.btn.height.lg', figma: '48px', code: '44px', category: 'Sizing', severity: 'medium' },
  ]

  const libraryData: Record<string, LibraryComponent> = {
    Button: {
      description: 'Primary action element. Supports multiple variants, sizes, and states with optional left/right icons.',
      status: 'drifted', figmaDate: 'Today', codeDate: '3 months ago',
      figmaVariants: 6, codeVariants: 4,
      behind: 'code', behindDetail: 'Code is 2 variants behind Figma. Figma added Small and Large sizes.',
      props: [
        { name: 'variant', type: "'primary' | 'secondary' | 'ghost' | 'danger'", default: "'primary'", required: false },
        { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", required: false },
        { name: 'disabled', type: 'boolean', default: 'false', required: false },
        { name: 'loading', type: 'boolean', default: 'false', required: false },
        { name: 'iconLeft', type: 'Component', default: '—', required: false },
        { name: 'iconRight', type: 'Component', default: '—', required: false },
        { name: 'onClick', type: '() => void', default: '—', required: false },
        { name: 'label', type: 'string', default: '—', required: true },
      ],
      code: `<template>
  <button
    :class="['btn', 'btn--' + variant, 'btn--' + size, { 'btn--disabled': disabled }]"
    :disabled="disabled"
    @click="$emit('click')"
  >
    <slot name="icon-left" />
    <span>{{ label }}</span>
    <slot name="icon-right" />
  </button>
</template>

<script setup>
defineProps({
  variant: { type: String, default: 'primary' },
  size: { type: String, default: 'md' },
  disabled: { type: Boolean, default: false },
  label: { type: String, required: true },
})
</script>`,
      usage: `<Button label="Save changes" variant="primary" />
<Button label="Cancel" variant="ghost" />
<Button label="Delete" variant="danger" />
<Button label="Small" size="sm" />`,
    },
    Badge: {
      description: 'Inline status indicator. Used for tags, labels, and status chips throughout the interface.',
      status: 'drifted', figmaDate: 'Yesterday', codeDate: '2 months ago',
      figmaVariants: 5, codeVariants: 3,
      behind: 'code', behindDetail: 'Code is missing Brand and Error variants added in Figma.',
      props: [
        { name: 'variant', type: "'default' | 'success' | 'warning' | 'error' | 'brand'", default: "'default'", required: false },
        { name: 'label', type: 'string', default: '—', required: true },
        { name: 'dot', type: 'boolean', default: 'false', required: false },
        { name: 'removable', type: 'boolean', default: 'false', required: false },
      ],
      code: `<template>
  <span :class="['badge', 'badge--' + variant]">
    <span v-if="dot" class="badge__dot" />
    {{ label }}
    <button v-if="removable" class="badge__remove" @click="$emit('remove')">
      <XIcon :size="10" />
    </button>
  </span>
</template>

<script setup>
defineProps({
  variant: { type: String, default: 'default' },
  label: { type: String, required: true },
  dot: { type: Boolean, default: false },
  removable: { type: Boolean, default: false },
})
</script>`,
      usage: `<Badge label="Synced" variant="success" />
<Badge label="3 issues" variant="warning" dot />
<Badge label="Tag" removable />`,
    },
    Input: {
      description: 'Form input field with label, placeholder, error state, and helper text support.',
      status: 'synced', figmaDate: '2 days ago', codeDate: '2 days ago',
      figmaVariants: 4, codeVariants: 4,
      props: [
        { name: 'label', type: 'string', default: '—', required: false },
        { name: 'placeholder', type: 'string', default: '—', required: false },
        { name: 'modelValue', type: 'string', default: "''", required: false },
        { name: 'error', type: 'string', default: '—', required: false },
        { name: 'disabled', type: 'boolean', default: 'false', required: false },
        { name: 'type', type: "'text' | 'email' | 'password'", default: "'text'", required: false },
      ],
      code: `<template>
  <div class="input-field">
    <label v-if="label" class="input-field__label">{{ label }}</label>
    <input
      :type="type"
      :placeholder="placeholder"
      :value="modelValue"
      :disabled="disabled"
      :class="{ 'input-field__input--error': error }"
      @input="$emit('update:modelValue', $event.target.value)"
    />
    <span v-if="error" class="input-field__error">{{ error }}</span>
  </div>
</template>`,
      usage: `<Input label="Email" placeholder="you@company.com" />
<Input label="Name" modelValue="John" />
<Input label="Password" type="password" error="Required" />`,
    },
    Avatar: {
      description: 'User avatar with initials fallback, multiple sizes, and stack support for groups.',
      status: 'drifted', figmaDate: '3 days ago', codeDate: '4 months ago',
      figmaVariants: 4, codeVariants: 2,
      behind: 'code', behindDetail: 'Code only has md and lg sizes. Figma added sm and xl.',
      props: [
        { name: 'src', type: 'string', default: '—', required: false },
        { name: 'initials', type: 'string', default: '—', required: false },
        { name: 'size', type: "'sm' | 'md' | 'lg' | 'xl'", default: "'md'", required: false },
        { name: 'alt', type: 'string', default: '—', required: false },
      ],
      code: `<template>
  <div :class="['avatar', 'avatar--' + size]">
    <img v-if="src" :src="src" :alt="alt" />
    <span v-else class="avatar__initials">{{ initials }}</span>
  </div>
</template>

<script setup>
defineProps({
  src: String,
  initials: String,
  size: { type: String, default: 'md' },
  alt: { type: String, default: 'Avatar' },
})
</script>`,
      usage: `<Avatar initials="DS" size="lg" />
<Avatar src="/photo.jpg" size="md" />`,
    },
    Card: {
      description: 'Container component with multiple visual styles. Used for grouping related content.',
      status: 'synced', figmaDate: '1 week ago', codeDate: '1 week ago',
      figmaVariants: 3, codeVariants: 3,
      props: [
        { name: 'variant', type: "'default' | 'subtle' | 'highlighted'", default: "'default'", required: false },
        { name: 'padding', type: "'sm' | 'md' | 'lg'", default: "'md'", required: false },
        { name: 'hoverable', type: 'boolean', default: 'false', required: false },
      ],
      code: `<template>
  <div :class="['card', 'card--' + variant, { 'card--hoverable': hoverable }]">
    <slot />
  </div>
</template>

<script setup>
defineProps({
  variant: { type: String, default: 'default' },
  padding: { type: String, default: 'md' },
  hoverable: { type: Boolean, default: false },
})
</script>`,
      usage: `<Card>Default card content</Card>
<Card variant="subtle">Subtle card</Card>
<Card variant="highlighted" hoverable>Highlighted</Card>`,
    },
    Tooltip: {
      description: 'Contextual overlay triggered on hover. Supports multiple placement positions.',
      status: 'missing', figmaDate: 'Yesterday', codeDate: '—',
      figmaVariants: 3, codeVariants: 0,
      behind: 'code', behindDetail: 'Exists in Figma with 3 variants but has no code implementation yet.',
      props: [
        { name: 'content', type: 'string', default: '—', required: true },
        { name: 'placement', type: "'top' | 'bottom' | 'left' | 'right'", default: "'top'", required: false },
        { name: 'delay', type: 'number', default: '200', required: false },
      ],
      code: `<!-- NOT YET IMPLEMENTED IN CODE -->
<!-- Figma spec: 3 variants (top, bottom, left) -->

<template>
  <div class="tooltip-trigger" @mouseenter="show" @mouseleave="hide">
    <slot />
    <div v-if="visible" :class="['tooltip', 'tooltip--' + placement]">
      {{ content }}
    </div>
  </div>
</template>`,
      usage: `<Tooltip content="More info" placement="top">
  <Button label="Hover me" variant="ghost" />
</Tooltip>`,
    },
    Tabs: {
      description: 'Navigation tabs for switching between views. Supports underline and pill styles.',
      status: 'drifted', figmaDate: '1 month ago', codeDate: 'Yesterday',
      figmaVariants: 2, codeVariants: 3,
      behind: 'figma', behindDetail: 'Figma is behind — Code added a Pills variant not yet reflected in design.',
      props: [
        { name: 'items', type: "Array<{ label: string, value: string }>", default: '[]', required: true },
        { name: 'modelValue', type: 'string', default: '—', required: true },
        { name: 'variant', type: "'underline' | 'pills'", default: "'underline'", required: false },
      ],
      code: `<template>
  <div :class="['tabs', 'tabs--' + variant]">
    <button
      v-for="item in items"
      :key="item.value"
      :class="['tabs__item', { 'tabs__item--active': modelValue === item.value }]"
      @click="$emit('update:modelValue', item.value)"
    >
      {{ item.label }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  items: { type: Array, required: true },
  modelValue: { type: String, required: true },
  variant: { type: String, default: 'underline' },
})
</script>`,
      usage: `<Tabs
  :items="[
    { label: 'Overview', value: 'overview' },
    { label: 'Tokens', value: 'tokens' },
  ]"
  v-model="activeTab"
/>`,
    },
  }

  return {
    healthScore,
    categories,
    recentUpdates,
    linearTickets,
    libraryData,
    tokens,
  }
}
