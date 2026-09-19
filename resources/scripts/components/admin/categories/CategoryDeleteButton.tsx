import React, { useState } from 'react';
import { Actions, useStoreActions } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import tw from 'twin.macro';
import Button from '@/components/elements/Button';
import ConfirmationModal from '@/components/elements/ConfirmationModal';
import deleteCategory from '@/api/admin/categories/deleteCategory';

interface Props {
    categoryId: number;
    onDeleted: () => void;
}

export default ({ categoryId, onDeleted }: Props) => {
    const [ visible, setVisible ] = useState(false);
    const [ loading, setLoading ] = useState(false);

    const { clearFlashes, clearAndAddHttpError } = useStoreActions((actions: Actions<ApplicationStore>) => actions.flashes);

    const onDelete = () => {
        setLoading(true);
        clearFlashes('category');

        deleteCategory(categoryId)
            .then(() => {
                setLoading(false);
                onDeleted();
            })
            .catch(error => {
                console.error(error);
                clearAndAddHttpError({ key: 'category', error });

                setLoading(false);
                setVisible(false);
            });
    };

    return (
        <>
            <ConfirmationModal
                visible={visible}
                title={'Supprimer cette catégorie ?'}
                buttonText={'Oui, supprimer'}
                onConfirmed={onDelete}
                showSpinnerOverlay={loading}
                onModalDismissed={() => setVisible(false)}
            >
                Es-tu sûr de vouloir supprimer cette catégorie ? Les jeux qui y sont rattachés ne seront pas supprimés,
                ils deviendront simplement sans catégorie.
            </ConfirmationModal>

            <Button type={'button'} size={'xsmall'} color={'red'} onClick={() => setVisible(true)}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" css={tw`h-5 w-5`}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
            </Button>
        </>
    );
};
