import { describe, it, expect } from "vitest"
import { getRelatedCategorySlugs } from "@/lib/taxonomy/ontology"

describe("getRelatedCategorySlugs", () => {
  it("returns sibling categories for fashion", () => {
    const related = getRelatedCategorySlugs("fashion")
    expect(related).toContain("bags-accessories")
    expect(related).toContain("jewelry")
    expect(related).not.toContain("fashion")
  })

  it("returns sibling categories for food-drink", () => {
    const related = getRelatedCategorySlugs("food-drink")
    expect(related).toContain("crafts")
    expect(related).not.toContain("food-drink")
  })

  it("returns empty array for unknown slug", () => {
    expect(getRelatedCategorySlugs("nonexistent")).toEqual([])
  })

  it("never includes the input slug in results", () => {
    const slugs = ["fashion", "bags-accessories", "jewelry", "beauty", "home",
      "food-drink", "crafts", "tech", "outdoor", "kids-pets"]
    for (const slug of slugs) {
      expect(getRelatedCategorySlugs(slug)).not.toContain(slug)
    }
  })
})
