import tw, { css } from 'twin.macro';
import styled from 'styled-components/macro';
import { withSubComponents } from '@/components/helpers';

const Wrapper = styled.div`
  ${tw`w-full flex flex-col px-3 overflow-y-auto`};

  & > a {
    ${tw`h-10 w-full flex flex-row items-center text-neutral-400 cursor-pointer select-none px-3 rounded-lg transition-colors duration-150`};
    ${tw`hover:text-neutral-50`};

    &:hover {
      background: rgba(255, 255, 255, 0.05);
    }

    & > svg {
      ${tw`h-5 w-5 flex flex-shrink-0`};
    }

    & > span {
      ${tw`font-header font-semibold text-sm whitespace-nowrap leading-none ml-3`};
    }

    &:active, &.active {
      ${tw`text-neutral-50`};
      background: rgba(59, 130, 246, 0.16);

      & > svg {
        ${tw`text-blue-400`};
      }
    }
  }
`;

const Section = styled.div`
  ${tw`font-header font-bold text-neutral-500 whitespace-nowrap uppercase px-3 mb-1.5 select-none`};
  font-size: 11px;
  letter-spacing: 0.08em;

  &:not(:first-of-type) {
    ${tw`mt-6`};
  }
`;

const User = styled.div`
  ${tw`h-16 w-full flex items-center justify-start px-4 flex-shrink-0`};
  border-top: 1px solid rgba(255, 255, 255, 0.06);
`;

const Sidebar = styled.div<{ $collapsed?: boolean }>`
  ${tw`h-screen hidden md:flex flex-col items-center flex-shrink-0 overflow-x-hidden ease-linear`};
  ${tw`transition-[width] duration-150 ease-in`};
  ${tw`w-[16rem]`};
  background: #0d1424;
  border-right: 1px solid rgba(255, 255, 255, 0.06);

  & > a {
    ${tw`h-10 flex flex-row items-center text-neutral-400 cursor-pointer select-none px-3 rounded-lg transition-colors duration-150`};
    ${tw`hover:text-neutral-50`};
    width: calc(100% - 1.5rem);
    margin-bottom: 0.5rem;

    &:hover {
      background: rgba(255, 255, 255, 0.05);
    }

    & > svg {
      ${tw`transition-none h-5 w-5 flex flex-shrink-0`};
    }

    & > span {
      ${tw`font-header font-semibold text-sm whitespace-nowrap leading-none ml-3`};
    }
  }

  ${props => props.$collapsed && css`
    ${tw`w-20`};

    ${Section} {
      ${tw`invisible`};
    }

    ${Wrapper} {
      ${tw`px-3`};

      & > a {
        ${tw`justify-center px-0`};
      }
    }

    & > a {
      ${tw`justify-center px-0`};
    }

    ${User} {
      ${tw`justify-center px-0`};
    }

    & > a > span,
    ${User} > div,
    ${User} > a,
    ${Wrapper} > a > span {
      ${tw`hidden`};
    }
  `};
`;

export default withSubComponents(Sidebar, { Section, Wrapper, User });
