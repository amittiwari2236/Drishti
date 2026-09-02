"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Users, ChevronDown, ChevronRight, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { mockSuperAdminLogin, mockRoleLogin } from "@/features/auth/server-actions";
import { Button } from "@/components/ui/button";

const LEVELS = [
  { level: 1, name: 'Head / Manager' },
  { level: 2, name: 'Lead / Senior' },
  { level: 3, name: 'Staff / Executive' },
  { level: 4, name: 'Sub-role / Intern' }
];

export function LoginForm({ departments = [] }: { departments?: any[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loadingType, setLoadingType] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const [expandedLevels, setExpandedLevels] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
    4: true
  });

  const handleSuperAdminLogin = () => {
    setLoadingType("admin");
    startTransition(async () => {
      try {
        const res = await mockSuperAdminLogin();
        if (res.success) {
          toast.success("Logged in as Super Admin");
          router.push(searchParams.get("from") ?? "/dashboard");
          router.refresh();
        } else if (res.error) {
          toast.error(res.error);
        }
      } catch (err: any) {
        toast.error(err.message || "Login failed");
      } finally {
        setLoadingType(null);
      }
    });
  };

  const handleRoleLogin = (role: any, dept: any) => {
    setLoadingType(`role_${role.id}`);
    startTransition(async () => {
      try {
        const res = await mockRoleLogin({
          roleId: role.id,
          roleName: role.name || role.role,
          hierarchyLevel: role.hierarchy_level,
          departmentId: dept.id,
          isSubRole: role.is_sub_role || false
        });
        if (res.success) {
          toast.success(`Logged in as ${role.name || role.role}`);
          router.push(searchParams.get("from") ?? "/dashboard");
          router.refresh();
        } else if (res.error) {
          toast.error(res.error);
        }
      } catch (err: any) {
        toast.error(err.message || "Role Login failed");
      } finally {
        setLoadingType(null);
      }
    });
  };

  return (
    <div className="w-full space-y-8 bg-white p-8 rounded-xl shadow-sm border border-slate-200">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-[#0f1d40]">
          Development Login
        </h1>
        <p className="text-sm text-slate-500">
          API login is currently disabled. Use the options below.
        </p>
      </div>

      {/* Super Admin Section */}
      <div className="space-y-4">
        <Button
          onClick={handleSuperAdminLogin}
          disabled={loadingType !== null}
          className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-medium"
        >
          {loadingType === "admin" ? (
            <Loader2 className="size-4 animate-spin mr-2" />
          ) : (
            <ShieldCheck className="size-4 mr-2 text-emerald-400" />
          )}
          Login as Super Admin (admin@example.com)
        </Button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-slate-500 font-medium">Or Demo Roles</span>
        </div>
      </div>

      {/* Hierarchy Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Users className="size-5 text-indigo-600" />
          <h2 className="font-semibold text-slate-700">Role-Based Login</h2>
        </div>

        <div className="border border-slate-200 rounded-lg p-2 max-h-[400px] overflow-y-auto bg-slate-50">
          {LEVELS.map(lvl => {
            const rolesInLevel = departments
              .flatMap((d: any) => (d.roles || []).map((r: any) => ({ ...r, departmentName: d.name, departmentId: d.id })))
              .filter((r: any) => r.hierarchy_level === lvl.level);
            
            return (
              <div key={lvl.level} className="flex flex-col mb-2 last:mb-0">
                <button 
                  onClick={() => setExpandedLevels(prev => ({ ...prev, [lvl.level]: !prev[lvl.level] }))}
                  className="flex items-center gap-1.5 text-sm py-2 px-3 hover:bg-slate-200/50 rounded-md text-slate-700 font-semibold transition-colors"
                >
                  {expandedLevels[lvl.level] ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                  Level {lvl.level}: {lvl.name}
                </button>
                
                {expandedLevels[lvl.level] && (
                  <div className="flex flex-col ml-6 border-l-2 border-slate-200 pl-3 mt-1 gap-1.5">
                    {rolesInLevel.length === 0 && <span className="text-xs text-slate-400 py-1 italic">No roles available</span>}
                    {rolesInLevel.map((role: any) => {
                      const isLoggingIn = loadingType === `role_${role.id}`;
                      return (
                        <div key={role.id} className="flex items-center justify-between group hover:bg-white border border-transparent hover:border-slate-200 hover:shadow-sm rounded-md transition-all">
                          <span className="flex items-center gap-2 text-xs py-2 px-3 text-slate-600 font-medium">
                            {role.name || role.role}
                            <span className="text-[10px] text-slate-400 font-normal">({role.departmentName})</span>
                          </span>
                          <Button 
                            variant="secondary"
                            size="sm"
                            disabled={loadingType !== null}
                            onClick={() => handleRoleLogin(role, { id: role.departmentId })}
                            className="mr-2 h-7 text-[10px] bg-indigo-50 text-indigo-700 hover:bg-indigo-100 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                          >
                            {isLoggingIn ? <Loader2 className="size-3 animate-spin" /> : "Login"}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
