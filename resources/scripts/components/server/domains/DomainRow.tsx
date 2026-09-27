import React, { useState } from 'react';
import tw from 'twin.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlobe, faSyncAlt, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { ServerContext } from '@/state/server';
import { deleteServerDomain, ServerDomain, verifyServerDomain } from '@/api/server/domains';
import useFlash from '@/plugins/useFlash';
import Can from '@/components/elements/Can';
import Button from '@/components/elements/Button';
import GreyRowBox from '@/components/elements/GreyRowBox';
import ConfirmationModal from '@/components/elements/ConfirmationModal';

interface Props {
    domain: ServerDomain;
    onUpdated: (domain: ServerDomain) => void;
    onDeleted: (id: number) => void;
}

export default ({ domain, onUpdated, onDeleted }: Props) => {
    const uuid = ServerContext.useStoreState(state => state.server.data!.uuid);
    const { clearFlashes, clearAndAddHttpError, addFlash } = useFlash();
    const [ checking, setChecking ] = useState(false);
    const [ deleting, setDeleting ] = useState(false);
    const [ confirmVisible, setConfirmVisible ] = useState(false);

    const verify = () => {
        clearFlashes('server:domains');
        setChecking(true);
        verifyServerDomain(uuid, domain.id)
            .then(updated => {
                onUpdated(updated);
                if (!updated.isVerified) {
                    addFlash({
                        key: 'server:domains',
                        type: 'warning',
                        message: `Le DNS de ${updated.domain} ne pointe pas encore vers ce serveur. La propagation peut prendre jusqu'à quelques heures.`,
                    });
                }
            })
            .catch(error => clearAndAddHttpError({ key: 'server:domains', error }))
            .then(() => setChecking(false));
    };

    const remove = () => {
        clearFlashes('server:domains');
        setDeleting(true);
        deleteServerDomain(uuid, domain.id)
            .then(() => onDeleted(domain.id))
            .catch(error => {
                clearAndAddHttpError({ key: 'server:domains', error });
                setDeleting(false);
                setConfirmVisible(false);
            });
    };

    return (
        <GreyRowBox $hoverable={false} css={tw`mb-2 flex-wrap md:flex-nowrap`}>
            <ConfirmationModal
                title={'Retirer ce domaine ?'}
                buttonText={'Oui, retirer'}
                onConfirmed={remove}
                showSpinnerOverlay={deleting}
                visible={confirmVisible}
                onModalDismissed={() => setConfirmVisible(false)}
            >
                <strong>{domain.domain}</strong> ne servira plus ce site d&apos;ici une minute environ.
                Les fichiers du site ne sont pas touchés.
            </ConfirmationModal>
            <div css={tw`hidden md:block`}>
                <FontAwesomeIcon icon={faGlobe} fixedWidth/>
            </div>
            <div css={tw`flex-1 md:ml-4 min-w-0`}>
                {domain.isVerified ?
                    <a href={`https://${domain.domain}`} target={'_blank'} rel={'noreferrer'} css={tw`text-lg break-all hover:underline`}>
                        {domain.domain}
                    </a>
                    :
                    <p css={tw`text-lg break-all`}>{domain.domain}</p>
                }
                <p css={tw`mt-1 text-xs text-neutral-400`}>
                    {domain.isVerified ?
                        'Actif · certificat HTTPS automatique'
                        :
                        'En attente : le DNS ne pointe pas encore vers ce serveur'
                    }
                </p>
            </div>
            <div css={tw`w-full md:w-auto mt-4 md:mt-0 md:ml-8 flex items-center justify-end`}>
                <span
                    css={[
                        tw`mr-4 px-2 py-1 rounded text-xs uppercase select-none`,
                        domain.isVerified ? tw`bg-green-600 text-green-50` : tw`bg-yellow-600 text-yellow-50`,
                    ]}
                >
                    {domain.isVerified ? 'Actif' : 'En attente'}
                </span>
                <Can action={'domain.create'}>
                    {!domain.isVerified &&
                    <Button isSecondary css={tw`mr-2`} onClick={verify} isLoading={checking} title={'Vérifier le DNS'}>
                        <FontAwesomeIcon icon={faSyncAlt} fixedWidth/>
                    </Button>
                    }
                </Can>
                <Can action={'domain.delete'}>
                    <Button color={'red'} isSecondary onClick={() => setConfirmVisible(true)} title={'Retirer'}>
                        <FontAwesomeIcon icon={faTrashAlt} fixedWidth/>
                    </Button>
                </Can>
            </div>
        </GreyRowBox>
    );
};
