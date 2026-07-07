import { QueryTable } from "@/components/explorer/query-table";
import { AppShell } from "@/components/shell/app-shell";
import { getCurrentUser } from "@/lib/auth";
import { getExplorerPageData } from "@/lib/queries";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ExplorerPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const q = typeof params.q === "string" ? params.q : "";
  const user = await getCurrentUser();
  const data = await getExplorerPageData(user.id, q);

  return (
    <AppShell user={data.user}>
      <div className="mx-auto max-w-[1600px]">
        <QueryTable logs={data.logs} initialSearch={q} />
      </div>
    </AppShell>
  );
}
