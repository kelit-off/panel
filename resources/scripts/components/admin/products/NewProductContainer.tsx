import React from 'react';
import { useHistory } from 'react-router-dom';
import tw from 'twin.macro';
import AdminContentBlock from '@/components/admin/AdminContentBlock';
import createProduct from '@/api/admin/products/createProduct';
import { ApplicationStore } from '@/state';
import { Actions, useStoreActions } from 'easy-peasy';
import { FormikHelpers } from 'formik';
import FlashMessageRender from '@/components/FlashMessageRender';
import { InformationContainer, Values } from '@/components/admin/products/ProductEditContainer';

export default () => {
    const history = useHistory();

    const { clearFlashes, clearAndAddHttpError } = useStoreActions((actions: Actions<ApplicationStore>) => actions.flashes);

    const submit = (values: Values, { setSubmitting }: FormikHelpers<Values>) => {
        clearFlashes('product:create');

        createProduct(values)
            .then(product => history.push(`/admin/products/${product.id}`))
            .catch(error => {
                console.error(error);
                clearAndAddHttpError({ key: 'product:create', error });
            })
            .then(() => setSubmitting(false));
    };

    return (
        <AdminContentBlock title={'Nouvelle offre'}>
            <div css={tw`w-full flex flex-row items-center mb-8`}>
                <div css={tw`flex flex-col flex-shrink`} style={{ minWidth: '0' }}>
                    <h2 css={tw`text-2xl text-neutral-50 font-header font-extrabold tracking-tight`}>Nouvelle offre</h2>
                    <p css={tw`text-base text-neutral-400 whitespace-nowrap overflow-ellipsis overflow-hidden`}>Ajouter une nouvelle offre à la boutique.</p>
                </div>
            </div>

            <FlashMessageRender byKey={'product:create'} css={tw`mb-4`}/>

            <InformationContainer title={'Créer une offre'} onSubmit={submit}/>
        </AdminContentBlock>
    );
};
