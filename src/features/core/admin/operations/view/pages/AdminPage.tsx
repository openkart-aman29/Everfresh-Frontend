import { AdminTable } from '@/features/core/admin/operations/view/components/AdminTable'

export default function AdminPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Admin Management</h2>
                    <p className="text-muted-foreground">
                        View and manage administrator accounts.
                    </p>
                </div>
                {/* Add 'Create Admin' button here later if needed */}
            </div>

            <AdminTable />
        </div>
    )
}
