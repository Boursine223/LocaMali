import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, 
  Users, 
  Search,
  Calendar,
  Phone,
  User
} from "lucide-react";

// Données de simulation - remplacer par Supabase
const mockClients = [
  {
    id: 1,
    nom: "Dupont",
    prenom: "Michel",
    telephone: "+33612345678",
    dateInscription: "2024-01-20",
    vendeurNom: "Martin Jean",
    vendeurId: 1
  },
  {
    id: 2,
    nom: "Bernard", 
    prenom: "Sophie",
    telephone: "+33687654321",
    dateInscription: "2024-01-22",
    vendeurNom: "Martin Jean",
    vendeurId: 1
  },
  {
    id: 3,
    nom: "Petit",
    prenom: "Lucas",
    telephone: "+33698765432",
    dateInscription: "2024-02-05",
    vendeurNom: "Dubois Marie",
    vendeurId: 2
  },
  {
    id: 4,
    nom: "Robert",
    prenom: "Emma",
    telephone: "+33612987654",
    dateInscription: "2024-02-10",
    vendeurNom: "Leroy Pierre",
    vendeurId: 3
  }
];

const ClientsList = () => {
  const navigate = useNavigate();
  const [clients] = useState(mockClients);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredClients = clients.filter(client =>
    client.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.vendeurNom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Statistiques
  const totalClients = clients.length;
  const clientsParVendeur = clients.reduce((acc, client) => {
    acc[client.vendeurNom] = (acc[client.vendeurNom] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

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
                <Users className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-foreground">Liste des clients</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
          
          {Object.entries(clientsParVendeur).slice(0, 3).map(([vendeur, count]) => (
            <Card key={vendeur} className="shadow-medium hover:shadow-strong transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground truncate">{vendeur}</p>
                    <p className="text-2xl font-bold text-accent">{count}</p>
                  </div>
                  <User className="w-8 h-8 text-accent" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search */}
        <Card className="shadow-medium mb-6">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom, prénom ou vendeur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 rounded-xl border-2 focus:border-primary transition-colors"
              />
            </div>
          </CardContent>
        </Card>

        {/* Clients Table */}
        <Card className="shadow-strong">
          <CardHeader>
            <CardTitle className="text-xl">Clients inscrits</CardTitle>
            <CardDescription>
              Liste de tous les clients avec leurs informations d'inscription
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredClients.map((client) => (
                <div key={client.id} className="border rounded-xl p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg">
                          {client.prenom} {client.nom}
                        </h3>
                        <Badge variant="outline" className="border-primary text-primary">
                          Client
                        </Badge>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {client.telephone}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Inscrit le {new Date(client.dateInscription).toLocaleDateString("fr-FR")}
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          Vendeur: {client.vendeurNom}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {filteredClients.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">Aucun client trouvé</h3>
                  <p className="text-muted-foreground">
                    {searchTerm ? "Essayez avec d'autres termes de recherche" : "Les clients inscrits apparaîtront ici"}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientsList;