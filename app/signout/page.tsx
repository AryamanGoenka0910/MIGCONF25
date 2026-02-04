import SignOutClient from "@/app/signout/signout-client";

type PageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default function SignOutPage({ searchParams }: PageProps) {
  const raw = searchParams?.returnTo;
  const returnTo = typeof raw === "string" && raw.startsWith("/") ? raw : "/signin";
  return <SignOutClient returnTo={returnTo} />;
}

