import { useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

export default function PageNotFound() {
    const location = useLocation();
    const pageName = location.pathname.substring(1);

    const { data: authData, isFetched } = useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            try {
                const user = await base44.auth.me();
                return { user, isAuthenticated: true };
            } catch (error) {
                return { user: null, isAuthenticated: false };
            }
        }
    });
    
    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background font-inter">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="space-y-2">
                    <h1 className="text-8xl font-syne font-extrabold text-muted-foreground/20">404</h1>
                    <div className="h-px w-16 bg-border mx-auto"></div>
                </div>
                <div className="space-y-3">
                    <h2 className="text-2xl font-syne font-bold text-foreground">Page introuvable</h2>
                    <p className="text-muted-foreground text-sm">
                        La page <span className="font-mono text-primary">"{pageName}"</span> n'existe pas.
                    </p>
                </div>
                {isFetched && authData?.isAuthenticated && authData?.user?.role === 'admin' && (
                    <div className="p-4 bg-card rounded-xl border border-border text-left">
                        <p className="text-xs font-mono text-muted-foreground">Admin: cette page n'a pas encore été créée.</p>
                    </div>
                )}
                <button 
                    onClick={() => window.location.href = '/'} 
                    className="inline-flex items-center px-5 py-2.5 font-syne font-bold text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                    Retour à l'accueil
                </button>
            </div>
        </div>
    )
}