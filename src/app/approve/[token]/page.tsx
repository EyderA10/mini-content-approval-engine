import { createAdminClient } from '@/lib/supabase-admin'
import { notFound } from 'next/navigation'
import { ClientApprovalView } from '@/components/client/ClientApprovalView'

type Props = {
  params: Promise<{ token: string }>
}

export default async function ClientPage({ params }: Props) {
  const { token } = await params

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('content_pieces')
    .select('*')
    .eq('share_token', token)
    .single()

  if (error || !data) {
    return notFound()
  }

  return <ClientApprovalView content={data} token={token} />
}
