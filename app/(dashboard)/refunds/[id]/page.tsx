import ClientComponent from './ClientComponent';
export const dynamicParams = false;

// Server component wrapper
export default function Page() {
  return <ClientComponent />;
}

// Enable client-side rendering for dynamic routes
export async function generateStaticParams() {
  return [{ id: 'placeholder' }];
}
