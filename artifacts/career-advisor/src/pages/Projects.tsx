import { useState } from "react";
import { useListProjects, useCreateProject, useUpdateProject, useDeleteProject, getListProjectsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, Button, Dialog, Input, Label, Textarea, Select, Badge } from "@/components/ui";
import { Plus, Github, ExternalLink, Pencil, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Projects() {
  const { data: projects, isLoading } = useListProjects();
  const queryClient = useQueryClient();
  const createMutation = useCreateProject();
  const updateMutation = useUpdateProject();
  const deleteMutation = useDeleteProject();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    techStack: "",
    githubUrl: "",
    liveUrl: "",
    status: "in_progress" as any
  });

  const handleOpen = (proj?: any) => {
    if (proj) {
      setEditingId(proj.id);
      setFormData({
        title: proj.title,
        description: proj.description,
        techStack: proj.techStack || "",
        githubUrl: proj.githubUrl || "",
        liveUrl: proj.liveUrl || "",
        status: proj.status
      });
    } else {
      setEditingId(null);
      setFormData({
        title: "", description: "", techStack: "", githubUrl: "", liveUrl: "", status: "in_progress"
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await updateMutation.mutateAsync({ id: editingId, data: formData });
    } else {
      await createMutation.mutateAsync({ data: formData });
    }
    queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
    setIsDialogOpen(false);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Delete this project?")) {
      await deleteMutation.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
    }
  };

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading projects...</div>;

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-display font-bold text-white">Portfolio Projects</h1>
          <p className="text-muted-foreground mt-2">Showcase your best work to potential employers.</p>
        </div>
        <Button onClick={() => handleOpen()} className="shrink-0"><Plus size={18} className="mr-2" /> Add Project</Button>
      </div>

      {projects?.length === 0 ? (
        <Card className="text-center py-20 border-dashed border-2 bg-transparent">
          <p className="text-lg text-muted-foreground mb-4">No projects added yet.</p>
          <Button onClick={() => handleOpen()}>Create your first project</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects?.map((proj, idx) => (
            <motion.div key={proj.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className="h-full">
              <Card className="h-full flex flex-col group hover:border-primary/40 transition-colors">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-2xl">{proj.title}</CardTitle>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleOpen(proj)} className="text-muted-foreground hover:text-primary"><Pencil size={18}/></button>
                      <button onClick={() => handleDelete(proj.id)} className="text-muted-foreground hover:text-destructive"><Trash2 size={18}/></button>
                    </div>
                  </div>
                  <div className="mt-2">
                    <Badge variant={proj.status === 'completed' ? 'success' : proj.status === 'in_progress' ? 'default' : 'secondary'} className="capitalize">
                      {proj.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <p className="text-muted-foreground text-sm flex-1">{proj.description}</p>
                  
                  {proj.techStack && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {proj.techStack.split(',').map(t => t.trim()).filter(Boolean).map(tech => (
                        <span key={tech} className="text-xs px-2 py-1 rounded bg-secondary text-secondary-foreground border border-border">
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-6 flex items-center gap-4 pt-4 border-t border-border/50">
                    {proj.githubUrl && (
                      <a href={proj.githubUrl} target="_blank" rel="noreferrer" className="flex items-center text-sm text-muted-foreground hover:text-white transition-colors">
                        <Github size={16} className="mr-1" /> Repo
                      </a>
                    )}
                    {proj.liveUrl && (
                      <a href={proj.liveUrl} target="_blank" rel="noreferrer" className="flex items-center text-sm text-primary hover:text-primary-foreground transition-colors">
                        <ExternalLink size={16} className="mr-1" /> Live Demo
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} title={editingId ? "Edit Project" : "Add Project"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Project Title" />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="What did you build and why?" />
          </div>
          <div className="space-y-2">
            <Label>Tech Stack (comma separated)</Label>
            <Input value={formData.techStack} onChange={e => setFormData({...formData, techStack: e.target.value})} placeholder="React, Node.js, PostgreSQL" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>GitHub URL</Label>
              <Input type="url" value={formData.githubUrl} onChange={e => setFormData({...formData, githubUrl: e.target.value})} placeholder="https://github.com/..." />
            </div>
            <div className="space-y-2">
              <Label>Live URL</Label>
              <Input type="url" value={formData.liveUrl} onChange={e => setFormData({...formData, liveUrl: e.target.value})} placeholder="https://..." />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}>
              <option value="in_progress" className="bg-card text-foreground">In Progress</option>
              <option value="completed" className="bg-card text-foreground">Completed</option>
              <option value="paused" className="bg-card text-foreground">Paused</option>
            </Select>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save Project"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
