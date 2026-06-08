import type { EmailMessage } from './types'
import type { ValidationErrorCode } from '../validation/types'
import { CONTACT_EMAILS } from '@/lib/constants'

type Locale = 'zh-TW' | 'en'

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const FROM_ADDRESS = `Formoria <${CONTACT_EMAILS.noreply}>`

const ERROR_LABELS: Record<ValidationErrorCode, { 'zh-TW': string; en: string }> = {
  brand_name_empty: { 'zh-TW': '品牌名稱為必填', en: 'Brand name is required' },
  website_url_invalid: { 'zh-TW': '網站 URL 格式不正確', en: 'Website URL is not valid' },
  submitter_email_invalid: { 'zh-TW': '提交者電子郵件格式不正確', en: 'Submitter email is not valid' },
  description_too_short: { 'zh-TW': '品牌介紹過短（至少需要 20 個字元）', en: 'Description is too short (minimum 20 characters)' },
}

export function buildApprovalEmail(params: {
  submitterEmail: string
  brandName: string
  brandSlug: string
  siteUrl: string
  locale?: Locale
}): EmailMessage {
  const locale = params.locale ?? 'zh-TW'
  const brandUrl = `${params.siteUrl}/brands/${params.brandSlug}`

  if (locale === 'en') {
    return {
      to: params.submitterEmail,
      from: FROM_ADDRESS,
      subject: `Your brand "${escapeHtml(params.brandName)}" has been approved — Formoria`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Your brand has been approved!</h2>
          <p>Great news — <strong>${escapeHtml(params.brandName)}</strong> is now listed on Formoria.</p>
          <p>You can view your brand page here:</p>
          <p><a href="${brandUrl}" style="color: #2563eb;">${brandUrl}</a></p>
          <p>Thank you for contributing to the Made in Taiwan directory.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="color: #6b7280; font-size: 14px;">Formoria — Made in Taiwan Brand Directory</p>
        </div>
      `.trim(),
    }
  }

  return {
    to: params.submitterEmail,
    from: FROM_ADDRESS,
    subject: `您的品牌「${escapeHtml(params.brandName)}」已通過審核 — Formoria`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>您的品牌已通過審核！</h2>
        <p>好消息 —— <strong>${escapeHtml(params.brandName)}</strong> 現已刊登於 Formoria。</p>
        <p>您可以在此查看您的品牌頁面：</p>
        <p><a href="${brandUrl}" style="color: #2563eb;">${brandUrl}</a></p>
        <p>感謝您為台灣品牌目錄做出貢獻。</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #6b7280; font-size: 14px;">Formoria — 台灣品牌目錄</p>
      </div>
    `.trim(),
  }
}

export function buildRejectionEmail(params: {
  submitterEmail: string
  brandName: string
  reviewerNotes: string | null
  locale?: Locale
}): EmailMessage {
  const locale = params.locale ?? 'zh-TW'

  if (locale === 'en') {
    const notesSection =
      params.reviewerNotes != null
        ? `
        <p><strong>Reviewer notes:</strong></p>
        <blockquote style="border-left: 3px solid #d1d5db; padding-left: 12px; color: #374151;">
          ${escapeHtml(params.reviewerNotes)}
        </blockquote>`
        : ''

    return {
      to: params.submitterEmail,
      from: FROM_ADDRESS,
      subject: `Your brand submission "${escapeHtml(params.brandName)}" needs revision — Formoria`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Your submission needs revision</h2>
          <p>Thank you for submitting <strong>${escapeHtml(params.brandName)}</strong> to Formoria.</p>
          <p>After review, we are unable to approve this submission at this time.</p>
          ${notesSection}
          <p>You are welcome to revise and resubmit.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="color: #6b7280; font-size: 14px;">Formoria — Made in Taiwan Brand Directory</p>
        </div>
      `.trim(),
    }
  }

  const notesSection =
    params.reviewerNotes != null
      ? `
        <p><strong>審核意見：</strong></p>
        <blockquote style="border-left: 3px solid #d1d5db; padding-left: 12px; color: #374151;">
          ${escapeHtml(params.reviewerNotes)}
        </blockquote>`
      : ''

  return {
    to: params.submitterEmail,
    from: FROM_ADDRESS,
    subject: `您提交的品牌「${escapeHtml(params.brandName)}」需要修改 — Formoria`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>您的提交需要修改</h2>
        <p>感謝您向 Formoria 提交 <strong>${escapeHtml(params.brandName)}</strong>。</p>
        <p>經審核後，我們目前無法批准此次提交。</p>
        ${notesSection}
        <p>您可以修改資料後重新提交。</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #6b7280; font-size: 14px;">Formoria — 台灣品牌目錄</p>
      </div>
    `.trim(),
  }
}

export function buildClaimEmail(params: {
  submitterEmail: string
  brandName: string
  claimUrl: string
  siteUrl: string
  locale?: Locale
}): EmailMessage {
  const locale = params.locale ?? 'zh-TW'

  if (locale === 'en') {
    return {
      to: params.submitterEmail,
      from: FROM_ADDRESS,
      subject: `Claim your brand page on Formoria — ${escapeHtml(params.brandName)}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Congratulations! Your brand has been approved.</h2>
          <p><strong>${escapeHtml(params.brandName)}</strong> is now listed on Formoria.</p>
          <p>As the brand owner, you can claim your brand page to manage and edit your information directly.</p>
          <p style="margin: 24px 0;">
            <a href="${params.claimUrl}" style="display: inline-block; background-color: #E06B3F; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Claim your brand</a>
          </p>
          <p style="color: #6b7280; font-size: 14px;">This link expires in 7 days. If you did not submit this brand, you can safely ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="color: #6b7280; font-size: 14px;">Formoria — Made in Taiwan Brand Directory</p>
        </div>
      `.trim(),
    }
  }

  return {
    to: params.submitterEmail,
    from: FROM_ADDRESS,
    subject: `認領您在 Formoria 的品牌頁面 — ${escapeHtml(params.brandName)}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>恭喜！您的品牌已通過審核。</h2>
        <p><strong>${escapeHtml(params.brandName)}</strong> 現已刊登於 Formoria。</p>
        <p>身為品牌擁有者，您可以認領您的品牌頁面，直接管理和編輯您的品牌資訊。</p>
        <p style="margin: 24px 0;">
          <a href="${params.claimUrl}" style="display: inline-block; background-color: #E06B3F; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">認領您的品牌</a>
        </p>
        <p style="color: #6b7280; font-size: 14px;">此連結將在 7 天後失效。如果您並未提交此品牌，可安全忽略此郵件。</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #6b7280; font-size: 14px;">Formoria — 台灣品牌目錄</p>
      </div>
    `.trim(),
  }
}

export function buildClaimApprovedEmail(params: {
  ownerEmail: string
  brandName: string
  brandSlug: string
  siteUrl: string
  locale?: Locale
}): EmailMessage {
  const locale = params.locale ?? 'zh-TW'
  const dashboardUrl = `${params.siteUrl}/dashboard/brands/${params.brandSlug}`

  if (locale === 'en') {
    return {
      to: params.ownerEmail,
      from: FROM_ADDRESS,
      subject: `Your brand claim for "${escapeHtml(params.brandName)}" has been approved — Formoria`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Your brand claim has been approved!</h2>
          <p>Congratulations. Your claim for <strong>${escapeHtml(params.brandName)}</strong> has been approved.</p>
          <p>You can now manage your brand from the owner dashboard.</p>
          <p style="margin: 24px 0;">
            <a href="${dashboardUrl}" style="display: inline-block; background-color: #E06B3F; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Go to owner dashboard</a>
          </p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="color: #6b7280; font-size: 14px;">Formoria — Made in Taiwan Brand Directory</p>
        </div>
      `.trim(),
    }
  }

  return {
    to: params.ownerEmail,
    from: FROM_ADDRESS,
    subject: `您的品牌認領申請「${escapeHtml(params.brandName)}」已通過審核 — Formoria`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>您的品牌認領申請已通過審核！</h2>
        <p>恭喜您，<strong>${escapeHtml(params.brandName)}</strong> 的品牌認領申請已獲批准。</p>
        <p>您現在可以前往品牌主後台管理品牌資訊。</p>
        <p style="margin: 24px 0;">
          <a href="${dashboardUrl}" style="display: inline-block; background-color: #E06B3F; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">前往品牌主後台</a>
        </p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #6b7280; font-size: 14px;">Formoria — 台灣品牌目錄</p>
      </div>
    `.trim(),
  }
}

export function buildClaimRejectedEmail(params: {
  ownerEmail: string
  brandName: string
  reviewerNotes: string
  siteUrl: string
  locale?: Locale
}): EmailMessage {
  const locale = params.locale ?? 'zh-TW'
  const reviewerNotes = params.reviewerNotes.trim()
  const notesSection =
    reviewerNotes !== ''
      ? `
        <p><strong>${locale === 'en' ? 'Reviewer notes' : '審核意見'}:</strong></p>
        <blockquote style="border-left: 3px solid #d1d5db; padding-left: 12px; color: #374151;">
          ${escapeHtml(reviewerNotes)}
        </blockquote>`
      : ''

  if (locale === 'en') {
    return {
      to: params.ownerEmail,
      from: FROM_ADDRESS,
      subject: `Your brand claim for "${escapeHtml(params.brandName)}" was not approved — Formoria`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Your brand claim was not approved</h2>
          <p>Thank you for submitting a claim for <strong>${escapeHtml(params.brandName)}</strong>.</p>
          <p>After review, we are unable to approve this claim at this time.</p>
          ${notesSection}
          <p>If you have more supporting information, please review your brand details on Formoria.</p>
          <p><a href="${params.siteUrl}" style="color: #2563eb;">${params.siteUrl}</a></p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="color: #6b7280; font-size: 14px;">Formoria — Made in Taiwan Brand Directory</p>
        </div>
      `.trim(),
    }
  }

  return {
    to: params.ownerEmail,
    from: FROM_ADDRESS,
    subject: `您的品牌認領申請「${escapeHtml(params.brandName)}」未通過審核 — Formoria`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>您的品牌認領申請未通過審核</h2>
        <p>感謝您提交 <strong>${escapeHtml(params.brandName)}</strong> 的品牌認領申請。</p>
        <p>經審核後，我們目前無法批准此次申請。</p>
        ${notesSection}
        <p>若您有補充資料，可前往 Formoria 重新確認品牌資訊。</p>
        <p><a href="${params.siteUrl}" style="color: #2563eb;">${params.siteUrl}</a></p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #6b7280; font-size: 14px;">Formoria — 台灣品牌目錄</p>
      </div>
    `.trim(),
  }
}

export function buildIncompleteSubmissionEmail(params: {
  submitterEmail: string
  brandName: string
  missingFields: ValidationErrorCode[]
  siteUrl: string
  locale?: Locale
}): EmailMessage {
  const locale = params.locale ?? 'zh-TW'
  const fieldList = params.missingFields
    .map((code) => `<li>${ERROR_LABELS[code][locale]}</li>`)
    .join('\n')

  if (locale === 'en') {
    return {
      to: params.submitterEmail,
      from: FROM_ADDRESS,
      subject: `Action needed: please review your submission for "${escapeHtml(params.brandName)}" — Formoria`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Your submission needs attention</h2>
          <p>Thank you for submitting <strong>${escapeHtml(params.brandName)}</strong> to Formoria.</p>
          <p>We found the following issues with your submission:</p>
          <ul>${fieldList}</ul>
          <p>Please update your submission so we can continue the review process.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="color: #6b7280; font-size: 14px;">Formoria — Made in Taiwan Brand Directory</p>
        </div>
      `.trim(),
    }
  }

  return {
    to: params.submitterEmail,
    from: FROM_ADDRESS,
    subject: `請確認您提交的品牌「${escapeHtml(params.brandName)}」— Formoria`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>您的提交需要補充資料</h2>
        <p>感謝您向 Formoria 提交 <strong>${escapeHtml(params.brandName)}</strong>。</p>
        <p>我們發現您的提交有以下問題：</p>
        <ul>${fieldList}</ul>
        <p>請更新您的提交資料，以便我們繼續審核流程。</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #6b7280; font-size: 14px;">Formoria — 台灣品牌目錄</p>
      </div>
    `.trim(),
  }
}
