'use client';

import { clsx } from 'clsx';
import React, { ElementType, forwardRef, Ref } from 'react';

// Using native SCSS import for this environment so we don't crash on getSiteStyles
import styles from './index.gems.module.scss';

export interface SitemapLink {
  label: string;
  href: string;
  groups?: Array<{
    label?: string;
    href?: string;
    links: Array<{
      label: string;
      href: string;
    }>;
  }>;
}

export interface SitemapProps {
  className?: string;
  links: SitemapLink[];
  linkAs?: ElementType;
}

export const Sitemap = forwardRef(function Sitemap(
  { className, links, linkAs: LinkComponent = 'a' }: SitemapProps,
  ref: Ref<HTMLDivElement>,
) {
  return (
    <div className={clsx(styles.wrapper, className)} ref={ref}>
      <div className={styles.grid}>
        {links.map((item, i) => (
          <div className={styles.column} key={i}>
            <LinkComponent className={styles.mainLink} href={item.href}>
              {item.label}
            </LinkComponent>

            {item.groups != null && item.groups.length > 0 && (
              <div className={styles.groupsContainer}>
                {item.groups.map((group, groupIdx) => (
                  <div className={styles.group} key={groupIdx}>
                    {group.label != null && group.label !== '' && (
                      <div className={styles.groupHeader}>
                        {group.href != null && group.href !== '' ? (
                          <LinkComponent className={styles.groupLink} href={group.href}>
                            {group.label}
                          </LinkComponent>
                        ) : (
                          <span className={styles.groupLabel}>
                            {group.label}
                          </span>
                        )}
                      </div>
                    )}

                    {group.links != null && group.links.length > 0 && (
                      <ul className={styles.subLinksList}>
                        {group.links.map((link, linkIdx) => (
                          <li key={linkIdx}>
                            <LinkComponent className={styles.subLink} href={link.href}>
                              {link.label}
                            </LinkComponent>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
});

Sitemap.displayName = 'Sitemap';
