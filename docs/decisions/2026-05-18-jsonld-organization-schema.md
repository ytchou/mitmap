# ADR: JSON-LD Organization Schema for Brand Detail Pages

Date: 2026-05-18

## Decision
Use schema.org Organization type for brand detail page structured data.

## Context
Brand detail pages need structured data for search engine rich results. The brand directory includes both online-only brands and brands with physical retail locations.

## Alternatives Considered
- **LocalBusiness**: Better for physical stores but requires conditional switching for online-only brands. Rejected: adds complexity without clear SEO benefit for a brand directory.
- **Brand (schema.org/Brand)**: Product-focused schema. Rejected: no support for address, contact, or social profile properties.

## Rationale
Organization is the most versatile choice — it supports name, description, logo, social profiles (sameAs), contact email, founding date, and optionally PostalAddress for brands with retail locations. No conditional schema logic needed.

## Consequences
- Advantage: Single schema type for all brands, clean implementation
- Advantage: Supports future enrichment (employees, events, reviews)
- Disadvantage: Less specific than LocalBusiness for physical-store brands (minor — Google still renders rich results)
