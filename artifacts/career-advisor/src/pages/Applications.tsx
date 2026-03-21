import { useState } from "react";
import { useListApplications, useCreateApplication, useUpdateApplication, useDeleteApplication, getListApplicationsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, Button, Dialog, Input, Label, Textarea, Select, Badge } from "@/components/ui";
import { Plus, Pencil, Trash2, Building2, MapPin, Calendar, ExternalLink } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { motion } from "framer-motion";

const STATUSES = ["wishlist", "applied", "phone_screen", "interview", "offer", "rejected", "accepted"] as const;

const STATUS_COLORS: Record<string, string> = {
  wishlist: "border-slate-500/30 bg-slate-500/10 text-slate-400",
  applied: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  phone_screen: "border-purple-500/30 bg-purple-500/10 text-purple-400",
  interview: "border-indigo-500/30 bg-indigo-500/10 text-indigo-400",
  offer: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  accepted: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  rejected: "border-red-500/30 bg-red-500/10 text-red-400",
};

export default function Applications() {
  const { data: applications, isLoading } = useListApplications();
  const queryClient = useQueryClient();
  const createMutation = useCreateApplication();
  const updateMutation = useUpdateApplication();
  const deleteMutation = useDeleteApplication();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    company: "",
    role: "",
    location: "",
    status: "wishlist" as any,
    appliedDate: "",
    notes: "",
    jobUrl: ""
  });

  const handleOpen = (app?: any) => {
    if (app) {
      setEditingId(app.id);
      setFormData({
        company: app.company,
        role: app.role,
        location: app.location || "",
        status: app.status,
        appliedDate: app.appliedDate ? new Date(app.appliedDate).toISOString().split('T')[0] : "",
        notes: app.notes || "",
        jobUrl: app.jobUrl || ""
      });
    } else {
      setEditingId(null);
      setFormData({
        company: "", role: "", location: "", status: "wishlist", appliedDate: new Date().toISOString().split('T')[0], notes: "", jobUrl: ""
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...formData, appliedDate: formData.appliedDate || undefined };
    if (editingId) {
      await updateMutation.mutateAsync({ id: editingId, data: payload });
    } else {
      await createMutation.mutateAsync({ data: payload });
    }
    queryClient.invalidateQueries({ queryKey: getListApplicationsQueryKey() });
    setIsDialogOpen(false);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Delete this application?")) {
      await deleteMutation.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: getListApplicationsQueryKey() });
    }
  };

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading applications...</div>;

  return (
    <div className="space-y-8 pb-12 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-4xl font-display font-bold text-white">Internship Tracker</h1>
          <p className="text-muted-foreground mt-2">Manage your pipeline from wishlist to offer.</p>
        </div>
        <Button onClick={() => handleOpen()}><Plus size={18} className="mr-2" /> Add Application</Button>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-6 min-w-max h-full items-start">
          {STATUSES.map(status => {
            const columnApps = applications?.filter(a => a.status === status) || [];
            return (
              <div key={status} className="w-80 flex flex-col gap-4 bg-card/30 p-4 rounded-2xl border border-border/50 shrink-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-white capitalize">{status.replace('_', ' ')}</h3>
                  <Badge variant="secondary">{columnApps.length}</Badge>
                </div>
                
                <div className="flex flex-col gap-3">
                  {columnApps.map(app => (
                    <Card key={app.id} className="group cursor-pointer hover:border-primary/50 transition-all shadow-md" onClick={() => handleOpen(app)}>
                      <CardContent className="p-4 relative">
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(app.id); }} className="text-muted-foreground hover:text-destructive p-1">
                            <Trash2 size={14}/>
                          </button>
                        </div>
                        
                        <h4 className="font-semibold text-white text-lg truncate pr-6">{app.company}</h4>
                        <p className="text-sm text-primary font-medium truncate">{app.role}</p>
                        
                        <div className="mt-3 space-y-1.5">
                          {app.location && (
                            <div className="flex items-center text-xs text-muted-foreground">
                              <MapPin size={12} className="mr-1.5 shrink-0" />
                              <span className="truncate">{app.location}</span>
                            </div>
                          )}
                          {app.appliedDate && (
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Calendar size={12} className="mr-1.5 shrink-0" />
                              <span>{formatDate(app.appliedDate)}</span>
                            </div>
                          )}
                          {app.jobUrl && (
                            <a href={app.jobUrl} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} className="flex items-center text-xs text-indigo-400 hover:underline">
                              <ExternalLink size={12} className="mr-1.5 shrink-0" /> Job Link
                            </a>
                          )}
                        </div>
                        <div className={`mt-3 w-full h-1 rounded-full ${STATUS_COLORS[status].split(' ')[0].replace('border-', 'bg-')}`} />
                      </CardContent>
                    </Card>
                  ))}
                  {columnApps.length === 0 && (
                    <div className="border-2 border-dashed border-border/50 rounded-xl p-6 text-center text-muted-foreground text-sm">
                      Drop area empty
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Dialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} title={editingId ? "Edit Application" : "Add Application"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Company</Label>
              <Input required value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} placeholder="Google, Stripe..." />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Input required value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} placeholder="Software Engineer Intern" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}>
                {STATUSES.map(s => <option key={s} value={s} className="bg-card">{s.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date Applied</Label>
              <Input type="date" value={formData.appliedDate} onChange={e => setFormData({...formData, appliedDate: e.target.value})} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Location</Label>
              <Input value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="San Francisco, CA" />
            </div>
            <div className="space-y-2">
              <Label>Job Posting URL</Label>
              <Input type="url" value={formData.jobUrl} onChange={e => setFormData({...formData, jobUrl: e.target.value})} placeholder="https://..." />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Met recruiter at career fair..." className="min-h-[80px]" />
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save Application"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
