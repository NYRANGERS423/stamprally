import { requireAdmin } from "@/lib/auth/admin-guard";
import { getPhotoSettings } from "@/lib/app-config";
import { PhotoSettingsForm } from "@/components/admin/PhotoSettingsForm";

export default async function AdminSettingsPage() {
  await requireAdmin();
  const photoSettings = await getPhotoSettings();
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
          Runtime configuration. Affects future uploads only.
        </p>
      </div>
      <section className="overflow-hidden rounded-lg border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900">
        <div className="border-b border-stone-200 px-4 py-3 dark:border-stone-800">
          <h2 className="text-sm font-medium">Photo uploads</h2>
        </div>
        <div className="p-4">
          <PhotoSettingsForm
            maxMb={photoSettings.maxMb}
            outputPx={photoSettings.outputPx}
            outputQuality={photoSettings.outputQuality}
          />
        </div>
      </section>
    </div>
  );
}
