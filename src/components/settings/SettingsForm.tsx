"use client";

import { useState } from "react";
import { useSettings } from "@/hooks/useSettings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import CategoryManager from "./CategoryManager";
import DeleteAccountSection from "./DeleteAccountSection";
import AvatarUpload from "@/components/settings/AvatarUpload";

export default function SettingsForm() {
  const {
    settings,
    isLoading,
    error,
    saveSettings,
    saveUserName,
    isSaving,
    isSavingName,
  } = useSettings();

  const [userName, setUserName] = useState("");
  const [expenseCategories, setExpenseCategories] = useState<string[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<string[]>([]);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [initialized, setInitialized] = useState(false);
  if (!isLoading && !initialized) {
    setUserName(settings.userName);
    setExpenseCategories(settings.expenseCategories);
    setIncomeCategories(settings.incomeCategories);
    setInitialized(true);
  }

  const isSavingAny = isSaving || isSavingName;

  async function handleSave() {
    setSaveSuccess(false);
    try {
      const promises: Promise<unknown>[] = [];

      if (userName !== settings.userName) {
        promises.push(saveUserName(userName));
      }

      promises.push(
        saveSettings({
          currency: settings.currency,
          expenseCategories,
          incomeCategories,
        }),
      );

      await Promise.all(promises);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      // error is surfaced via useSettings error state
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2
          size={24}
          className="animate-spin text-fintrak-text-secondary"
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-fintrak-expense/30 rounded-md px-4 py-3">
          <p className="text-sm text-fintrak-expense">{error}</p>
        </div>
      )}

      {/* Profile */}
      <Card className="border-fintrak-border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-fintrak-text-primary">
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* ── Avatar ── */}
          <div className="space-y-2">
            <Label className="text-fintrak-text-primary text-sm font-medium">
              Profile photo
            </Label>
            <AvatarUpload />
            <p className="text-xs text-fintrak-text-secondary">
              Shown in the sidebar and your profile. JPG, PNG, or WebP accepted.
            </p>
          </div>

          {/* ── Divider ── */}
          <div style={{ borderColor: "#E2E8F0" }} className="border-t" />

          {/* ── Name ── */}
          <div className="space-y-1.5">
            <Label className="text-fintrak-text-primary text-sm font-medium">
              Your name
            </Label>
            <Input
              placeholder="e.g. Viren"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="border-fintrak-border focus-visible:ring-fintrak-accent max-w-sm"
            />
            <p className="text-xs text-fintrak-text-secondary">
              Used in AI Advisor greetings
            </p>
          </div>

          {/* ── Currency ── */}
          <div className="space-y-1.5">
            <Label className="text-fintrak-text-primary text-sm font-medium">
              Currency
            </Label>
            <Input
              value="CAD"
              disabled
              className="border-fintrak-border bg-fintrak-bg text-fintrak-text-secondary max-w-sm"
            />
            <p className="text-xs text-fintrak-text-secondary">
              Currency is fixed to CAD
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Expense Categories */}
      <Card className="border-fintrak-border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-fintrak-text-primary">
            Expense Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryManager
            title="Manage your expense categories"
            type="expense"
            categories={expenseCategories}
            onChange={setExpenseCategories}
            permanentItems={["Other"]}
          />
        </CardContent>
      </Card>

      {/* Income Categories */}
      <Card className="border-fintrak-border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-fintrak-text-primary">
            Income Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryManager
            title="Manage your income categories"
            type="income"
            categories={incomeCategories}
            onChange={setIncomeCategories}
            permanentItems={["Opening Balance", "Other"]}
          />
        </CardContent>
      </Card>

      {/* Save */}
      <div className="flex items-center gap-3">
        <Button
          onClick={handleSave}
          disabled={isSavingAny}
          className="bg-fintrak-accent hover:bg-fintrak-accent/90 text-white px-8"
        >
          {isSavingAny ? (
            <>
              <Loader2 size={16} className="animate-spin mr-2" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>

        {saveSuccess && (
          <p className="text-sm text-fintrak-income font-medium">
            ✓ Settings saved
          </p>
        )}
      </div>

      {/* Danger zone */}
      <DeleteAccountSection />
    </div>
  );
}
