"use client";

// Settings: profile (name, graduation year, diploma, daily limit), subjects (edit, add,
// delete), and extracurriculars (edit, add, delete). Saves go through the data provider.
// Imports: @/components/settings/*

import { ExtracurricularSettings } from "@/components/settings/ExtracurricularSettings";
import { ProfileSettings } from "@/components/settings/ProfileSettings";
import { SubjectSettings } from "@/components/settings/SubjectSettings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <h1 className="text-2xl font-semibold">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileSettings />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Subjects</CardTitle>
          <CardDescription>
            Your subjects and study plan. Each subject saves on its own.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SubjectSettings />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Extracurriculars</CardTitle>
          <CardDescription>Regular commitments, shown on your schedule.</CardDescription>
        </CardHeader>
        <CardContent>
          <ExtracurricularSettings />
        </CardContent>
      </Card>
    </div>
  );
}
