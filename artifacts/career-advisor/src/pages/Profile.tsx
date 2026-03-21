import { useState, useEffect } from "react";
import { useGetProfile, useUpdateProfile, getGetProfileQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label, Textarea } from "@/components/ui";
import { UserCircle, Save } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const { data: profile, isLoading } = useGetProfile();
  const updateProfile = useUpdateProfile();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    school: "",
    major: "",
    graduationYear: new Date().getFullYear(),
    targetRole: "",
    bio: "",
    linkedinUrl: "",
    githubUrl: ""
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        email: profile.email || "",
        school: profile.school || "",
        major: profile.major || "",
        graduationYear: profile.graduationYear || new Date().getFullYear(),
        targetRole: profile.targetRole || "",
        bio: profile.bio || "",
        linkedinUrl: profile.linkedinUrl || "",
        githubUrl: profile.githubUrl || ""
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile.mutateAsync({ data: formData });
      queryClient.invalidateQueries({ queryKey: getGetProfileQueryKey() });
      toast({ title: "Profile Updated", description: "Your details have been saved successfully." });
    } catch (err) {
      toast({ title: "Error", description: "Failed to update profile.", variant: "destructive" });
    }
  };

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading profile...</div>;

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      <div>
        <h1 className="text-4xl font-display font-bold text-white flex items-center gap-3">
          <UserCircle className="text-primary w-10 h-10" /> Your Profile
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">Keep your details up to date for the best AI recommendations.</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-card/80 backdrop-blur-md">
          <form onSubmit={handleSubmit}>
            <CardHeader className="border-b border-border/50 bg-black/10">
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6 mt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>School / University</Label>
                  <Input value={formData.school} onChange={e => setFormData({...formData, school: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Major</Label>
                    <Input value={formData.major} onChange={e => setFormData({...formData, major: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Grad Year</Label>
                    <Input type="number" value={formData.graduationYear} onChange={e => setFormData({...formData, graduationYear: parseInt(e.target.value) || new Date().getFullYear()})} />
                  </div>
                </div>
              </div>

              <div className="border-t border-border/50 pt-6 space-y-6">
                <h3 className="text-lg font-display font-semibold text-white">Career Goals</h3>
                <div className="space-y-2">
                  <Label>Target Role</Label>
                  <Input value={formData.targetRole} onChange={e => setFormData({...formData, targetRole: e.target.value})} placeholder="e.g. Full Stack Developer" />
                </div>
                <div className="space-y-2">
                  <Label>Professional Bio</Label>
                  <Textarea value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} placeholder="A short bio about your passions and experience..." className="min-h-[100px]" />
                </div>
              </div>

              <div className="border-t border-border/50 pt-6 space-y-6">
                <h3 className="text-lg font-display font-semibold text-white">Links</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>LinkedIn URL</Label>
                    <Input type="url" value={formData.linkedinUrl} onChange={e => setFormData({...formData, linkedinUrl: e.target.value})} placeholder="https://linkedin.com/in/..." />
                  </div>
                  <div className="space-y-2">
                    <Label>GitHub URL</Label>
                    <Input type="url" value={formData.githubUrl} onChange={e => setFormData({...formData, githubUrl: e.target.value})} placeholder="https://github.com/..." />
                  </div>
                </div>
              </div>

              <div className="pt-6 flex justify-end">
                <Button type="submit" size="lg" disabled={updateProfile.isPending}>
                  <Save className="w-5 h-5 mr-2" /> 
                  {updateProfile.isPending ? "Saving..." : "Save Profile"}
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
