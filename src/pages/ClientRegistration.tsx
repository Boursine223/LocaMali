import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

const ClientRegistration = () => {
  const { lienUnique } = useParams();
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [checking, setChecking] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isServiceActive, setIsServiceActive] = useState<boolean>(true);
  const [inactiveReason, setInactiveReason] = useState<"inactive" | "expired" | "not_started" | undefined>(undefined);
  const [numeroWhatsApp, setNumeroWhatsApp] = useState<string>("");

  useEffect(() => {
    const checkLink = async () => {
      if (!lienUnique) return;
      try {
        const { data } = await api.get(`/public/localisation/${lienUnique}`);
        setIsServiceActive(Boolean(data?.vendeur?.actif));
        setNumeroWhatsApp(data?.numeroWhatsApp || "");
        // Aller directement à la localisation quand le lien est valide
        setIsSubmitted(true);
      } catch (e: any) {
        setIsServiceActive(false);
        const reason = e?.response?.data?.reason as any;
        if (reason === 'expired' || reason === 'inactive' || reason === 'not_started') {
          setInactiveReason(reason);
        }
      } finally {
        setChecking(false);
      }
    };
    checkLink();
  }, [lienUnique]);

  const handleLocationShare = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const googleMapsUrl = `https://maps.google.com/maps?q=${latitude},${longitude}`;
          const whatsappMessage = `Bonjour, voici ma localisation : ${googleMapsUrl}`;
          const phone = numeroWhatsApp?.replace(/\D/g, "");
          const whatsappUrl = phone
            ? `https://wa.me/${phone}?text=${encodeURIComponent(whatsappMessage)}`
            : `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;
          window.open(whatsappUrl, '_blank');
        },
        (error) => {
          toast({
            title: "Erreur de géolocalisation",
            description: "Impossible d'accéder à votre position.",
            variant: "destructive"
          });
        }
      );
    } else {
      toast({
        title: "Géolocalisation non supportée",
        description: "Votre navigateur ne supporte pas la géolocalisation.",
        variant: "destructive"
      });
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-strong">
          <CardContent className="p-8 text-center">
            <div className="animate-pulse text-muted-foreground">Chargement…</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isServiceActive) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-strong">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-warning mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Service indisponible</h1>
            {inactiveReason === 'expired' && (
              <p className="text-muted-foreground">
                L'abonnement associé à ce lien a expiré. Veuillez renouveler votre abonnement.
              </p>
            )}
            {inactiveReason === 'not_started' && (
              <p className="text-muted-foreground">
                Le service n'est pas encore actif. Merci de réessayer plus tard.
              </p>
            )}
            {inactiveReason === 'inactive' && (
              <p className="text-muted-foreground">
                Le service est actuellement désactivé. Veuillez contacter le support.
              </p>
            )}
            {!inactiveReason && (
              <p className="text-muted-foreground">
                Le service associé à ce lien n'est plus actif.
              </p>
            )}
            <div className="mt-4 text-sm text-muted-foreground">
              Pour toute aide, contactez-nous.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Afficher directement la page de localisation lorsque le service est actif
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-strong animate-fade-in">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl">
            <span className="inline-flex items-center justify-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              LocaMali
            </span>
          </CardTitle>
          <CardDescription>
            Partagez votre position pour que nous puissions vous localiser
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button 
            onClick={handleLocationShare}
            className="w-full bg-gradient-primary hover:bg-gradient-accent text-white font-semibold py-6 rounded-xl shadow-primary transition-all duration-300 hover:scale-105"
            size="lg"
          >
            <MapPin className="w-5 h-5 mr-2" />
            📍 Envoyer ma localisation
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            Cela ouvrira WhatsApp avec votre position automatiquement.
          </p>

          <div className="space-y-3 text-sm">
            <h3 className="font-semibold text-foreground text-center">Comment envoyer ma localisation ?</h3>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>Appuyez sur « Envoyer ma localisation ».</li>
              <li>Autorisez l'accès à la position si le téléphone le demande.</li>
              <li>WhatsApp s'ouvre: validez l'envoi du message.</li>
            </ol>

            <div className="flex items-start gap-2 rounded-md border p-3 bg-muted/40">
              <AlertCircle className="w-4 h-4 text-warning mt-0.5" />
              <div className="text-xs text-muted-foreground">
                Astuces:
                <ul className="list-disc list-inside space-y-1 mt-1">
                  <li>Activez la géolocalisation (GPS) du téléphone.</li>
                  <li>Si WhatsApp ne s'ouvre pas, vérifiez qu'il est installé et connecté.</li>
                  <li>En cas d'échec, réessayez depuis Chrome/Safari et autorisez la position.</li>
                </ul>
              </div>
            </div>

            <div className="text-center text-[11px] text-muted-foreground opacity-70">
              Assistance WhatsApp: <a href="https://wa.me/22384054004" target="_blank" rel="noreferrer" className="underline underline-offset-2">+223 84 05 40 04</a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientRegistration;