import React, { useEffect, useState } from 'react';
import tw from 'twin.macro';
import { Link } from 'react-router-dom';
import { useStoreState } from 'easy-peasy';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
    faChevronRight,
    faCopy,
    faDatabase,
    faExternalLinkAlt,
    faFolderOpen,
    faGlobe,
    faHistory,
    faPlus,
} from '@fortawesome/free-solid-svg-icons';
import isEqual from 'react-fast-compare';
import { ServerContext } from '@/state/server';
import { getServerDomains, ServerDomain } from '@/api/server/domains';
import { usePermissions } from '@/plugins/usePermissions';
import { formatIp } from '@/helpers';
import Can from '@/components/elements/Can';
import CopyOnClick from '@/components/elements/CopyOnClick';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import ServerOverview, { card } from '@/components/server/ServerOverview';

const pill = tw`mt-3 inline-flex max-w-full items-center gap-2.5 rounded-lg bg-white bg-opacity-5 px-3 py-2 text-sm text-neutral-200 transition-colors duration-150 hover:bg-opacity-10`;

// The address line under the site name: its main domain, or a prompt to add one.
const SiteAddress = ({ domains, serverId }: { domains: ServerDomain[] | null; serverId: string }) => {
    if (domains === null) return null;

    const main = domains.find(domain => domain.isVerified) || domains[0];
    const others = domains.length - 1;

    if (!main) {
        return (
            <Can action={'domain.create'}>
                <Link to={`/server/${serverId}/domains`} css={pill}>
                    <FontAwesomeIcon icon={faPlus} fixedWidth css={tw`text-neutral-500`}/>
                    Relier un nom de domaine
                </Link>
            </Can>
        );
    }

    return (
        <div css={tw`flex flex-wrap items-center gap-x-3`}>
            {main.isVerified ?
                <a href={`https://${main.domain}`} target={'_blank'} rel={'noreferrer'} css={pill}>
                    <FontAwesomeIcon icon={faGlobe} fixedWidth css={tw`flex-shrink-0 text-green-400`}/>
                    <span css={tw`truncate`}>{main.domain}</span>
                    <FontAwesomeIcon icon={faExternalLinkAlt} css={tw`flex-shrink-0 text-xs text-neutral-500`}/>
                </a>
                :
                <Link to={`/server/${serverId}/domains`} css={pill}>
                    <FontAwesomeIcon icon={faGlobe} fixedWidth css={tw`flex-shrink-0 text-yellow-400`}/>
                    <span css={tw`truncate`}>{main.domain}</span>
                    <span css={tw`flex-shrink-0 text-xs text-yellow-300`}>DNS en attente</span>
                </Link>
            }
            {others > 0 &&
            <Link to={`/server/${serverId}/domains`} css={tw`mt-3 text-sm text-neutral-400 hover:text-neutral-200`}>
                + {others} autre{others > 1 ? 's' : ''}
            </Link>
            }
        </div>
    );
};

const Shortcut = ({ to, icon, title, description }: { to: string; icon: IconDefinition; title: string; description: string }) => (
    <Link
        to={to}
        css={tw`flex items-center gap-4 rounded-lg px-3 py-3 transition-colors duration-150 hover:bg-white hover:bg-opacity-5`}
    >
        <span css={tw`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white bg-opacity-5 text-neutral-300`}>
            <FontAwesomeIcon icon={icon} fixedWidth/>
        </span>
        <span css={tw`min-w-0 flex-1`}>
            <span css={tw`block text-sm font-semibold text-neutral-100`}>{title}</span>
            <span css={tw`block text-xs text-neutral-400`}>{description}</span>
        </span>
        <FontAwesomeIcon icon={faChevronRight} css={tw`text-xs text-neutral-500`}/>
    </Link>
);

