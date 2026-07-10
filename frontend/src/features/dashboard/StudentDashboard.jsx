import React from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card, { CardBody } from '../../components/Card';
import { Sparkles, GraduationCap } from 'lucide-react';

export const StudentDashboard = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Banner */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-brand-500 text-white rounded-2xl">
                <GraduationCap className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">Welcome back, {user?.name}!</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Logged in as {user?.email}</p>
              </div>
            </div>
            <div className="px-3 py-1 bg-brand-100 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 rounded-full text-xs font-bold uppercase tracking-wider">
              {user?.role?.replace('ROLE_', '')}
            </div>
          </div>
        </Card>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardBody>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">Academic Profile</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-slate-100 dark:border-darkbg-border pb-2">
                  <span className="text-slate-400">College / University</span>
                  <span className="font-semibold">{user?.college || 'Not specified'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 dark:border-darkbg-border pb-2">
                  <span className="text-slate-400">Branch / Major</span>
                  <span className="font-semibold">{user?.branch || 'Not specified'}</span>
                </div>
                <div className="flex justify-between pb-1">
                  <span className="text-slate-400">Active Semester</span>
                  <span className="font-semibold">{user?.semester || 'Not specified'}</span>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="flex flex-col justify-between">
            <CardBody className="flex flex-col h-full justify-between">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-2">Phase 1 Status</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Authentication modules, database models, and layout components are fully operational.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-xs text-brand-500 font-semibold">
                <Sparkles className="w-4 h-4 animate-spin" />
                Ready for Phase 2: Uploads & Statistics
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
