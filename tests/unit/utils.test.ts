import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('cn (className merger)', () => {
  it('should merge single class', () => {
    expect(cn('foo')).toBe('foo')
  })

  it('should merge multiple classes', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('should handle undefined and null', () => {
    expect(cn('foo', undefined, 'bar', null)).toBe('foo bar')
  })

  it('should handle empty strings', () => {
    expect(cn('foo', '', 'bar')).toBe('foo bar')
  })

  it('should resolve Tailwind conflicts (last wins)', () => {
    // tailwind-merge resolves conflicts - p-4 should override p-2
    const result = cn('p-2', 'p-4')
    expect(result).toBe('p-4')
  })

  it('should merge conditional classes', () => {
    const isActive = true
    const isDisabled = false
    expect(cn('base', isActive && 'active', isDisabled && 'disabled')).toBe('base active')
  })

  it('should handle objects with clsx', () => {
    expect(cn({ foo: true, bar: false })).toBe('foo')
  })

  it('should handle arrays with clsx', () => {
    expect(cn(['foo', 'bar'])).toBe('foo bar')
  })

  it('should handle complex combinations', () => {
    const result = cn(
      'px-4 py-2',
      'bg-blue-500',
      { 'text-white': true, 'opacity-50': false },
      ['rounded', 'shadow'],
      null,
      undefined
    )
    expect(result).toContain('px-4')
    expect(result).toContain('py-2')
    expect(result).toContain('bg-blue-500')
    expect(result).toContain('text-white')
    expect(result).toContain('rounded')
    expect(result).toContain('shadow')
    expect(result).not.toContain('opacity-50')
  })

  it('should handle Tailwind color conflicts', () => {
    const result = cn('bg-red-500', 'bg-blue-500')
    expect(result).toBe('bg-blue-500')
  })

  it('should handle Tailwind margin/padding conflicts', () => {
    const result = cn('m-2', 'mt-4')
    // tailwind-merge keeps both since mt-4 is more specific
    expect(result).toContain('m-2')
    expect(result).toContain('mt-4')
  })
})
