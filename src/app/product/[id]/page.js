import { redirect } from 'next/navigation';

export default async function ProductRedirectPage({ params }) {
    const resolvedParams = await params;
    const id = resolvedParams?.id;
    if (!id) {
        redirect('/collection');
    }
    redirect(`/collection/${id}`);
}
