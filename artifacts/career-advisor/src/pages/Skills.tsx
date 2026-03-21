import { useState } from "react";
import { useListSkills, useCreateSkill, useUpdateSkill, useDeleteSkill, getListSkillsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, Button, Dialog, Input, Label, Select, Badge } from "@/components/ui";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Skills() {
  const { data: skills, isLoading } = useListSkills();
  const queryClient = useQueryClient();
  const createMutation = useCreateSkill();
  const updateMutation = useUpdateSkill();
  const deleteMutation = useDeleteSkill();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    category: "technical" as any,
    proficiency: "intermediate" as any
  });

  const handleOpen = (skill?: any) => {
    if (skill) {
      setEditingId(skill.id);
      setFormData({ name: skill.name, category: skill.category, proficiency: skill.proficiency });
    } else {
      setEditingId(null);
      setFormData({ name: "", category: "technical", proficiency: "intermediate" });
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
    queryClient.invalidateQueries({ queryKey: getListSkillsQueryKey() });
    setIsDialogOpen(false);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Delete this skill?")) {
      await deleteMutation.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: getListSkillsQueryKey() });
    }
  };

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading skills...</div>;

  const categories = ["technical", "soft", "language", "tool", "framework", "other"];
  const proficiencies = ["beginner", "intermediate", "advanced", "expert"];

  const groupedSkills = categories.map(cat => ({
    category: cat,
    items: skills?.filter(s => s.category === cat) || []
  })).filter(g => g.items.length > 0);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-display font-bold text-white">Skills Matrix</h1>
          <p className="text-muted-foreground mt-2">Track what you know and identify gaps.</p>
        </div>
        <Button onClick={() => handleOpen()} className="shrink-0"><Plus size={18} className="mr-2" /> Add Skill</Button>
      </div>

      {groupedSkills.length === 0 ? (
        <Card className="text-center py-20 border-dashed border-2 bg-transparent">
          <p className="text-lg text-muted-foreground mb-4">No skills added yet.</p>
          <Button onClick={() => handleOpen()}>Add your first skill</Button>
        </Card>
      ) : (
        <div className="space-y-8">
          {groupedSkills.map((group) => (
            <div key={group.category}>
              <h2 className="text-xl font-display font-semibold text-white capitalize mb-4 pb-2 border-b border-border/50">
                {group.category} Skills
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {group.items.map((skill, idx) => (
                  <motion.div key={skill.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }}>
                    <Card className="group hover:border-primary/50 transition-colors">
                      <CardContent className="p-5 flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-white text-lg">{skill.name}</h3>
                          <Badge variant={
                            skill.proficiency === 'expert' ? 'success' : 
                            skill.proficiency === 'advanced' ? 'default' : 
                            skill.proficiency === 'intermediate' ? 'secondary' : 'warning'
                          } className="mt-2 capitalize">
                            {skill.proficiency}
                          </Badge>
                        </div>
                        <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleOpen(skill)} className="text-muted-foreground hover:text-primary"><Pencil size={16}/></button>
                          <button onClick={() => handleDelete(skill.id)} className="text-muted-foreground hover:text-destructive"><Trash2 size={16}/></button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} title={editingId ? "Edit Skill" : "Add Skill"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Skill Name</Label>
            <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. React, Python, Public Speaking" />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as any})}>
              {categories.map(c => <option key={c} value={c} className="bg-card text-foreground">{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Proficiency</Label>
            <Select value={formData.proficiency} onChange={e => setFormData({...formData, proficiency: e.target.value as any})}>
              {proficiencies.map(p => <option key={p} value={p} className="bg-card text-foreground">{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
            </Select>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save Skill"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
