import type { Metadata } from "next";
import { Link as IntlLink } from "@/i18n/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getUserBrands } from "@/lib/services/brand-owners";
import { getUserSubmissions } from "@/lib/services/submissions";
import { Badge } from "@/components/ui/badge";
import { BrandManagementPanel } from "@/components/dashboard/brand-management-panel";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string; tab?: string }>;
};

const SUBMISSIONS_TAB = "submissions";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-[#F5F4F1] text-[#7C7570] border-[#D4CFC9]",
  approved: "bg-green-50 text-green-700 border-green-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("dashboard");
  return {
    title: t("metadata.title"),
  };
}

export default async function DashboardPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("dashboard");
  const submissionsT = await getTranslations("mySubmissions");

  const resolvedSearchParams = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [brands, submissions] = user
    ? await Promise.all([
        getUserBrands(user.id),
        getUserSubmissions(user.email ?? ""),
      ])
    : [[], []];

  const ERROR_KEYS: Record<string, "errors.invalidClaim" | "errors.emailMismatch" | "errors.claimFailed"> = {
    "invalid-claim": "errors.invalidClaim",
    "email-mismatch": "errors.emailMismatch",
    "claim-failed": "errors.claimFailed",
  };

  const errorKey = resolvedSearchParams.error ? ERROR_KEYS[resolvedSearchParams.error] : undefined;
  const errorMessage = errorKey ? t(errorKey) : null;

  const hasBrands = brands.length > 0;
  const requestedTab = resolvedSearchParams.tab;
  const defaultTab = brands.at(0)?.brandSlug ?? SUBMISSIONS_TAB;
  const selectedTab =
    requestedTab && brands.some((brand) => brand.brandSlug === requestedTab)
      ? requestedTab
      : requestedTab === SUBMISSIONS_TAB
        ? SUBMISSIONS_TAB
        : defaultTab;

  const submissionsSection = (
    <div>
      <h2 className="font-heading text-xl font-semibold tracking-tight">
        {submissionsT("heading")}
      </h2>
      <p className="mt-2 text-sm text-[#7C7570]">
        {submissionsT("subheading")}
      </p>

      {submissions.length === 0 ? (
        <div className="mt-8 rounded-xl border border-[#E8E5E0] bg-white p-8 text-center">
          <p className="text-sm text-[#7C7570]">
            {submissionsT("empty.message")}
          </p>
          <IntlLink
            href="/submit"
            className="mt-4 inline-flex rounded-full bg-[#E06B3F] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#C85A33]"
          >
            {submissionsT("empty.cta")}
          </IntlLink>
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {submissions.map((sub) => (
            <div
              key={sub.id}
              className="flex items-center justify-between rounded-xl border border-[#E8E5E0] bg-white px-5 py-4"
            >
              <div>
                <p className="font-medium text-[#1A1918]">{sub.brandName}</p>
                <p className="mt-0.5 text-xs text-[#B0AAA4]">
                  {new Date(sub.createdAt).toLocaleDateString(
                    locale === "en" ? "en-US" : "zh-TW"
                  )}
                </p>
              </div>
              <Badge
                variant="outline"
                className={STATUS_COLORS[sub.status] ?? STATUS_COLORS.pending}
              >
                {sub.status === "approved"
                  ? submissionsT("status.approved")
                  : sub.status === "rejected"
                    ? submissionsT("status.rejected")
                    : submissionsT("status.pending")}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="font-heading text-3xl font-bold tracking-tight">
        {t("heading")}
      </h1>
      <p className="mt-2 text-muted-foreground">
        {t("welcome", { email: user?.email ?? "" })}
      </p>

      {errorMessage && (
        <div className="mt-4 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {errorMessage}
        </div>
      )}

      {hasBrands ? (
        <>
          <div className="mt-8 flex flex-wrap gap-1 border-b border-[#E8E5E0]">
            {brands.map((brand) => (
              <IntlLink
                key={brand.brandId}
                href={`/dashboard?tab=${brand.brandSlug}`}
                className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                  selectedTab === brand.brandSlug
                    ? "border-[#E06B3F] text-[#1A1918]"
                    : "border-transparent text-[#7C7570] hover:text-[#1A1918]"
                }`}
              >
                {brand.brandName}
              </IntlLink>
            ))}
            <IntlLink
              href={`/dashboard?tab=${SUBMISSIONS_TAB}`}
              className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                selectedTab === SUBMISSIONS_TAB
                  ? "border-[#E06B3F] text-[#1A1918]"
                  : "border-transparent text-[#7C7570] hover:text-[#1A1918]"
              }`}
            >
              {t("tabs.submissions")}
            </IntlLink>
          </div>

          <div className="mt-8">
            {selectedTab === SUBMISSIONS_TAB ? (
              submissionsSection
            ) : (
              <BrandManagementPanel slug={selectedTab} />
            )}
          </div>
        </>
      ) : (
        <div className="mt-8 space-y-12">
          <p className="text-sm text-muted-foreground">{t("empty")}</p>
          {submissionsSection}
        </div>
      )}
    </div>
  );
}
