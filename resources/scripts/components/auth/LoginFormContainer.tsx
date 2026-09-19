import React, { forwardRef } from 'react';
import { Form } from 'formik';
import FlashMessageRender from '@/components/FlashMessageRender';
import tw from 'twin.macro';
import { Link } from 'react-router-dom';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faServer } from '@fortawesome/free-solid-svg-icons';

interface ContainerProps {
    title?: string;
    subtitle?: string;
    sidebar?: React.ReactNode;
    children: React.ReactNode;
}

const Container = ({ title, subtitle, sidebar, children }: ContainerProps) => {
    const name = useStoreState((state: ApplicationStore) => state.settings.data!.name);

    return (
        <div css={tw`flex min-h-screen flex-col items-center justify-center bg-[#f6f8fb] px-4 py-10 font-vitrine text-neutral-900`}>
            <Link to={'/'} css={tw`mb-8 flex items-center gap-2.5`}>
                <div css={tw`flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 shadow-lg`}>
                    <FontAwesomeIcon icon={faServer} css={tw`text-sm text-white`}/>
                </div>
                <span css={tw`font-vitrine-display text-xl font-bold tracking-tight`}>{name}</span>
            </Link>

            <div css={tw`w-full max-w-md`}>
                {sidebar && <div css={tw`mb-5 text-primary-600`}>{sidebar}</div>}
                {title && <h1 css={tw`text-center font-vitrine-display text-2xl font-bold tracking-tight text-neutral-900`}>{title}</h1>}
                {subtitle && <p css={tw`mt-1.5 text-center text-sm text-neutral-500`}>{subtitle}</p>}
                <FlashMessageRender css={tw`mt-5`}/>
                <div css={tw`mt-6 rounded-2xl border border-neutral-200 bg-white p-7 shadow-sm`}>
                    {children}
                </div>
            </div>

            <Link to={'/'} css={tw`mt-8 inline-flex items-center gap-2 text-sm font-semibold text-neutral-500 hover:text-neutral-900`}>
                <FontAwesomeIcon icon={faArrowLeft} css={tw`text-xs`}/> Retour au site
            </Link>
        </div>
    );
};

type FormContainerProps = React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement> & {
    title?: string;
    subtitle?: string;
    sidebar?: React.ReactNode;
}

const FormContainer = forwardRef<HTMLFormElement, FormContainerProps>(({ title, subtitle, sidebar, className: _className, ...props }, ref) => (
    <Container title={title} subtitle={subtitle} sidebar={sidebar}>
        <Form {...props} ref={ref} css={tw`m-0`}>
            {props.children}
        </Form>
    </Container>
));
FormContainer.displayName = 'FormContainer';

type DivContainerProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
    title?: string;
    subtitle?: string;
    sidebar?: React.ReactNode;
}

export const DivContainer = ({ title, subtitle, sidebar, className: _className, ...props }: DivContainerProps) => (
    <Container title={title} subtitle={subtitle} sidebar={sidebar}>
        <div {...props}>
            {props.children}
        </div>
    </Container>
);

export default FormContainer;
