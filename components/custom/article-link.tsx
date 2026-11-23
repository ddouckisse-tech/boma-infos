"use client";

import Link from "next/link";
import { usePreferences } from "@/components/providers/preferences-provider";
import { articlePath } from "@/lib/article-locale";

export function ArticleLink({
  slug,
  ...props
}: Omit<React.ComponentProps<typeof Link>, "href" | "prefetch"> & {
  slug: string;
}) {
  const { locale } = usePreferences();
  return <Link {...props} href={articlePath(slug, locale)} prefetch={false} />;
}
