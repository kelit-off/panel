import React from 'react';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';
import ClientShell from '@/components/client/ClientShell';
import ClientDashboard from '@/components/client/ClientDashboard';
import ServicesPage from '@/components/client/ServicesPage';
import InvoicesPage from '@/components/client/InvoicesPage';
import TicketsPage from '@/components/client/TicketsPage';
import NewTicketPage from '@/components/client/NewTicketPage';
import TicketPage from '@/components/client/TicketPage';
import SettingsPage from '@/components/client/SettingsPage';
import LegacyPage from '@/components/client/LegacyPage';
import AccountApiContainer from '@/components/dashboard/AccountApiContainer';
import SecurityKeyContainer from '@/components/dashboard/security/SecurityKeyContainer';
import SSHKeyContainer from '@/components/dashboard/SSHKeyContainer';
import { NotFound } from '@/components/elements/ScreenBlock';

export default ({ location }: RouteComponentProps) => (
    <ClientShell>
        <Switch location={location}>
            <Route path={'/account'} exact><ClientDashboard/></Route>
            <Route path={'/account/services'} exact><ServicesPage/></Route>
            <Route path={'/account/billing'} exact><InvoicesPage/></Route>
            <Route path={'/account/tickets'} exact><TicketsPage/></Route>
            <Route path={'/account/tickets/new'} exact><NewTicketPage/></Route>
            <Route path={'/account/tickets/:id'} exact><TicketPage/></Route>
            <Route path={'/account/settings'} exact><SettingsPage/></Route>
            <Route path={'/account/api'} exact>
                <LegacyPage title={'Clés API'} subtitle={'Accès programmatique à votre compte.'}><AccountApiContainer/></LegacyPage>
            </Route>
            <Route path={'/account/keys/security'} exact>
                <LegacyPage title={'Clés de sécurité'} subtitle={'Authentification matérielle (WebAuthn).'}><SecurityKeyContainer/></LegacyPage>
            </Route>
            <Route path={'/account/keys/ssh'} exact>
                <LegacyPage title={'Clés SSH'} subtitle={'Connexion SFTP sans mot de passe.'}><SSHKeyContainer/></LegacyPage>
            </Route>
            <Route path={'*'}><NotFound/></Route>
        </Switch>
    </ClientShell>
);
