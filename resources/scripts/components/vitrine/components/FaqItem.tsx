import React, { useState } from 'react';
import tw from 'twin.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';

export default ({ question, answer }: { question: string; answer: string }) => {
    const [ open, setOpen ] = useState(false);

    return (
        <div css={tw`overflow-hidden rounded-2xl border border-neutral-200 bg-white`}>
            <button
                type={'button'}
                aria-expanded={open}
                onClick={() => setOpen(o => !o)}
                css={tw`flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-[15px] font-semibold text-neutral-900`}
            >
                {question}
                <FontAwesomeIcon
                    icon={faChevronDown}
                    css={[
                        tw`flex-shrink-0 text-sm text-primary-600 transition-transform duration-200`,
                        open && tw`rotate-180`,
                    ]}
                />
            </button>
            {open && (
                <p css={tw`px-6 pb-5 text-sm leading-relaxed text-neutral-500`}>{answer}</p>
            )}
        </div>
    );
};
