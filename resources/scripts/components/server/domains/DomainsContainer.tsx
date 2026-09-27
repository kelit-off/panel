import React, { useEffect, useState } from 'react';
import tw from 'twin.macro';
import { ServerContext } from '@/state/server';
import { createServerDomain, getServerDomains, ServerDomain } from '@/api/server/domains';
import useFlash from '@/plugins/useFlash';
import Can from '@/components/elements/Can';
import Fade from '@/components/elements/Fade';
import Input from '@/components/elements/Input';
import Button from '@/components/elements/Button';
import Spinner from '@/components/elements/Spinner';
import TitledGreyBox from '@/components/elements/TitledGreyBox';
import CopyOnClick from '@/components/elements/CopyOnClick';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import FlashMessageRender from '@/components/FlashMessageRender';
import DomainRow from '@/components/server/domains/DomainRow';

export default () => {
    const uuid = ServerContext.useStoreState(state => state.server.data!.uuid);
    const { clearFlashes, clearAndAddHttpError, addFlash } = useFlash();

    const [ loading, setLoading ] = useState(true);
    const [ submitting, setSubmitting ] = useState(false);
    const [ domains, setDomains ] = useState<ServerDomain[]>([]);
    const [ targetIps, setTargetIps ] = useState<string[]>([]);
    const [ domainLimit, setDomainLimit ] = useState(0);
    const [ input, setInput ] = useState('');

    useEffect(() => {
        clearFlashes('server:domains');
        getServerDomains(uuid)
            .then(result => {
                setDomains(result.domains);
                setTargetIps(result.targetIps);
                setDomainLimit(result.domainLimit);
            })
            .catch(error => clearAndAddHttpError({ key: 'server:domains', error }))
            .then(() => setLoading(false));
    }, []);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        clearFlashes('server:domains');
        setSubmitting(true);
        createServerDomain(uuid, input)
            .then(domain => {
                setDomains(current => [ ...current, domain ].sort((a, b) => a.domain.localeCompare(b.domain)));
                setInput('');
                addFlash({
                    key: 'server:domains',
                    type: domain.isVerified ? 'success' : 'warning',
                    message: domain.isVerified
                        ? `${domain.domain} est ajouté. Il sera en ligne en HTTPS d'ici une minute environ.`
                        : `${domain.domain} est ajouté mais son DNS ne pointe pas encore vers ce serveur. Configurez-le puis cliquez sur « Vérifier ».`,
                });
            })
            .catch(error => clearAndAddHttpError({ key: 'server:domains', error }))
            .then(() => setSubmitting(false));
    };

    const onUpdated = (domain: ServerDomain) => setDomains(current => current.map(d => d.id === domain.id ? domain : d));
    const onDeleted = (id: number) => setDomains(current => current.filter(d => d.id !== id));

    return (
        <ServerContentBlock title={'Domaines'}>
            <FlashMessageRender byKey={'server:domains'} css={tw`mb-4`}/>
            {loading ?
                <Spinner size={'large'} centered/>
                :
                <Fade timeout={150}>
                    <div>
                        {domains.length > 0 ?
                            domains.map(domain => (
                                <DomainRow key={domain.id} domain={domain} onUpdated={onUpdated} onDeleted={onDeleted}/>
                            ))
                            :
                            <p css={tw`text-center text-sm text-neutral-300`}>
                                Aucun domaine n&apos;est encore relié à ce site.
                            </p>
                        }
                        <Can action={'domain.create'}>
                            {domains.length < domainLimit ?
                                <form onSubmit={submit} css={tw`mt-6 flex flex-wrap sm:flex-nowrap items-center`}>
                                    <Input
                                        type={'text'}
                                        placeholder={'monsite.fr'}
                                        value={input}
                                        onChange={e => setInput(e.currentTarget.value)}
                                        disabled={submitting}
                                    />
                                    <Button type={'submit'} isLoading={submitting} css={tw`w-full mt-4 sm:w-auto sm:mt-0 sm:ml-4 whitespace-nowrap`}>
                                        Ajouter le domaine
                                    </Button>
                                </form>
                                :
                                <p css={tw`mt-6 text-right text-sm text-neutral-400`}>
                                    Limite de {domainLimit} domaines atteinte pour ce site.
                                </p>
                            }
                        </Can>
                        <TitledGreyBox title={'Configurer le DNS de votre domaine'} css={tw`mt-8`}>
                            <p css={tw`text-sm text-neutral-300`}>
                                Chez votre registrar (OVH, Gandi, Cloudflare…), créez pour chaque domaine un
                                enregistrement <strong>A</strong> vers :
                            </p>
                            <div css={tw`mt-3 flex flex-wrap`}>
                                {targetIps.map(ip => (
                                    <CopyOnClick key={ip} text={ip}>
                                        <code css={tw`mr-2 mb-2 px-2 py-1 rounded bg-neutral-900 text-sm font-mono`}>{ip}</code>
                                    </CopyOnClick>
                                ))}
                            </div>
                            <p css={tw`mt-3 text-sm text-neutral-400`}>
                                Pour <code css={tw`font-mono`}>www.monsite.fr</code>, ajoutez-le aussi comme domaine ici.
                                Sur Cloudflare, désactivez le proxy (nuage gris) le temps de la vérification.
                                Le certificat HTTPS est ensuite créé et renouvelé automatiquement.
                            </p>
                        </TitledGreyBox>
                    </div>
                </Fade>
            }
        </ServerContentBlock>
    );
};
