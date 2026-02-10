import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { logout } from '@/routes';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onLogout?: () => void;
};

export function LogoutConfirmDialog({ open, onOpenChange, onLogout }: Props) {
    const handleLogout = () => {
        onLogout?.();
        onOpenChange(false);
        router.post(logout());
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="sm:max-w-md"
                onPointerDownOutside={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle>Log out</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to log out? You will need to sign
                        in again to access your account.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={handleLogout}
                        data-test="logout-confirm-button"
                    >
                        Log out
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
