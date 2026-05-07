import type { SocialLinks } from './brand'

export type SubmissionStatus = 'pending' | 'approved' | 'rejected'

export type BrandSubmission = {
  id: string
  brandId: string | null
  brandName: string
  submitterEmail: string
  submitterName: string | null
  description: string | null
  websiteUrl: string | null
  socialLinks: SocialLinks
  suggestedTags: string[]
  status: SubmissionStatus
  reviewerNotes: string | null
  submittedAt: string
  reviewedAt: string | null
  reviewedBy: string | null
}