const Field = ({ label, value }: { label: string; value: string }) => (
    <div css={tw`mt-3 first:mt-0`}>
        <p css={tw`text-xs font-semibold text-neutral-400`}>{label}</p>
        <CopyOnClick text={value}>
            <span css={tw`mt-1 flex cursor-pointer items-center justify-between gap-3 rounded-lg bg-white bg-opacity-5 px-3 py-2 text-sm text-neutral-100 transition-colors duration-150 hover:bg-opacity-10`}>
                <code css={tw`truncate`}>{value}</code>
                <FontAwesomeIcon icon={faCopy} css={tw`flex-shrink-0 text-xs text-neutral-500`}/>
            </span>
        </CopyOnClick>
    </div>
);

export default () => {
    const username = useStoreState(state => state.user.data!.username);
    const id = ServerContext.useStoreState(state => state.server.data!.id);
    const uuid = ServerContext.useStoreState(state => state.server.data!.uuid);
    const sftp = ServerContext.useStoreState(state => state.server.data!.sftpDetails, isEqual);
    const [ canReadDomains ] = usePermissions([ 'domain.read' ]);

    const [ domains, setDomains ] = useState<ServerDomain[] | null>(null);

    useEffect(() => {
        if (!canReadDomains) return;

        getServerDomains(uuid)
            .then(result => setDomains(result.domains))
            .catch(error => {
                console.error(error);
                setDomains([]);
            });
    }, [ uuid, canReadDomains ]);

    const host = formatIp(sftp.ip);
    const sftpUser = `${username}.${id}`;

    return (
        <ServerContentBlock title={'Tableau de bord'}>
            <ServerOverview address={canReadDomains ? <SiteAddress domains={domains} serverId={id}/> : null}/>

            <div css={tw`mt-4 grid gap-4 md:grid-cols-2`}>
                <div css={[ card, tw`p-3 sm:p-4` ]}>
                    <h2 css={tw`px-3 pt-1 pb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400`}>Gérer mon site</h2>
                    <Can action={'file.*'}>
                        <Shortcut
                            to={`/server/${id}/files`}
                            icon={faFolderOpen}
                            title={'Fichiers'}
                            description={'Envoyez et modifiez les fichiers de votre site.'}
                        />
                    </Can>
                    <Can action={'domain.*'}>
                        <Shortcut
                            to={`/server/${id}/domains`}
                            icon={faGlobe}
                            title={'Domaines'}
                            description={'Reliez vos noms de domaine, le HTTPS est automatique.'}
                        />
                    </Can>
                    <Can action={'database.*'}>
                        <Shortcut
                            to={`/server/${id}/databases`}
                            icon={faDatabase}
                            title={'Bases de données'}
                            description={'Créez les bases MySQL de vos applications.'}
                        />
                    </Can>
                    <Can action={'backup.*'}>
                        <Shortcut
                            to={`/server/${id}/backups`}
                            icon={faHistory}
                            title={'Sauvegardes'}
                            description={'Sauvegardez et restaurez votre site.'}
                        />
                    </Can>
                </div>

                <Can action={'file.sftp'}>
                    <div css={[ card, tw`p-4 sm:p-5` ]}>
                        <h2 css={tw`mb-4 text-xs font-semibold uppercase tracking-wide text-neutral-400`}>Accès FTP (SFTP)</h2>
                        <Field label={'Hôte'} value={host}/>
                        <Field label={'Port'} value={sftp.port.toString()}/>
                        <Field label={'Utilisateur'} value={sftpUser}/>
                        <p css={tw`mt-4 text-xs leading-relaxed text-neutral-400`}>
                            Le mot de passe est celui de votre compte. Dans FileZilla, choisissez le protocole
                            <strong css={tw`text-neutral-300`}> SFTP</strong>.
                        </p>
                        <a
                            href={`sftp://${sftpUser}@${host}:${sftp.port}`}
                            css={tw`mt-4 inline-flex items-center gap-2 rounded-lg bg-white bg-opacity-10 px-4 py-2 text-sm font-semibold text-neutral-100 transition-colors duration-150 hover:bg-opacity-20`}
                        >
                            <FontAwesomeIcon icon={faExternalLinkAlt} css={tw`text-xs`}/>
                            Ouvrir dans mon client SFTP
                        </a>
                    </div>
                </Can>
            </div>
        </ServerContentBlock>
    );
};
