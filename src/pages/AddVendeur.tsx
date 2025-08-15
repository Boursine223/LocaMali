import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, Calendar, Phone, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

const AddVendeur = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    password: "",
    numeroWhatsApp: "",
    dateDebut: "",
    dateFin: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const vendeurRes = await api.post("/admin/vendeurs", {
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        password: formData.password,
        dateDebut: formData.dateDebut,
        dateFin: formData.dateFin || null,
        actif: true,
      });
      const vendeurId = vendeurRes.data.id as number;

      const livreurRes = await api.post("/admin/livreurs", {
        nom: formData.nom,
        prenom: formData.prenom,
        numeroWhatsApp: formData.numeroWhatsApp,
        vendeurId,
      });
      const livreurId = livreurRes.data.id as number;

      await api.post("/admin/liens", { livreurId });

      toast({
        title: "Vendeur ajouté avec succès !",
        description: `${formData.prenom} ${formData.nom} a été ajouté, livreur et lien créés.`,
      });
      navigate("/admin/dashboard");
    } catch (e: any) {
      toast({ title: "Erreur", description: e?.response?.data?.error || "Impossible d'ajouter", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="bg-white shadow-soft border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/admin/dashboard")}
              className="mr-4 hover:bg-primary/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-foreground">Ajouter un vendeur</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="shadow-strong animate-fade-in">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 bg-gradient-accent rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-primary">
              <User className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Nouveau vendeur</CardTitle>
            <CardDescription className="text-base">
              Remplissez les informations du vendeur à ajouter
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Nom
                  </label>
                  <Input
                    type="text"
                    placeholder="Nom du vendeur"
                    value={formData.nom}
                    onChange={(e) => handleInputChange("nom", e.target.value)}
                    required
                    className="h-12 rounded-xl border-2 focus:border-primary transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Prénom
                  </label>
                  <Input
                    type="text"
                    placeholder="Prénom du vendeur"
                    value={formData.prenom}
                    onChange={(e) => handleInputChange("prenom", e.target.value)}
                    required
                    className="h-12 rounded-xl border-2 focus:border-primary transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="email@exemple.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                    className="h-12 rounded-xl border-2 focus:border-primary transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    Mot de passe
                  </label>
                  <Input
                    type="password"
                    placeholder="Mot de passe"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    required
                    className="h-12 rounded-xl border-2 focus:border-primary transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Numéro WhatsApp
                </label>
                <Input
                  type="tel"
                  placeholder="+33612345678"
                  value={formData.numeroWhatsApp}
                  onChange={(e) => handleInputChange("numeroWhatsApp", e.target.value)}
                  required
                  className="h-12 rounded-xl border-2 focus:border-primary transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Date de début
                  </label>
                  <Input
                    type="date"
                    value={formData.dateDebut}
                    onChange={(e) => handleInputChange("dateDebut", e.target.value)}
                    required
                    className="h-12 rounded-xl border-2 focus:border-primary transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Date de fin
                  </label>
                  <Input
                    type="date"
                    value={formData.dateFin}
                    onChange={(e) => handleInputChange("dateFin", e.target.value)}
                    
                    className="h-12 rounded-xl border-2 focus:border-primary transition-colors"
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-gradient-primary hover:bg-gradient-accent text-white font-semibold py-6 rounded-xl shadow-primary transition-all duration-300 hover:scale-105"
                  size="lg"
                >
                  {isLoading ? "Ajout en cours..." : "Ajouter le vendeur"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddVendeur;