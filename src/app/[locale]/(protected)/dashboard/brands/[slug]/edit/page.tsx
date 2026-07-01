import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { completeOnboardingStepAction } from "@/lib/actions/brand-onboarding";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { canManageDashboardBrand } from "@/lib/auth/admin-mode";
import { getBrandBySlug, getBrandDraft } from "@/lib/services/brands";
import { DraftBanner } from "../draft-banner";
import { BrandEditForm } from "./brand-edit-form";
import { isOnboardingStepKey } from "@/lib/services/brand-onboarding";

type Props = {
  params: Promise<{ slug: string; locale: string }>;
  searchParams: Promise<{ onboardingStep?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard.edit" });
  return { title: t("metaTitle") };
}

export default async function BrandEditPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { onboardingStep: rawOnboardingStep } = await searchParams;
  const onboardingStep = rawOnboardingStep && isOnboardingStepKey(rawOnboardingStep)
    ? rawOnboardingStep
    : undefined;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/sign-in");

  const brand = await getBrandBySlug(slug);
  const owner = await canManageDashboardBrand(user.id, user.email, brand.id, brand.slug);

  if (!owner) redirect("/dashboard");

  const draft = await getBrandDraft(brand.id);
  const t = await getTranslations("dashboard.edit");

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-heading text-2xl font-bold tracking-tight">
        {t("pageHeading", { name: brand.name })}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {t("pageSubheading")}
      </p>

      <div className="mt-8">
        {onboardingStep ? (
          <div className="mb-8 rounded-xl border border-primary/20 bg-primary/5 p-4">
            <h2 className="font-heading font-bold text-foreground">
              {t("onboardingReviewTitle")}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("onboardingReviewDescription")}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <form action={completeOnboardingStepAction.bind(null, slug, onboardingStep)}>
                <Button type="submit" variant="outline">
                  {t("onboardingConfirm")}
                </Button>
              </form>
              <Link
                href={`/dashboard/onboarding?brand=${slug}`}
                className="inline-flex min-h-10 items-center px-2 text-sm font-semibold text-foreground underline-offset-4 hover:underline"
              >
                {t("onboardingBack")}
              </Link>
            </div>
          </div>
        ) : null}
        {draft ? (
          <div className="mb-8">
            <DraftBanner slug={brand.slug} draftUpdatedAt={null} />
          </div>
        ) : null}
        <BrandEditForm brand={brand} onboardingStep={onboardingStep} />
      </div>
    </div>
  );
}
