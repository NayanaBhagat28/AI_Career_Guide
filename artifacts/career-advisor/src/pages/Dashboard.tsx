import { useGetProfile, useListSkills, useListProjects, useListApplications } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Code2, Briefcase, GraduationCap, TrendingUp, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { data: profile, isLoading: profileLoading } = useGetProfile();
  const { data: skills, isLoading: skillsLoading } = useListSkills();
  const { data: projects, isLoading: projectsLoading } = useListProjects();
  const { data: applications, isLoading: appsLoading } = useListApplications();

  const isLoading = profileLoading || skillsLoading || projectsLoading || appsLoading;

  if (isLoading) {
    return <div className="flex h-full items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  }

  // Calculate stats
  const totalSkills = skills?.length || 0;
  const activeProjects = projects?.filter(p => p.status === "in_progress").length || 0;
  const totalApps = applications?.length || 0;
  const interviewing = applications?.filter(a => a.status === "interview" || a.status === "phone_screen").length || 0;

  // Chart data
  const statusCounts = applications?.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const chartData = [
    { name: "Wishlist", count: statusCounts.wishlist || 0 },
    { name: "Applied", count: statusCounts.applied || 0 },
    { name: "Interview", count: (statusCounts.phone_screen || 0) + (statusCounts.interview || 0) },
    { name: "Offers", count: statusCounts.offer || 0 },
  ];

  const colors = ["#6366f1", "#3b82f6", "#10b981", "#f59e0b"];

  const statCards = [
    { title: "Total Skills", value: totalSkills, icon: Code2, color: "text-blue-400", bg: "bg-blue-400/10" },
    { title: "Active Projects", value: activeProjects, icon: Briefcase, color: "text-indigo-400", bg: "bg-indigo-400/10" },
    { title: "Applications", value: totalApps, icon: GraduationCap, color: "text-purple-400", bg: "bg-purple-400/10" },
    { title: "Interviewing", value: interviewing, icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-400/10" },
  ];

  return (
    <div className="space-y-8 pb-12">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-display font-bold text-white">Welcome back, {profile?.name?.split(' ')[0] || 'Student'}! 👋</h1>
        <p className="text-muted-foreground mt-2 text-lg">Here's an overview of your career progression.</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <motion.div key={stat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card>
              <CardContent className="p-6 flex items-center gap-4">
                <div className={`p-4 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <h3 className="text-3xl font-display font-bold text-white mt-1">{stat.value}</h3>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Application Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip 
                    cursor={{fill: 'rgba(255,255,255,0.05)'}} 
                    contentStyle={{backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px'}}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Action Items</CardTitle>
          </CardHeader>
          <CardContent>
            {totalSkills === 0 && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-4">
                <AlertCircle className="text-amber-400 shrink-0 w-5 h-5" />
                <p className="text-sm text-amber-200">You haven't added any skills yet. Head to the Skills tab to build your profile.</p>
              </div>
            )}
            {activeProjects === 0 && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 mb-4">
                <Briefcase className="text-blue-400 shrink-0 w-5 h-5" />
                <p className="text-sm text-blue-200">Add an active project to show recruiters what you're working on.</p>
              </div>
            )}
            {(!profile?.bio || !profile?.targetRole) && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 mb-4">
                <Code2 className="text-purple-400 shrink-0 w-5 h-5" />
                <p className="text-sm text-purple-200">Complete your profile to get better AI recommendations.</p>
              </div>
            )}
            {totalSkills > 0 && activeProjects > 0 && profile?.bio && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🚀</span>
                </div>
                <p className="text-white font-medium">Profile is looking great!</p>
                <p className="text-sm text-muted-foreground mt-1">Keep applying to internships.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
