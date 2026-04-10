import { redirect } from 'next/navigation'
import { leadService } from '@/lib/services'
import { CrmBoard } from './_components/crm-board'

export default async function CrmPage() {
  try {
    const board = await leadService.getBoard()
    return <CrmBoard initialBoard={board} />
  } catch {
    redirect('/dashboard')
  }
}
