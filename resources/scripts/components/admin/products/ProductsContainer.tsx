import React, { useContext, useEffect } from 'react';
import { NavLink, useRouteMatch } from 'react-router-dom';
import tw from 'twin.macro';
import getProducts, { Context as ProductsContext, Filters } from '@/api/admin/products/getProducts';
import useFlash from '@/plugins/useFlash';
import { AdminContext } from '@/state/admin';
import FlashMessageRender from '@/components/FlashMessageRender';
import AdminCheckbox from '@/components/admin/AdminCheckbox';
import AdminContentBlock from '@/components/admin/AdminContentBlock';
import AdminTable, { TableBody, TableHead, TableHeader, TableRow, Pagination, Loading, NoItems, ContentWrapper, useTableHooks } from '@/components/admin/AdminTable';
import Button from '@/components/elements/Button';

const formatPrice = (price: string): string => Number(price).toFixed(2).replace('.', ',');

const Badge = ({ color, children }: { color: 'green' | 'yellow' | 'neutral'; children: React.ReactNode }) => (
    <span
        css={[
            tw`inline-block rounded-full px-2 py-px text-xs font-medium text-white`,
            color === 'green' && tw`bg-green-600`,
            color === 'yellow' && tw`bg-yellow-600`,
            color === 'neutral' && tw`bg-neutral-600`,
        ]}
    >
        {children}
    </span>
);

const RowCheckbox = ({ id }: { id: number }) => {
    const isChecked = AdminContext.useStoreState(state => state.products.selectedProducts.indexOf(id) >= 0);
    const appendSelectedProduct = AdminContext.useStoreActions(actions => actions.products.appendSelectedProduct);
    const removeSelectedProduct = AdminContext.useStoreActions(actions => actions.products.removeSelectedProduct);

    return (
        <AdminCheckbox
            name={id.toString()}
            checked={isChecked}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                if (e.currentTarget.checked) {
                    appendSelectedProduct(id);
                } else {
                    removeSelectedProduct(id);
                }
            }}
        />
    );
};

const ProductsContainer = () => {
    const match = useRouteMatch();

    const { page, setPage, setFilters, sort, setSort, sortDirection } = useContext(ProductsContext);
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const { data: products, error, isValidating } = getProducts();

    useEffect(() => {
        if (!error) {
            clearFlashes('products');
            return;
        }

        clearAndAddHttpError({ key: 'products', error });
    }, [ error ]);

    const length = products?.items?.length || 0;

    const setSelectedProducts = AdminContext.useStoreActions(actions => actions.products.setSelectedProducts);
    const selectedProductsLength = AdminContext.useStoreState(state => state.products.selectedProducts.length);

    const onSelectAllClick = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedProducts(e.currentTarget.checked ? (products?.items?.map(product => product.id) || []) : []);
    };

    const onSearch = (query: string): Promise<void> => {
        return new Promise((resolve) => {
            if (query.length < 2) {
                setFilters(null);
            } else {
                setFilters({ name: query });
            }
            return resolve();
        });
    };

    useEffect(() => {
        setSelectedProducts([]);
    }, [ page ]);

    return (
        <AdminContentBlock title={'Offres'}>
            <div css={tw`w-full flex flex-row items-center mb-8`}>
                <div css={tw`flex flex-col flex-shrink`} style={{ minWidth: '0' }}>
                    <h2 css={tw`text-2xl text-neutral-50 font-header font-extrabold tracking-tight`}>Offres</h2>
                    <p css={tw`text-base text-neutral-400 whitespace-nowrap overflow-ellipsis overflow-hidden`}>Les offres proposées à la vente sur la boutique.</p>
                </div>

                <div css={tw`flex ml-auto pl-4`}>
                    <NavLink to={`${match.url}/new`}>
                        <Button type={'button'} size={'large'} css={tw`h-10 px-4 py-0 whitespace-nowrap`}>
                            Nouvelle offre
                        </Button>
                    </NavLink>
                </div>
            </div>

            <FlashMessageRender byKey={'products'} css={tw`mb-4`}/>

            <AdminTable>
                <ContentWrapper
                    checked={selectedProductsLength === (length === 0 ? -1 : length)}
                    onSelectAllClick={onSelectAllClick}
                    onSearch={onSearch}
                >
                    <Pagination data={products} onPageSelect={setPage}>
                        <div css={tw`overflow-x-auto`}>
                            <table css={tw`w-full table-auto`}>
                                <TableHead>
                                    <TableHeader name={'ID'} direction={sort === 'id' ? (sortDirection ? 1 : 2) : null} onClick={() => setSort('id')}/>
                                    <TableHeader name={'Nom'} direction={sort === 'name' ? (sortDirection ? 1 : 2) : null} onClick={() => setSort('name')}/>
                                    <TableHeader name={'Prix'} direction={sort === 'price' ? (sortDirection ? 1 : 2) : null} onClick={() => setSort('price')}/>
                                    <TableHeader name={'Stripe'}/>
                                    <TableHeader name={'Statut'}/>
                                </TableHead>

                                <TableBody>
                                    { products !== undefined && !error && !isValidating && length > 0 &&
                                        products.items.map(product => (
                                            <TableRow key={product.id}>
                                                <td css={tw`pl-6`}>
                                                    <RowCheckbox id={product.id}/>
                                                </td>

                                                <td css={tw`px-6 text-sm text-neutral-200 text-left whitespace-nowrap`}>{product.id}</td>

                                                <td css={tw`px-6 text-sm text-neutral-200 text-left whitespace-nowrap`}>
                                                    <NavLink to={`${match.url}/${product.id}`} css={tw`text-primary-400 hover:text-primary-300`}>
                                                        {product.name}
                                                    </NavLink>
                                                </td>

                                                <td css={tw`px-6 text-sm text-neutral-200 text-left whitespace-nowrap`}>{formatPrice(product.price)} €</td>

                                                <td css={tw`px-6 text-sm text-left whitespace-nowrap`}>
                                                    {product.stripePriceId ? (
                                                        <Badge color={'green'}>Configuré</Badge>
                                                    ) : (
                                                        <Badge color={'yellow'}>Non configuré</Badge>
                                                    )}
                                                </td>

                                                <td css={tw`px-6 text-sm text-left whitespace-nowrap`}>
                                                    {product.isActive ? (
                                                        <Badge color={'green'}>Actif</Badge>
                                                    ) : (
                                                        <Badge color={'neutral'}>Inactif</Badge>
                                                    )}
                                                </td>
                                            </TableRow>
                                        ))
                                    }
                                </TableBody>
                            </table>

                            { products === undefined || (error && isValidating) ?
                                <Loading/>
                                :
                                length < 1 ?
                                    <NoItems/>
                                    :
                                    null
                            }
                        </div>
                    </Pagination>
                </ContentWrapper>
            </AdminTable>
        </AdminContentBlock>
    );
};

export default () => {
    const hooks = useTableHooks<Filters>();

    return (
        <ProductsContext.Provider value={hooks}>
            <ProductsContainer/>
        </ProductsContext.Provider>
    );
};
