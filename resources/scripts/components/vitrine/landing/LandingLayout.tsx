import React from 'react';
import { Link } from 'react-router-dom';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import tw from 'twin.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faShieldAlt } from '@fortawesome/free-solid-svg-icons';

interface Props {
    children: React.ReactNode;
}

export default ({ children }: Props) => {
    const name = useStoreState((state: ApplicationStore) => state.settings.data!.name);
    const accountLink = useStoreState((state: ApplicationStore) => (state.user.data ? '/account' : '/auth/login'));

    return (
        <div css={tw`flex min-h-screen flex-col bg-[#f6f8fb] font-vitrine text-neutral-900`}>
            <div css={tw`flex-1`}>
                {children}
            </div>

            <footer css={tw`grid grid-cols-1 gap-10 border-t border-neutral-200 bg-white px-6 py-12 sm:grid-cols-2 lg:grid-cols-5 lg:px-8`}>
                <div css={tw`lg:col-span-1`}>
                    <Link to={'/'} css={tw`flex items-center gap-2.5`}>
                        <img src={'/favicons/favicon.svg'} alt={''} css={tw`h-8 w-8 flex-shrink-0`}/>
                        <span css={tw`font-vitrine-display text-lg font-bold tracking-tight text-neutral-900`}>{name}</span>
                    </Link>
                    <p css={tw`mt-3 max-w-xs text-sm leading-relaxed text-neutral-500`}>
                        Hébergement de serveurs de jeux et d&apos;applications, avec une présentation
                        claire des ressources, des tarifs et des informations importantes.
                    </p>
                    <div css={tw`mt-4 flex flex-wrap gap-2`}>
                        <span css={tw`inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs font-semibold text-neutral-500`}>
                            <FontAwesomeIcon icon={faLock} css={tw`text-primary-600`}/>
                            Paiement sécurisé
                        </span>
                        <span css={tw`inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs font-semibold text-neutral-500`}>
                            <FontAwesomeIcon icon={faShieldAlt} css={tw`text-primary-600`}/>
                            Anti-DDoS inclus
                        </span>
                    </div>
                </div>

                <div>
                    <h4 css={tw`mb-3.5 text-xs font-bold uppercase tracking-wider text-neutral-400`}>Services</h4>
                    <ul css={tw`space-y-2.5`}>
                        <li><Link to={'/'} css={tw`text-sm text-neutral-500 hover:text-neutral-900`}>Serveurs de jeux</Link></li>
                        <li><Link to={'/'} css={tw`text-sm text-neutral-500 hover:text-neutral-900`}>VPS NVMe</Link></li>
                        <li><Link to={'/'} css={tw`text-sm text-neutral-500 hover:text-neutral-900`}>Bot Discord</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 css={tw`mb-3.5 text-xs font-bold uppercase tracking-wider text-neutral-400`}>Ressources</h4>
                    <ul css={tw`space-y-2.5`}>
                        <li><a href={'#faq'} css={tw`text-sm text-neutral-500 hover:text-neutral-900`}>Questions fréquentes</a></li>
                        <li><Link to={'/outils/calculateur-ram-minecraft'} css={tw`text-sm text-neutral-500 hover:text-neutral-900`}>Calculateur de RAM Minecraft</Link></li>
                        <li><Link to={accountLink} css={tw`text-sm text-neutral-500 hover:text-neutral-900`}>Espace client</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 css={tw`mb-3.5 text-xs font-bold uppercase tracking-wider text-neutral-400`}>Contact</h4>
                    <ul css={tw`space-y-2.5`}>
                        <li><a href={'/account/tickets'} css={tw`text-sm text-neutral-500 hover:text-neutral-900`}>Ouvrir un ticket</a></li>
                        <li><a href={'/signalement'} css={tw`text-sm text-neutral-500 hover:text-neutral-900`}>Signaler un contenu</a></li>
                    </ul>
                </div>

                <div>
                    <h4 css={tw`mb-3.5 text-xs font-bold uppercase tracking-wider text-neutral-400`}>Légal</h4>
                    <ul css={tw`space-y-2.5`}>
                        <li><a href={'/mentions-legales'} css={tw`text-sm text-neutral-500 hover:text-neutral-900`}>Mentions légales</a></li>
                        <li><a href={'/cgv'} css={tw`text-sm text-neutral-500 hover:text-neutral-900`}>CGV</a></li>
                        <li><a href={'/cgu'} css={tw`text-sm text-neutral-500 hover:text-neutral-900`}>CGU</a></li>
                        <li><a href={'/confidentialite'} css={tw`text-sm text-neutral-500 hover:text-neutral-900`}>Confidentialité</a></li>
                    </ul>
                </div>
            </footer>

            <div css={tw`flex flex-col items-center gap-1 bg-[#0b0f14] px-6 py-5 text-center text-xs text-[#8b98ad]`}>
                <span css={tw`font-mono`}>Géré par une petite équipe, pas par un centre d&apos;appels.</span>
                <span>&copy; {(new Date()).getFullYear()} {name}. Tous droits réservés.</span>
            </div>
        </div>
    );
};
