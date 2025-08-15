import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Shield, Link, MapPin } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary-light/5 to-accent-light/10">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 animate-fade-in">
              LocaMali
            </h1>
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto animate-slide-up">
              Plateforme moderne pour gérer vos vendeurs et leurs inscriptions clients avec liens uniques et géolocalisation
            </p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Interface Client */}
          <Card className="shadow-strong hover:shadow-primary/20 transition-all duration-300 hover:scale-105 animate-fade-in">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-primary">
                <Link className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl">Interface Client</CardTitle>
              <CardDescription>
                Liens uniques pour inscription rapide
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">✓ Formulaire d'inscription simple</p>
                <p className="text-sm text-muted-foreground">✓ Géolocalisation automatique</p>
                <p className="text-sm text-muted-foreground">✓ Intégration WhatsApp</p>
                <p className="text-sm text-muted-foreground">✓ Vérification de statut vendeur</p>
              </div>
              <Button 
                onClick={() => navigate("/l/demo-vendeur")}
                className="w-full bg-gradient-primary hover:bg-gradient-accent text-white transition-all duration-300"
              >
                <MapPin className="w-4 h-4 mr-2" />
                Voir démo client
              </Button>
            </CardContent>
          </Card>

          {/* Interface Admin */}
          <Card className="shadow-strong hover:shadow-primary/20 transition-all duration-300 hover:scale-105 animate-fade-in">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gradient-accent rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-primary">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl">Interface Admin</CardTitle>
              <CardDescription>
                Gestion complète des vendeurs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">✓ Dashboard de gestion</p>
                <p className="text-sm text-muted-foreground">✓ Activation/désactivation vendeurs</p>
                <p className="text-sm text-muted-foreground">✓ Suivi des inscriptions</p>
                <p className="text-sm text-muted-foreground">✓ Statistiques détaillées</p>
              </div>
              <Button 
                onClick={() => navigate("/admin/login")}
                className="w-full bg-gradient-accent hover:bg-gradient-primary text-white transition-all duration-300"
              >
                <Shield className="w-4 h-4 mr-2" />
                Accès admin
              </Button>
            </CardContent>
          </Card>

          {/* Base de données */}
          <Card className="shadow-strong hover:shadow-primary/20 transition-all duration-300 hover:scale-105 animate-fade-in lg:col-span-1 md:col-span-2">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gradient-hero rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-primary">
                <Users className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl">Backend Complet</CardTitle>
              <CardDescription>
                Prêt pour Supabase
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">✓ Tables Vendeurs, Clients, Paiements</p>
                <p className="text-sm text-muted-foreground">✓ Authentification sécurisée</p>
                <p className="text-sm text-muted-foreground">✓ API REST automatique</p>
                <p className="text-sm text-muted-foreground">✓ Relations et contraintes</p>
              </div>
              <div className="text-center text-sm text-muted-foreground">
                Connectez Supabase pour activer toutes les fonctionnalités
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
