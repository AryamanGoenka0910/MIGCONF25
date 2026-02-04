import SignOutClient from "@/app/signout/signout-client";

type PageProps = {
  // Next 15 types `searchParams` as a Promise in generated PageProps.
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SignOutPage({ searchParams }: PageProps) {
  const sp = (await searchParams) ?? {};
  const raw = sp.returnTo;
  const returnTo = typeof raw === "string" && raw.startsWith("/") ? raw : "/signin";
  return <SignOutClient returnTo={returnTo} />;
}

