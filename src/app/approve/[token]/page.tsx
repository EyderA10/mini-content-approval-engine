import { createAdminClient } from '@/lib/supabase-admin'
import { notFound } from 'next/navigation'
import { ClientApprovalView } from '@/components/client/ClientApprovalView'
import { DBColumn, DBTable } from '@/lib/enums'

type Props = {
  params: Promise<{ token: string }>
}

export default async function ClientPage({ params }: Props) {
  const { token } = await params

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from(DBTable.ContentPieces)
    .select('*')
    .eq(DBColumn.ShareToken, token)
    .single()

  if (error || !data) {
    return notFound()
  }

  return <ClientApprovalView content={data} token={token} />
}
