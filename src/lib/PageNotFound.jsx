import { useLocation, Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';


export default function PageNotFound({}) {
    const location = useLocation();
    const pageName = location.pathname.substring(1);
    const { user, isAuthenticated, authChecked } = useAuth();
    const authData = { user, isAuthenticated };
    const isFetched = authChecked;

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background">
            <div className="max-w-md w-full">
                <div className="text-center space-y-6">
                    {/* Errore 404*/}
                    <div className="space-y-2">
                        <h1 className="text-7xl font-light text-muted-foreground">404</h1>
                        <div className="h-0.5 w-16 bg-border mx-auto"></div>
                    </div>

                    {/* Messaggio Principale */}
                    <div className="space-y-3">
                        <h2 className="text-2xl font-medium text-foreground">
                            Pagina non trovata
                        </h2>
                        <p className="text-muted-foreground leading-relaxed">
                            La pagina <span className="font-medium text-foreground">"{pageName}"</span> non è stata trovata in questa applicazione.
                        </p>
                    </div>

                    {/* Note per l'admin */}
                    {isFetched && authData.isAuthenticated && authData.user?.role === 'admin' && (
                        <div className="mt-8 p-4 bg-muted rounded-lg border border-border">
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-warning-soft flex items-center justify-center mt-0.5">
                                    <div className="w-2 h-2 rounded-full bg-warning"></div>
                                </div>
                                <div className="text-left space-y-1">
                                    <p className="text-sm font-medium text-foreground">Note per l'admin</p>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        Questa pagina non esiste. Controlla che il percorso sia corretto o che la pagina sia stata rimossa.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Button */}
                    <div className="pt-6">
                        <Button variant="outline" asChild>
                            <Link to="/"><Home className="mr-2 h-4 w-4" />Torna alla home</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}