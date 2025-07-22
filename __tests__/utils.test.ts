import { cn } from '../lib/utils'

describe('cn utility', () => {
  it('joins class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })
})
