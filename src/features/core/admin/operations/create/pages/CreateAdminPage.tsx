import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CreateAdminForm } from '@/features/core/admin/operations/create/components/CreateAdminForm'

export default function CreateAdminPage() {
    const navigate = useNavigate()

    return (
        <div className="container max-w-full py-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate('/app/admin')}
                    className="rounded-full"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Create Admin</h2>
                    <p className="text-muted-foreground">
                        Add a new administrator to your organization.
                    </p>
                </div>
            </div>

            <div className="grid col-span-12 gap-6">
                <CreateAdminForm />
            </div>
        </div>
    )
}
