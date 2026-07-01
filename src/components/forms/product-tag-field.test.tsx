// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ProductTagField } from './product-tag-field'

function renderField(initialTags: string[] = []) {
  return render(
    <ProductTagField
      initialTags={initialTags}
      inputLabel="Product tags"
      placeholder="Add product"
      removeLabel="Remove tag"
      maxLabel="Up to 5 tags"
    />
  )
}

describe('ProductTagField', () => {
  it('adds normalized tags and ignores case-insensitive duplicates', () => {
    const { container } = renderField(['Electric beds'])
    const input = screen.getByRole('textbox', { name: 'Product tags' })

    fireEvent.change(input, { target: { value: '  Wheelchair   lifts  ' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    fireEvent.change(input, { target: { value: 'electric BEDS' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(screen.getByText('Wheelchair lifts')).toBeInTheDocument()
    expect(container.querySelector<HTMLInputElement>('input[name="productTags"]')?.value)
      .toBe('Electric beds,Wheelchair lifts')
  })

  it('limits the editor to five tags and supports removal', () => {
    renderField(['One', 'Two', 'Three', 'Four', 'Five'])

    expect(screen.queryByRole('textbox', { name: 'Product tags' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Remove tag: Three' }))
    expect(screen.getByRole('textbox', { name: 'Product tags' })).toBeInTheDocument()
  })
})
