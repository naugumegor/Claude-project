import { getDictionary } from "@/dictionaries";

export async function Footer() {
  const dict = await getDictionary();
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted sm:flex-row sm:justify-between sm:px-6">
        <p>
          <span className="font-display font-bold text-ink">Ingenium</span> · {dict.footer.made}
        </p>
        <p>{dict.footer.shop}</p>
      </div>
    </footer>
  );
}
