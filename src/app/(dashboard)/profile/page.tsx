import type { Metadata } from "next";
import { Building2, Mail, ShieldCheck, Landmark } from "lucide-react";
import { requireUser } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { ROLE_LABELS, ROLE_BADGE_STYLES } from "@/config/labels";
import { PageHeader } from "@/components/shared/page-header";
import { UserAvatar } from "@/components/shared/user-avatar";
import { ProfileForm } from "@/features/profile/components/profile-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const sessionUser = await requireUser();

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    include: {
      department: { select: { name: true, code: true } },
      agency: { select: { name: true, code: true } },
    },
  });
  if (!user) return null;

  return (
    <>
      <PageHeader
        title="My Profile"
        description="View and manage your DRISHTI nodal officer account credentials."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-6 text-center">
            <UserAvatar
              name={user.name}
              image={user.image}
              className="size-20 text-xl"
            />
            <div>
              <p className="font-semibold text-lg">{user.name}</p>
              <p className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                <Mail className="size-3.5" /> {user.email}
              </p>
            </div>
            <div className="flex flex-col items-center gap-2 pt-2 text-sm">
              <Badge variant="outline" className={ROLE_BADGE_STYLES[user.role]}>
                <ShieldCheck className="size-3.5 mr-1" /> {ROLE_LABELS[user.role]}
              </Badge>
              {user.department && (
                <span className="flex items-center gap-1.5 text-muted-foreground text-xs">
                  <Landmark className="size-3.5" /> Dept: {user.department.name} ({user.department.code})
                </span>
              )}
              {user.agency && (
                <span className="flex items-center gap-1.5 text-muted-foreground text-xs">
                  <Building2 className="size-3.5" /> Agency: {user.agency.name} ({user.agency.code})
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Account Information</CardTitle>
            </CardHeader>
            <CardContent>
              <ProfileForm
                isStudent={false}
                initial={{
                  name: user.name,
                  phone: "",
                  designation: "",
                  githubUrl: "",
                  linkedinUrl: "",
                  portfolioUrl: "",
                  skills: [],
                }}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

