import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import tw from 'twin.macro';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';

interface Props {
    icon?: IconProp;
    isLoading?: boolean;
    title: string | React.ReactNode;
    className?: string;
    noPadding?: boolean;
    children: React.ReactNode;
    button?: React.ReactNode;
}

const AdminBox = ({ icon, title, className, isLoading, children, button, noPadding }: Props) => (
    <div css={tw`relative rounded-xl border border-white border-opacity-5 bg-neutral-800`} className={className}>
        <SpinnerOverlay visible={isLoading || false}/>
        <div css={tw`flex flex-row items-center rounded-t-xl px-5 py-4 border-b border-white border-opacity-5`}>
            {typeof title === 'string' ?
                <p css={tw`font-header text-sm font-bold text-neutral-100`}>
                    {icon && <FontAwesomeIcon icon={icon} css={tw`mr-2 text-neutral-300`}/>}{title}
                </p>
                :
                title
            }
            {button}
        </div>
        <div css={[ !noPadding && tw`px-4 xl:px-5 py-5` ]}>
            {children}
        </div>
    </div>
);

export default AdminBox;
