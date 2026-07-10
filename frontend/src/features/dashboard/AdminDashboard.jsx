import React from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card, { CardBody } from '../../components/Card';
import { Sparkles, ShieldCheck } from 'lucide-react';

export const AdminDashboard = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Banner */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-brand-500 text-white rounded-2xl">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">Admin Console</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Logged in as {user?.email}</p>
              </div>
            </div>
            <div className="px-3 py-1 bg-brand-100 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 rounded-full text-xs font-bold uppercase tracking-wider">
              {user?.role?.replace('ROLE_', '')}
            </div>
          </div>
        </Card>

        {/* Status card */}
        <Card>
          <CardBody>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-2">System Status</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Authentication modules, database models, security layouts, and API tracing keys are fully operational.
            </p>
            <div className="flex items-center gap-2 text-xs text-brand-500 font-semibold">
              <Sparkles className="w-4 h-4 animate-spin" />
              Ready for Phase 6: System Analytics & User Management
            </div>
          </CardBody>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
