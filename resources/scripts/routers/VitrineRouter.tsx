import React, { useEffect } from 'react';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';
import trackVisit from '@/api/vitrine/trackVisit';
import TransitionRouter from '@/TransitionRouter';
import HeaderVitrine from '@/components/vitrine/components/HeaderVitrine';
import LandingContainer from '@/components/vitrine/landing/LandingContainer';
import NestProductsContainer from '@/components/vitrine/products/NestProductsContainer';
import RamCalculatorContainer from '@/components/vitrine/tools/RamCalculatorContainer';
import PaymentContainer from '@/components/vitrine/products/PaymentContainer';
import OrderSuccessContainer from '@/components/vitrine/products/OrderSuccessContainer';
import { NotFound } from '@/components/elements/ScreenBlock';

export default ({ location }: RouteComponentProps) => {
    useEffect(() => {
        trackVisit(location.pathname);
    }, [ location.pathname ]);

    return (
        <>
            <HeaderVitrine/>
            <TransitionRouter>
                <Switch location={location}>
                    <Route path={'/'} exact>
                        <LandingContainer/>
                    </Route>
                    <Route path={'/jeu/:nestSlug'} exact>
                        <NestProductsContainer/>
                    </Route>
                    <Route path={'/outils/calculateur-ram-minecraft'} exact>
                        <RamCalculatorContainer/>
                    </Route>

                    {/* Must come before /commande/:productId — otherwise "succes" would match as a product id. */}
                    <Route path={'/commande/succes'} exact>
                        <OrderSuccessContainer/>
                    </Route>
                    <Route path={'/commande/:productId'} exact>
                        <PaymentContainer/>
                    </Route>
                    <Route path={'*'}>
                        <NotFound/>
                    </Route>
                </Switch>
            </TransitionRouter>
        </>
    );
};
