import { cache } from 'react';

import { GetLinksAndSectionsQuery } from '~/app/[locale]/(default)/page-data';
import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { readFragment } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { FooterSectionsFragment } from '~/components/footer/fragment';
import { HeaderLinksFragment } from '~/components/header/fragment';
import { Sitemap } from '@bigcommerce/catalyst-shared'; // The workspace package we set up

const getSitemapData = cache(async (customerAccessToken?: string) => {
  const { data: response } = await client.fetch({
    document: GetLinksAndSectionsQuery,
    customerAccessToken,
    validateCustomerAccessToken: false,
    fetchOptions: customerAccessToken ? { cache: 'no-store' } : { next: { revalidate } },
  });

  return {
    categories: readFragment(HeaderLinksFragment, response).site.categoryTree,
    sections: readFragment(FooterSectionsFragment, response).site,
  };
});

export default async function SitemapPage() {
  const customerAccessToken = await getSessionCustomerAccessToken();
  const data = await getSitemapData(customerAccessToken);

  // 1. Map Categories
  const categoryLinks = {
    label: 'Shop Categories',
    href: '/shop', 
    groups: data.categories.map(({ name, path, children }) => ({
      label: name,
      href: path,
      links: children.map((child) => ({
        label: child.name,
        href: child.path,
      })),
    })),
  };

  // 2. Map Web Pages
  const pageLinks = {
    label: 'Quick Links',
    href: '/',
    groups: [
      {
        label: 'Pages',
        links: data.sections.content.pages.edges.map(({ node }) => ({
          label: node.name,
          href:
            node.__typename === 'ExternalLinkPage'
              ? node.link
              : node.__typename === 'NormalPage' ||
                  node.__typename === 'ContactPage' ||
                  node.__typename === 'BlogIndexPage' ||
                  node.__typename === 'RawHtmlPage'
                ? node.path
                : '#',
        })),
      },
    ],
  };

  // 3. Map Brands
  const brandLinks = {
    label: 'Brands',
    href: '/brands',
    groups: [
      {
        label: 'Featured Brands',
        links: data.sections.brands.edges.map(({ node }) => ({
          label: node.name,
          href: node.path,
        })),
      },
    ],
  };

  // The new sitemap component expects a resolved array, not a stream
  const resolvedLinks = [categoryLinks, brandLinks, pageLinks];

  return (
    <div className="mx-auto w-full max-w-screen-2xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 font-serif text-4xl font-black text-black">
        Store Sitemap
      </h1>
      <Sitemap links={resolvedLinks} />
    </div>
  );
}
