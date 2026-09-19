import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { useRouteMatch } from 'react-router-dom';
import tw from 'twin.macro';
import AdminContentBlock from '@/components/admin/AdminContentBlock';
import Spinner from '@/components/elements/Spinner';
import FlashMessageRender from '@/components/FlashMessageRender';
import { Category } from '@/api/admin/categories/getCategories';
import getCategory from '@/api/admin/categories/getCategory';
import updateCategory from '@/api/admin/categories/updateCategory';
import { object, string } from 'yup';
import Button from '@/components/elements/Button';
import Field from '@/components/elements/Field';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import { ApplicationStore } from '@/state';
import { action, Action, Actions, createContextStore, useStoreActions } from 'easy-peasy';
import { Form, Formik, FormikHelpers } from 'formik';
import AdminBox from '@/components/admin/AdminBox';
import FormikSwitch from '@/components/elements/FormikSwitch';
import CategoryDeleteButton from '@/components/admin/categories/CategoryDeleteButton';

interface ctx {
    category: Category | undefined;
    setCategory: Action<ctx, Category | undefined>;
}

export const Context = createContextStore<ctx>({
    category: undefined,

    setCategory: action((state, payload) => {
        state.category = payload;
    }),
});

interface Values {
    name: string;
    description: string;
    isActive: boolean;
}

const EditInformationContainer = () => {
    const history = useHistory();

    const { clearFlashes, clearAndAddHttpError } = useStoreActions((actions: Actions<ApplicationStore>) => actions.flashes);

    const category = Context.useStoreState(state => state.category);
    const setCategory = Context.useStoreActions(actions => actions.setCategory);

    if (category === undefined) {
        return (
            <></>
        );
    }

    const submit = ({ name, description, isActive }: Values, { setSubmitting }: FormikHelpers<Values>) => {
        clearFlashes('category');

        updateCategory(category.id, name, description, isActive)
            .then(() => setCategory({ ...category, name, description, isActive }))
            .catch(error => {
                console.error(error);
                clearAndAddHttpError({ key: 'category', error });
            })
            .then(() => setSubmitting(false));
    };

    return (
        <Formik
            onSubmit={submit}
            initialValues={{
                name: category.name,
                description: category.description || '',
                isActive: category.isActive,
            }}
            validationSchema={object().shape({
                name: string().required().min(1),
                description: string(),
            })}
        >
            {({ isSubmitting, isValid }) => (
                <AdminBox title={'Modifier la catégorie'} css={tw`relative`}>
                    <SpinnerOverlay visible={isSubmitting}/>

                    <Form>
                        <Field
                            id={'name'}
                            name={'name'}
                            label={'Nom'}
                            type={'text'}
                            css={tw`mb-6`}
                        />

                        <Field
                            id={'description'}
                            name={'description'}
                            label={'Description'}
                            type={'text'}
                        />

                        <FormikSwitch
                            name={'isActive'}
                            label={'Actif'}
                            description={'Une catégorie inactive est masquée du site public.'}
                            css={tw`mt-6`}
                        />

                        <div css={tw`w-full flex flex-row items-center mt-6`}>
                            <div css={tw`flex`}>
                                <CategoryDeleteButton
                                    categoryId={category.id}
                                    onDeleted={() => history.push('/admin/categories')}
                                />
                            </div>

                            <div css={tw`flex ml-auto`}>
                                <Button type={'submit'} disabled={isSubmitting || !isValid}>
                                    Enregistrer
                                </Button>
                            </div>
                        </div>
                    </Form>
                </AdminBox>
            )}
        </Formik>
    );
};

const CategoryEditContainer = () => {
    const match = useRouteMatch<{ id?: string }>();

    const { clearFlashes, clearAndAddHttpError } = useStoreActions((actions: Actions<ApplicationStore>) => actions.flashes);
    const [ loading, setLoading ] = useState(true);

    const category = Context.useStoreState(state => state.category);
    const setCategory = Context.useStoreActions(actions => actions.setCategory);

    useEffect(() => {
        clearFlashes('category');

        getCategory(Number(match.params?.id))
            .then(category => setCategory(category))
            .catch(error => {
                console.error(error);
                clearAndAddHttpError({ key: 'category', error });
            })
            .then(() => setLoading(false));
    }, []);

    if (loading || category === undefined) {
        return (
            <AdminContentBlock>
                <FlashMessageRender byKey={'category'} css={tw`mb-4`}/>

                <div css={tw`w-full flex flex-col items-center justify-center`} style={{ height: '24rem' }}>
                    <Spinner size={'base'}/>
                </div>
            </AdminContentBlock>
        );
    }

    return (
        <AdminContentBlock title={'Catégorie - ' + category.name}>
            <div css={tw`w-full flex flex-row items-center mb-8`}>
                <div css={tw`flex flex-col flex-shrink`} style={{ minWidth: '0' }}>
                    <h2 css={tw`text-2xl text-neutral-50 font-header font-extrabold tracking-tight`}>{category.name}</h2>
                    {
                        (category.description || '').length < 1 ?
                            <p css={tw`text-base text-neutral-400`}>
                                <span css={tw`italic`}>Aucune description</span>
                            </p>
                            :
                            <p css={tw`text-base text-neutral-400 whitespace-nowrap overflow-ellipsis overflow-hidden`}>{category.description}</p>
                    }
                </div>
            </div>

            <FlashMessageRender byKey={'category'} css={tw`mb-4`}/>

            <EditInformationContainer/>
        </AdminContentBlock>
    );
};

export default () => {
    return (
        <Context.Provider>
            <CategoryEditContainer/>
        </Context.Provider>
    );
};
