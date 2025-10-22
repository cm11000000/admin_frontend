import ChargebackDetailsPage from './ChargebackDetails';
export const dynamicParams = false;
export const prerender = true;

// Server component wrapper with generateStaticParams for static export
export default function Page() {
  return <ChargebackDetailsPage />;
}

// Generate a placeholder param so Next can export.
// Deep links are handled via SPA fallback at runtime.
export async function generateStaticParams() {
  return [{ id: 'placeholder' }];
}
