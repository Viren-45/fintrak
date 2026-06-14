"use client";

import { useState } from "react";
import { toast } from "sonner";
import { deleteAccount } from "@/app/(app)/settings/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";

export default function DeleteAccountSection() {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);

    const result = await deleteAccount();

    // If we get here, deletion failed — success redirects away
    if (result?.error) {
      setIsDeleting(false);
      toast.error(result.error);
    }
  }

  return (
    <Card className="border-fintrak-expense/30 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-fintrak-expense">
          Danger Zone
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-base text-fintrak-text-primary">Delete account</p>
          <p className="text-md text-fintrak-text-secondary mt-1">
            Permanently delete your account and all associated data —
            transactions, goals, budgets, and settings. This action cannot be
            undone.
          </p>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              className="border-fintrak-expense/30 text-fintrak-expense hover:bg-red-50 hover:text-fintrak-expense"
            >
              <Trash2 size={14} className="mr-1.5" />
              Delete Account
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-fintrak-card border-fintrak-border">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-fintrak-text-primary">
                Are you absolutely sure?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-fintrak-text-secondary">
                This will permanently delete your account and all your data —
                every transaction, goal, budget, and setting. This cannot be
                undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-fintrak-border text-fintrak-text-secondary">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-fintrak-expense hover:bg-fintrak-expense/90 text-white"
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />
                    Deleting...
                  </>
                ) : (
                  "Delete Account"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
