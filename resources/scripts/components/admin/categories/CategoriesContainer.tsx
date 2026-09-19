import React, { useContext, useEffect } from 'react';
import getCategories, { Context as CategoriesContext, Filters } from '@/api/admin/categories/getCategories';
import NewCategoryButton from '@/components/admin/categories/NewCategoryButton';
import FlashMessageRender from '@/components/FlashMessageRender';
import useFlash from '@/plugins/useFlash';
import { AdminContext } from '@/state/admin';
import { NavLink, useRouteMatch } from 'react-router-dom';
import tw from 'twin.macro';
import AdminContentBlock from '@/components/admin/AdminContentBlock';
import AdminCheckbox from '@/components/admin/AdminCheckbox';
import AdminTable, { TableBody, TableHead, TableHeader, TableRow, Pagination, Loading, NoItems, ContentWrapper, useTableHooks } from '@/components/admin/AdminTable';
import CopyOnClick from '@/components/elements/CopyOnClick';

const Badge = ({ active }: { active: boolean }) => (
    <span
        css={[
            tw`inline-block rounded-full px-2 py-px text-xs font-medium text-white`,
            active ? tw`bg-green-600` : tw`bg-neutral-600`,
        ]}
    >
        {active ? 'Actif' : 'Inactif'}
    </span>
);

const RowCheckbox = ({ id }: { id: number }) => {
    const isChecked = AdminContext.useStoreState(state => state.categories.selectedCategories.indexOf(id) >= 0);
    const appendSelectedCategory = AdminContext.useStoreActions(actions => actions.categories.appendSelectedCategory);
    const removeSelectedCategory = AdminContext.useStoreActions(actions => actions.categories.removeSelectedCategory);

    return (
        <AdminCheckbox
            name={id.toString()}
            checked={isChecked}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                if (e.currentTarget.checked) {
                    appendSelectedCategory(id);
                } else {
                    removeSelectedCategory(id);
                }
            }}
        />
    );
};

const CategoriesContainer = () => {
    const match = useRouteMatch();

    const { page, setPage, setFilters, sort, setSort, sortDirection } = useContext(CategoriesContext);
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const { data: categories, error, isValidating } = getCategories();

    useEffect(() => {
        if (!error) {
            clearFlashes('categories');
            return;
        }

        clearAndAddHttpError({ key: 'categories', error });
    }, [ error ]);

    const length = categories?.items?.length || 0;

    const setSelectedCategories = AdminContext.useStoreActions(actions => actions.categories.setSelectedCategories);
    const selectedCategoriesLength = AdminContext.useStoreState(state => state.categories.selectedCategories.length);

    const onSelectAllClick = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedCategories(e.currentTarget.checked ? (categories?.items?.map(category => category.id) || []) : []);
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
        setSelectedCategories([]);
    }, [ page ]);

    return (
        <AdminContentBlock title={'Categories'}>
            <div css={tw`w-full flex flex-row items-center mb-8`}>
                <div css={tw`flex flex-col flex-shrink`} style={{ minWidth: '0' }}>
                    <h2 css={tw`text-2xl text-neutral-50 font-header font-extrabold tracking-tight`}>Catégories</h2>
                    <p css={tw`text-base text-neutral-400 whitespace-nowrap overflow-ellipsis overflow-hidden`}>Les catégories utilisées pour regrouper les jeux sur la boutique.</p>
                </div>

                <div css={tw`flex ml-auto pl-4`}>
                    <NewCategoryButton/>
                </div>
            </div>

            <FlashMessageRender byKey={'categories'} css={tw`mb-4`}/>

            <AdminTable>
                <ContentWrapper
                    checked={selectedCategoriesLength === (length === 0 ? -1 : length)}
                    onSelectAllClick={onSelectAllClick}
                    onSearch={onSearch}
                >
                    <Pagination data={categories} onPageSelect={setPage}>
                        <div css={tw`overflow-x-auto`}>
                            <table css={tw`w-full table-auto`}>
                                <TableHead>
                                    <TableHeader name={'ID'} direction={sort === 'id' ? (sortDirection ? 1 : 2) : null} onClick={() => setSort('id')}/>
                                    <TableHeader name={'Nom'} direction={sort === 'name' ? (sortDirection ? 1 : 2) : null} onClick={() => setSort('name')}/>
                                    <TableHeader name={'Description'}/>
                                    <TableHeader name={'Statut'}/>
                                </TableHead>

                                <TableBody>
                                    { categories !== undefined && !error && !isValidating && length > 0 &&
                                        categories.items.map(category => (
                                            <TableRow key={category.id}>
                                                <td css={tw`pl-6`}>
                                                    <RowCheckbox id={category.id}/>
                                                </td>

                                                <td css={tw`px-6 text-sm text-neutral-200 text-left whitespace-nowrap`}>
                                                    <CopyOnClick text={category.id.toString()}>
                                                        <code css={tw`font-mono bg-neutral-900 rounded py-1 px-2`}>{category.id}</code>
                                                    </CopyOnClick>
                                                </td>

                                                <td css={tw`px-6 text-sm text-neutral-200 text-left whitespace-nowrap`}>
                                                    <NavLink to={`${match.url}/${category.id}`} css={tw`text-primary-400 hover:text-primary-300`}>
                                                        {category.name}
                                                    </NavLink>
                                                </td>

                                                <td css={tw`px-6 text-sm text-neutral-200 text-left whitespace-nowrap`}>{category.description}</td>

                                                <td css={tw`px-6 text-sm text-left whitespace-nowrap`}>
                                                    <Badge active={category.isActive}/>
                                                </td>
                                            </TableRow>
                                        ))
                                    }
                                </TableBody>
                            </table>

                            { categories === undefined || (error && isValidating) ?
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
        <CategoriesContext.Provider value={hooks}>
            <CategoriesContainer/>
        </CategoriesContext.Provider>
    );
};
