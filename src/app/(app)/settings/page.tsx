import SettingsForm from "@/components/settings/SettingsForm";

export default function SettingsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-fintrak-text-primary">
          Settings
        </h1>
        <p className="text-sm text-fintrak-text-secondary mt-1">
          Manage your profile and categories
        </p>
      </div>

      <SettingsForm />
    </div>
  );
}
