import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, MapPin } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/40">
      {/* Hero minimal SaaS */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
          <MapPin className="w-3.5 h-3.5" /> LocaMali
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">Solution simple pour localiser vos clients</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg md:text-xl">
          Liens uniques, géolocalisation automatique et gestion des inscriptions.
        </p>
        <div className="flex items-center justify-center gap-3 mt-10">
          <Button onClick={() => navigate('/admin/login')} className="bg-gradient-accent text-white px-6">
            <Shield className="w-4 h-4 mr-2" /> Accès admin
          </Button>
          <Button variant="outline" onClick={() => navigate('/l/demo-vendeur')} className="px-6">
            <MapPin className="w-4 h-4 mr-2" /> Voir la démo
          </Button>
        </div>
      </section>

      {/* Contact / Footer minimal */}
      <footer className="border-t bg-background/60 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center space-y-2">
          <p className="text-sm text-muted-foreground">Contact</p>
          <div className="text-sm">
            <a href="https://wa.me/223840504004" target="_blank" rel="noreferrer" className="underline underline-offset-4">+223 84 05 04 04</a>
            <span className="mx-2">·</span>
            <a href="mailto:sinebour63@gmail.com" className="underline underline-offset-4">sinebour63@gmail.com</a>
          </div>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} LocaMali</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
