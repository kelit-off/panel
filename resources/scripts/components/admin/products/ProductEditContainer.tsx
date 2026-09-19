import React, { useEffect, useState } from 'react';
import tw from 'twin.macro';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { action, Action, Actions, createContextStore, useStoreActions } from 'easy-peasy';
import { Product } from '@/api/admin/products/getProducts';
import getProduct from '@/api/admin/products/getProduct';
import getAllNests from '@/api/admin/nests/getAllNests';
import { Nest } from '@/api/admin/nests/getNests';
import { ProductFormData } from '@/api/admin/products/ProductFormData';
import AdminContentBlock from '@/components/admin/AdminContentBlock';
import Spinner from '@/components/elements/Spinner';
import FlashMessageRender from '@/components/FlashMessageRender';
import { ApplicationStore } from '@/state';
import { boolean, number, object, string } from 'yup';
import AdminBox from '@/components/admin/AdminBox';
import Button from '@/components/elements/Button';
import Field, { TextareaField } from '@/components/elements/Field';
import Label from '@/components/elements/Label';
import Select from '@/components/elements/Select';
import Input from '@/components/elements/Input';
import { cpuToCores } from '@/helpers';
import FormikSwitch from '@/components/elements/FormikSwitch';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import { Form, Formik, FormikHelpers } from 'formik';
import updateProduct from '@/api/admin/products/updateProduct';
import ProductDeleteButton from '@/components/admin/products/ProductDeleteButton';

interface ctx {
    product: Product | undefined;
    setProduct: Action<ctx, Product | undefined>;
}

export const Context = createContextStore<ctx>({
    product: undefined,

    setProduct: action((state, payload) => {
        state.product = payload;
    }),
});

export type Values = ProductFormData;

export interface Params {
    title: string;
    initialValues?: Values;
    children?: React.ReactNode;

    onSubmit: (values: Values, helpers: FormikHelpers<Values>) => void;
}

const defaultValues: Values = {
    nestId: 0,
    name: '',
    description: '',
    price: '0.00',
    stripePriceId: '',
    memory: 1024,
    swap: 0,
    disk: 1024,
    io: 500,
    cpu: 100,
    databases: 0,
    backups: 0,
    allocations: 1,
    isActive: true,
};

