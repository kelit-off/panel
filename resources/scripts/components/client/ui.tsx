import React from 'react';
import { Link } from 'react-router-dom';
import { useField } from 'formik';
import tw from 'twin.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

export const Card = ({ children, className, padded = true }: { children: React.ReactNode; className?: string; padded?: boolean }) => (
    <div css={[ tw`rounded-2xl border border-neutral-200 bg-white shadow-sm`, padded && tw`p-6` ]} className={className}>
        {children}
    </div>
);

export const CardTitle = ({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) => (
    <div css={tw`mb-4 flex items-center justify-between gap-4`}>
        <h2 css={tw`font-vitrine-display text-lg font-bold text-neutral-900`}>{children}</h2>
        {action}
    </div>
);

export const PageTitle = ({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) => (
    <div css={tw`mb-8 flex flex-wrap items-end justify-between gap-4`}>
        <div>
            <h1 css={tw`font-vitrine-display text-3xl font-bold tracking-tight text-neutral-900`}>{title}</h1>
            {subtitle && <p css={tw`mt-1 text-sm text-neutral-500`}>{subtitle}</p>}
        </div>
        {action}
    </div>
);

type Tone = 'green' | 'yellow' | 'red' | 'blue' | 'neutral';

export const Pill = ({ tone = 'neutral', children }: { tone?: Tone; children: React.ReactNode }) => (
    <span
        css={[
            tw`inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold`,
            tone === 'green' && tw`border-green-200 bg-green-50 text-green-700`,
            tone === 'yellow' && tw`border-yellow-200 bg-yellow-50 text-yellow-700`,
            tone === 'red' && tw`border-red-200 bg-red-50 text-red-700`,
            tone === 'blue' && tw`border-blue-200 bg-blue-50 text-blue-700`,
            tone === 'neutral' && tw`border-neutral-200 bg-neutral-100 text-neutral-600`,
        ]}
    >
        {children}
    </span>
);

export const EmptyState = ({ icon, title, text, action }: { icon: IconDefinition; title: string; text?: string; action?: React.ReactNode }) => (
    <div css={tw`flex flex-col items-center px-6 py-12 text-center`}>
        <div css={tw`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600`}>
            <FontAwesomeIcon icon={icon}/>
        </div>
        <p css={tw`font-vitrine-display text-base font-bold text-neutral-900`}>{title}</p>
        {text && <p css={tw`mt-1 max-w-sm text-sm text-neutral-500`}>{text}</p>}
        {action && <div css={tw`mt-5`}>{action}</div>}
    </div>
);

const buttonBase = tw`inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 text-sm font-bold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-60`;
const buttonPrimary = tw`bg-primary-600 text-white shadow-sm hover:bg-primary-700`;
const buttonSecondary = tw`border border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-50`;

interface ButtonProps {
    variant?: 'primary' | 'secondary';
    children: React.ReactNode;
}

export const LinkButton = ({ to, variant = 'primary', children }: ButtonProps & { to: string }) => (
    <Link to={to} css={[ buttonBase, variant === 'primary' ? buttonPrimary : buttonSecondary ]}>
        {children}
    </Link>
);

export const Btn = ({ variant = 'primary', children, ...props }: ButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props} css={[ buttonBase, variant === 'primary' ? buttonPrimary : buttonSecondary ]}>
        {children}
    </button>
);

const inputStyle = tw`w-full rounded-lg border border-neutral-200 bg-white px-3.5 text-sm text-neutral-900 outline-none transition-colors duration-150 placeholder:text-neutral-400 focus:border-primary-400`;

interface FieldProps {
    name: string;
    label: string;
    hint?: string;
}

const FieldWrapper = ({ label, name, hint, error, children }: FieldProps & { error?: string; children: React.ReactNode }) => (
    <div>
        <label htmlFor={name} css={tw`mb-1.5 block text-sm font-semibold text-neutral-700`}>{label}</label>
        {children}
        {error ? (
            <p css={tw`mt-1.5 text-xs text-red-600`}>{error}</p>
        ) : hint ? (
            <p css={tw`mt-1.5 text-xs text-neutral-400`}>{hint}</p>
        ) : null}
    </div>
);

export const TextField = ({ name, label, hint, type = 'text', ...rest }: FieldProps & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'name'>) => {
    const [ field, meta ] = useField(name);
    const error = meta.touched && meta.error ? meta.error : undefined;

    return (
        <FieldWrapper name={name} label={label} hint={hint} error={error}>
            <input id={name} type={type} {...field} {...rest} css={[ inputStyle, tw`h-11`, !!error && tw`border-red-400` ]}/>
        </FieldWrapper>
    );
};

export const TextAreaField = ({ name, label, hint, rows = 5, ...rest }: FieldProps & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'name'>) => {
    const [ field, meta ] = useField(name);
    const error = meta.touched && meta.error ? meta.error : undefined;

    return (
        <FieldWrapper name={name} label={label} hint={hint} error={error}>
            <textarea id={name} rows={rows} {...field} {...rest} css={[ inputStyle, tw`py-3 leading-relaxed`, !!error && tw`border-red-400` ]}/>
        </FieldWrapper>
    );
};

export const SelectField = ({ name, label, hint, children }: FieldProps & { children: React.ReactNode }) => {
    const [ field, meta ] = useField(name);
    const error = meta.touched && meta.error ? meta.error : undefined;

    return (
        <FieldWrapper name={name} label={label} hint={hint} error={error}>
            <select id={name} {...field} css={[ inputStyle, tw`h-11`, !!error && tw`border-red-400` ]}>
                {children}
            </select>
        </FieldWrapper>
    );
};

export const formatDate = (date: Date): string => date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });

export const formatDateTime = (date: Date): string => `${formatDate(date)} ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
