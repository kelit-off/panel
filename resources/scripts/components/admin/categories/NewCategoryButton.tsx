import React, { useState } from 'react';
import createCategory from '@/api/admin/categories/createCategory';
import getCategories from '@/api/admin/categories/getCategories';
import Button from '@/components/elements/Button';
import Field from '@/components/elements/Field';
import Modal from '@/components/elements/Modal';
import FlashMessageRender from '@/components/FlashMessageRender';
import useFlash from '@/plugins/useFlash';
import { Form, Formik, FormikHelpers } from 'formik';
import { object, string } from 'yup';
import tw from 'twin.macro';

interface Values {
    name: string;
    description: string;
}

const schema = object().shape({
    name: string()
        .required('Un nom de catégorie est requis.')
        .max(191, 'Le nom ne doit pas dépasser 191 caractères.'),
    description: string(),
});

export default () => {
    const [ visible, setVisible ] = useState(false);
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const { mutate } = getCategories();

    const submit = ({ name, description }: Values, { setSubmitting }: FormikHelpers<Values>) => {
        clearFlashes('category:create');

        createCategory(name, description)
            .then(async (category) => {
                await mutate(data => ({ ...data!, items: data!.items.concat(category) }), false);
                setVisible(false);
            })
            .catch(error => {
                clearAndAddHttpError({ key: 'category:create', error });
                setSubmitting(false);
            });
    };

    return (
        <>
            <Formik
                onSubmit={submit}
                initialValues={{ name: '', description: '' }}
                validationSchema={schema}
            >
                {
                    ({ isSubmitting, resetForm }) => (
                        <Modal
                            visible={visible}
                            dismissable={!isSubmitting}
                            showSpinnerOverlay={isSubmitting}
                            onDismissed={() => {
                                resetForm();
                                setVisible(false);
                            }}
                        >
                            <FlashMessageRender byKey={'category:create'} css={tw`mb-6`}/>

                            <h2 css={tw`mb-6 text-2xl text-neutral-100`}>Nouvelle catégorie</h2>

                            <Form css={tw`m-0`}>
                                <Field
                                    type={'text'}
                                    id={'name'}
                                    name={'name'}
                                    label={'Nom'}
                                    description={'Un nom court pour identifier cette catégorie.'}
                                    autoFocus
                                />

                                <div css={tw`mt-6`}>
                                    <Field
                                        type={'text'}
                                        id={'description'}
                                        name={'description'}
                                        label={'Description'}
                                        description={'Une description pour cette catégorie.'}
                                    />
                                </div>

                                <div css={tw`flex flex-wrap justify-end mt-6`}>
                                    <Button
                                        type={'button'}
                                        isSecondary
                                        css={tw`w-full sm:w-auto sm:mr-2`}
                                        onClick={() => setVisible(false)}
                                    >
                                        Annuler
                                    </Button>
                                    <Button css={tw`w-full mt-4 sm:w-auto sm:mt-0`} type={'submit'}>
                                        Créer la catégorie
                                    </Button>
                                </div>
                            </Form>
                        </Modal>
                    )
                }
            </Formik>

            <Button type={'button'} size={'large'} css={tw`h-10 px-4 py-0 whitespace-nowrap`} onClick={() => setVisible(true)}>
                Nouvelle catégorie
            </Button>
        </>
    );
};