export const InformationContainer = ({ title, initialValues, children, onSubmit }: Params) => {
    const [ nests, setNests ] = useState<Nest[]>([]);

    useEffect(() => {
        getAllNests().then(setNests).catch(console.error);
    }, []);

    return (
        <Formik
            onSubmit={onSubmit}
            initialValues={initialValues || defaultValues}
            validationSchema={object().shape({
                nestId: number().required('Un jeu doit être sélectionné.').positive('Un jeu doit être sélectionné.'),
                name: string().required('Un nom est requis.').max(191),
                description: string(),
                price: number().min(0).required('Un prix est requis.'),
                stripePriceId: string(),
                memory: number().min(0).required(),
                swap: number().min(0),
                disk: number().min(0).required(),
                io: number().min(0),
                cpu: number().min(0),
                databases: number().min(0),
                backups: number().min(0),
                allocations: number().min(0),
                isActive: boolean(),
            })}
        >
            {({ isSubmitting, isValid, values, setFieldValue }) => (
                <AdminBox title={title} css={tw`relative`}>
                    <SpinnerOverlay visible={isSubmitting}/>

                    <Form css={tw`mb-0`}>
                        <div>
                            <Label htmlFor={'nestId'}>Jeu</Label>
                            <Select
                                id={'nestId'}
                                name={'nestId'}
                                value={values.nestId}
                                onChange={e => setFieldValue('nestId', Number(e.currentTarget.value))}
                            >
                                <option value={0}>Sélectionner un jeu...</option>
                                {nests.map(nest => <option key={nest.id} value={nest.id}>{nest.name}</option>)}
                            </Select>
                        </div>

                        <div css={tw`mt-6`}>
                            <Field id={'name'} name={'name'} label={'Nom'} type={'text'}/>
                        </div>

                        <div css={tw`mt-6`}>
                            <TextareaField id={'description'} name={'description'} label={'Description'} rows={3}/>
                        </div>

                        <div css={tw`md:w-full md:flex md:flex-row mt-6`}>
                            <div css={tw`md:w-full md:flex md:flex-col md:mr-4`}>
                                <Field id={'price'} name={'price'} label={'Prix (€ / mois)'} type={'text'}/>
                            </div>

                            <div css={tw`md:w-full md:flex md:flex-col md:ml-4 mt-6 md:mt-0`}>
                                <Field
                                    id={'stripePriceId'}
                                    name={'stripePriceId'}
                                    label={'ID de prix Stripe'}
                                    type={'text'}
                                    placeholder={'price_...'}
                                    description={'Requis pour que cette offre soit achetable. Créé dans le dashboard Stripe.'}
                                />
                            </div>
                        </div>

                        <p css={tw`mt-8 text-sm uppercase text-neutral-300`}>Ressources du serveur</p>
                        <div css={tw`grid grid-cols-2 md:grid-cols-4 gap-4 mt-4`}>
                            <Field id={'memory'} name={'memory'} label={'Mémoire (Mo)'} type={'text'}/>
                            <Field id={'swap'} name={'swap'} label={'Swap (Mo)'} type={'text'}/>
                            <Field id={'disk'} name={'disk'} label={'Disque (Mo)'} type={'text'}/>
                            <Field id={'io'} name={'io'} label={'I/O'} type={'text'}/>
                            <div>
                                <Label htmlFor={'vcores'}>vCores</Label>
                                <Input
                                    id={'vcores'}
                                    type={'number'}
                                    min={0}
                                    step={0.5}
                                    value={cpuToCores(Number(values.cpu) || 0)}
                                    onChange={e => setFieldValue('cpu', Math.round((Number(e.currentTarget.value) || 0) * 100))}
                                />
                            </div>
                            <Field id={'cpu'} name={'cpu'} label={'CPU (%)'} type={'text'} description={'100 % = 1 vCore. 0 = illimité.'}/>
                            <Field id={'databases'} name={'databases'} label={'Bases de données'} type={'text'}/>
                            <Field id={'backups'} name={'backups'} label={'Sauvegardes'} type={'text'}/>
                            <Field id={'allocations'} name={'allocations'} label={'Emplacements réseau'} type={'text'}/>
                        </div>

                        <div css={tw`mt-6 bg-neutral-800 border border-neutral-900 shadow-inner p-4 rounded`}>
                            <FormikSwitch
                                name={'isActive'}
                                label={'Actif'}
                                description={'Une offre inactive est masquée du site public et ne peut plus être commandée.'}
                            />
                        </div>

                        <div css={tw`w-full flex flex-row items-center mt-6`}>
                            {children}
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

const EditInformationContainer = () => {
    const history = useHistory();

    const { clearFlashes, clearAndAddHttpError } = useStoreActions((actions: Actions<ApplicationStore>) => actions.flashes);

    const product = Context.useStoreState(state => state.product);
    const setProduct = Context.useStoreActions(actions => actions.setProduct);

    if (product === undefined) {
        return (
            <></>
        );
    }

    const submit = (values: Values, { setSubmitting }: FormikHelpers<Values>) => {
        clearFlashes('product');

        updateProduct(product.id, values)
            .then(setProduct)
            .catch(error => {
                console.error(error);
                clearAndAddHttpError({ key: 'product', error });
            })
            .then(() => setSubmitting(false));
    };

    return (
        <InformationContainer
            title={'Modifier l\'offre'}
            initialValues={{
                nestId: product.nestId,
                name: product.name,
                description: product.description || '',
                price: product.price,
                stripePriceId: product.stripePriceId || '',
                memory: product.memory,
                swap: product.swap,
                disk: product.disk,
                io: product.io,
                cpu: product.cpu,
                databases: product.databases,
                backups: product.backups,
                allocations: product.allocations,
                isActive: product.isActive,
            }}
            onSubmit={submit}
        >
            <div css={tw`flex`}>
                <ProductDeleteButton
                    productId={product.id}
                    onDeleted={() => history.push('/admin/products')}
                />
            </div>
        </InformationContainer>
    );
};

const ProductEditContainer = () => {
    const match = useRouteMatch<{ id?: string }>();

    const { clearFlashes, clearAndAddHttpError } = useStoreActions((actions: Actions<ApplicationStore>) => actions.flashes);
    const [ loading, setLoading ] = useState(true);

    const product = Context.useStoreState(state => state.product);
    const setProduct = Context.useStoreActions(actions => actions.setProduct);

    useEffect(() => {
        clearFlashes('product');

        getProduct(Number(match.params?.id))
            .then(product => setProduct(product))
            .catch(error => {
                console.error(error);
                clearAndAddHttpError({ key: 'product', error });
            })
            .then(() => setLoading(false));
    }, []);

    if (loading || product === undefined) {
        return (
            <AdminContentBlock>
                <FlashMessageRender byKey={'product'} css={tw`mb-4`}/>

                <div css={tw`w-full flex flex-col items-center justify-center`} style={{ height: '24rem' }}>
                    <Spinner size={'base'}/>
                </div>
            </AdminContentBlock>
        );
    }

    return (
        <AdminContentBlock title={'Offre - ' + product.name}>
            <div css={tw`w-full flex flex-row items-center mb-8`}>
                <div css={tw`flex flex-col flex-shrink`} style={{ minWidth: '0' }}>
                    <h2 css={tw`text-2xl text-neutral-50 font-header font-extrabold tracking-tight`}>{product.name}</h2>
                    <p css={tw`text-base text-neutral-400 whitespace-nowrap overflow-ellipsis overflow-hidden`}>
                        {product.price} € / mois
                    </p>
                </div>
            </div>

            <FlashMessageRender byKey={'product'} css={tw`mb-4`}/>

            <EditInformationContainer/>
        </AdminContentBlock>
    );
};

export default () => {
    return (
        <Context.Provider>
            <ProductEditContainer/>
        </Context.Provider>
    );
};
