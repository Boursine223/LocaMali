import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Plus, 
  Settings, 
  LogOut, 
  Eye,
  UserCheck,
  UserX,
  Calendar,
  Phone
} from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

type Vendeur = {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  actif: boolean;
  dateDebut: string;
  dateFin: string | null;
  livreurs: { id: number; numeroWhatsApp: string | null; lienLocalisation?: { id: number; url: string; clicks?: number } | null }[];
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [vendeurs, setVendeurs] = useState<Vendeur[]>([]);

  const loadVendeurs = async () => {
    try {
      const { data } = await api.get("/admin/vendeurs");
      if (Array.isArray(data)) {
        setVendeurs(data as Vendeur[]);
      } else {
        setVendeurs([]);
        toast({ title: "Erreur", description: "Réponse inattendue du serveur (vendeurs)", variant: "destructive" });
      }
    } catch (e: any) {
      toast({ title: "Erreur", description: e?.response?.data?.error || "Chargement impossible", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendeurs();
  }, []);

  const buildPublicLink = (token?: string | null) => {
    if (!token) return null;
    return `${window.location.origin}/localiser/${token}`;
  };

  const regenerateLink = async (livreurId: number) => {
    try {
      await api.post(`/admin/livreurs/${livreurId}/regenerate-link`);
      await loadVendeurs();
      toast({ title: "Lien régénéré", description: "Un nouveau lien a été créé." });
    } catch (e: any) {
      toast({ title: "Erreur", description: e?.response?.data?.error || "Impossible de régénérer le lien", variant: "destructive" });
    }
  };

  const toggleVendeurStatus = async (id: number, current: boolean) => {
    try {
      const vendeur = vendeurs.find(v => v.id === id);
      await api.put(`/admin/vendeurs/${id}`, { actif: !current });
      setVendeurs(prev => prev.map(v => (v.id === id ? { ...v, actif: !current } : v)));
      toast({ title: !current ? "Activé" : "Désactivé", description: vendeur ? `${vendeur.prenom} ${vendeur.nom}` : "Compte" });
    } catch (e: any) {
      toast({ title: "Erreur", description: e?.response?.data?.error || "Action impossible", variant: "destructive" });
    }
  };

  const handleLogout = () => {
    api.delete('/session').finally(() => {
      navigate("/admin/login");
    });
  };

  const totalClients = vendeurs.reduce((sum, v) => sum + (v.livreurs?.length || 0), 0);
  const vendeursActifs = vendeurs.filter(v => v.actif).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="bg-white shadow-soft border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <h1 className="text-xl font-bold text-foreground">LocaMali Admin</h1>
            </div>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="border-2 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-medium hover:shadow-strong transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Vendeurs</p>
                  <p className="text-2xl font-bold text-foreground">{vendeurs.length}</p>
                </div>
                <Users className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-medium hover:shadow-strong transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Vendeurs Actifs</p>
                  <p className="text-2xl font-bold text-accent">{vendeursActifs}</p>
                </div>
                <UserCheck className="w-8 h-8 text-accent" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-medium hover:shadow-strong transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Clients</p>
                  <p className="text-2xl font-bold text-primary">{totalClients}</p>
                </div>
                <Users className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Button 
            onClick={() => navigate("/admin/add")}
            className="bg-gradient-primary hover:bg-gradient-accent text-white shadow-primary transition-all duration-300 hover:scale-105"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un vendeur
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate("/admin/clients")}
            className="border-2 hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            <Eye className="w-4 h-4 mr-2" />
            Voir les clients
          </Button>
        </div>

        {/* Vendeurs Table */}
        <Card className="shadow-strong">
          <CardHeader>
            <CardTitle className="text-xl">Liste des Vendeurs</CardTitle>
            <CardDescription>Gérez vos vendeurs et suivez les clics sur le lien</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full border rounded-xl overflow-hidden">
                <thead className="bg-muted/50">
                  <tr className="text-left text-sm text-muted-foreground">
                    <th className="px-4 py-3">Vendeur</th>
                    <th className="px-4 py-3">Période</th>
                    <th className="px-4 py-3">Statut</th>
                    <th className="px-4 py-3">Livreur WhatsApp</th>
                    <th className="px-4 py-3">Lien</th>
                    <th className="px-4 py-3">Clics</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr><td className="px-4 py-4" colSpan={7}>Chargement...</td></tr>
                  )}
                  {!loading && vendeurs.map((vendeur) => {
                    const livreur = vendeur.livreurs?.[0];
                    const token = livreur?.lienLocalisation?.url;
                    const link = buildPublicLink(token);
                    const clicks = livreur?.lienLocalisation?.clicks ?? 0;
                    return (
                      <tr key={vendeur.id} className="border-t hover:bg-muted/30">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="font-medium text-foreground">{vendeur.prenom} {vendeur.nom}</div>
                          <div className="text-xs text-muted-foreground">{vendeur.email}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1 text-sm"><Calendar className="w-4 h-4" /> {new Date(vendeur.dateDebut).toLocaleDateString("fr-FR")} → {vendeur.dateFin ? new Date(vendeur.dateFin).toLocaleDateString("fr-FR") : "—"}</div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={vendeur.actif ? "default" : "secondary"} className={vendeur.actif ? "bg-accent" : ""}>
                            {vendeur.actif ? "actif" : "inactif"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-1"><Phone className="w-4 h-4" /> {livreur?.numeroWhatsApp || "—"}</div>
                        </td>
                        <td className="px-4 py-3 max-w-[280px]">
                          {link ? (
                            <a href={link} target="_blank" rel="noreferrer" className="text-sm text-primary underline underline-offset-2">
                              {link}
                            </a>
                          ) : (
                            <span className="text-sm text-muted-foreground">Lien non généré</span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-semibold">{clicks}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleVendeurStatus(vendeur.id, vendeur.actif)}
                              className={`border-2 ${
                                vendeur.actif
                                  ? "border-warning text-warning hover:bg-warning hover:text-warning-foreground"
                                  : "border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                              }`}
                            >
                              {vendeur.actif ? (<><UserX className="w-4 h-4 mr-2" />Désactiver</>) : (<><UserCheck className="w-4 h-4 mr-2" />Activer</>)}
                            </Button>
                            {livreur && (
                              <Button variant="outline" size="sm" onClick={() => regenerateLink(livreur.id)} className="border-2">
                                <Settings className="w-4 h-4 mr-2" /> Régénérer
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;