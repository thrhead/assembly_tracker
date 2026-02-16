import {createNavigation} from 'next-intl/navigation';
import {defineRouting} from 'next-intl/routing';
import {redirect as nextRedirect} from 'next/navigation';

export const routing = defineRouting({
  locales: ['en', 'tr'],
  defaultLocale: 'tr',
  localePrefix: 'as-needed'
});

const navigation = createNavigation(routing);

export const Link = navigation.Link;
export const usePathname = navigation.usePathname;
export const useRouter = navigation.useRouter;

export default Link; // Fix default export error

// Wrapper to mimic standard Next.js redirect but with locale support
export const redirect = (href: string) => {
  // Simple implementation: if not starting with locale, we might need to prefix
  // But for now, let's just use the navigation.redirect if it works or nextRedirect
  return navigation.redirect(href as any); 
};
