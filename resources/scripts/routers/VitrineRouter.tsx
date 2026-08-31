import React from 'react';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';
import TransitionRouter from '@/TransitionRouter';
import HeaderVitrine from '@/components/vitrine/components/HeaderVitrine';
import LandingContainer from '@/components/vitrine/landing/LandingContainer';
import NestProductsContainer from '@/components/vitrine/products/NestProductsContainer';
import OrderSuccessContainer from '@/components/vitrine/products/OrderSuccessContainer';
import { NotFound } from '@/components/elements/ScreenBlock';

export default ({ location }: RouteComponentProps) => (
    <>
        <HeaderVitrine/>
        <TransitionRouter>
            <Switch location={location}>
                <Route path={'/'} exact>
                    <LandingContainer/>
                </Route>
                <Route path={'/jeu/:nestId'} exact>
                    <NestProductsContainer/>
                </Route>
                <Route path={'/commande/succes'} exact>
                    <OrderSuccessContainer/>
                </Route>
                <Route path={'*'}>
                    <NotFound/>
                </Route>
            </Switch>
        </TransitionRouter>
    </>
);
