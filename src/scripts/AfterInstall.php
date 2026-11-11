<?php

use Espo\Core\Container;
use Espo\Core\InjectableFactory;
use Espo\Core\Utils\Config;
use Espo\Core\Utils\Config\ConfigWriter;
use Espo\ORM\Entity;
use Espo\ORM\EntityManager;

/**
 * Keeps everyone's look when upgrading from an older Lucid.
 *
 * Up to 0.20, Lucid Classic was a theme of its own; the record layout is now a choice of the
 * Appearance menu (Split or Classic) with a default set by the administrator. Whoever used Lucid
 * Classic moves to Lucid with the Classic layout:
 * - the system theme, whose layout becomes the default layout of everyone;
 * - the users who chose Lucid Classic in their preferences;
 * - when the system theme was Lucid Classic, the users who chose Lucid (Split) keep Split;
 * - the portals, whose users keep the Classic layout.
 *
 * In 0.21, the Monochrome and Brut styles were a preference (`lucidStyle`) with a default set by
 * the administrator (`lucidStyle` setting); they are now the Lucid Monochrome and Lucid Brut
 * themes. The default style becomes the system theme (and the portals' theme) when that theme was
 * Lucid, and each user's own style becomes their theme. Users who had chosen the Lucid theme
 * without a style of their own saw the default style: they get its theme.
 *
 * Running it again changes nothing: it only touches what still refers to the old names, and never
 * replaces a layout already chosen.
 */
class AfterInstall
{
    private const OLD_CLASSIC_THEME = 'LucidClassic';
    private const THEME = 'Lucid';
    private const LAYOUT = 'lucidLayout';
    private const STYLE = 'lucidStyle';

    /** Themes of the former styles. */
    private const STYLE_THEMES = [
        'lucid' => 'Lucid',
        'monochrome' => 'LucidMonochrome',
        'brut' => 'LucidBrut',
    ];

    private EntityManager $entityManager;

    public function run(Container $container): void
    {
        $this->entityManager = $container->getByClass(EntityManager::class);

        $config = $container->getByClass(Config::class);
        $configWriter = $container->getByClass(InjectableFactory::class)->create(ConfigWriter::class);

        $systemTheme = $config->get('theme');
        $wasSystemClassic = $systemTheme === self::OLD_CLASSIC_THEME;

        if ($wasSystemClassic) {
            $systemTheme = self::THEME;

            if (!$config->get(self::LAYOUT)) {
                $configWriter->set(self::LAYOUT, 'classic');
            }
        }

        // The administrator's default style of 0.21, as a theme
        $defaultTheme = self::STYLE_THEMES[$config->get(self::STYLE)] ?? self::THEME;
        $wasSystemLucid = $systemTheme === self::THEME;

        if ($wasSystemLucid) {
            $systemTheme = $defaultTheme;
        }

        if ($systemTheme !== $config->get('theme')) {
            $configWriter->set('theme', $systemTheme);
        }

        if ($config->has(self::STYLE)) {
            $configWriter->remove(self::STYLE);
        }

        $configWriter->save();

        $styles = $this->getUserStyles();

        $users = $this->entityManager
            ->getRDBRepository('User')
            ->select(['id'])
            ->find();

        foreach ($users as $user) {
            $preferences = $this->entityManager->getEntityById('Preferences', $user->getId());

            if (!$preferences) {
                continue;
            }

            $theme = $preferences->get('theme');
            $style = $styles[$user->getId()] ?? null;

            if ($theme === self::OLD_CLASSIC_THEME) {
                $theme = self::THEME;
                $this->setLayout($preferences, 'classic');
            } else if ($wasSystemClassic && $theme === self::THEME) {
                $this->setLayout($preferences, 'split');
            }

            if ($theme === self::THEME) {
                // Their own style, else the default style they saw
                $theme = self::STYLE_THEMES[$style] ?? $defaultTheme;
            } else if (!$theme && $wasSystemLucid && isset(self::STYLE_THEMES[$style])) {
                // Following the system theme with a style of their own
                $theme = self::STYLE_THEMES[$style] === $systemTheme ? $theme : self::STYLE_THEMES[$style];
            }

            if ($theme !== $preferences->get('theme')) {
                $preferences->set('theme', $theme);
            }

            // Saving also drops the former style from the stored preferences: it is migrated once.
            if (
                $style !== null ||
                $preferences->isAttributeChanged('theme') ||
                $preferences->isAttributeChanged(self::LAYOUT)
            ) {
                $this->entityManager->saveEntity($preferences);
            }
        }

        $portals = $this->entityManager
            ->getRDBRepository('Portal')
            ->where(['theme' => [self::OLD_CLASSIC_THEME, self::THEME]])
            ->find();

        foreach ($portals as $portal) {
            $wasClassic = $portal->get('theme') === self::OLD_CLASSIC_THEME;

            if ($portal->get('theme') !== $defaultTheme) {
                $portal->set('theme', $defaultTheme);
                $this->entityManager->saveEntity($portal);
            }

            if (!$wasClassic) {
                continue;
            }

            $portalUsers = $this->entityManager
                ->getRDBRepository('Portal')
                ->getRelation($portal, 'users')
                ->select(['id'])
                ->find();

            foreach ($portalUsers as $user) {
                $preferences = $this->entityManager->getEntityById('Preferences', $user->getId());

                if ($preferences) {
                    $this->setLayout($preferences, 'classic');

                    if ($preferences->isAttributeChanged(self::LAYOUT)) {
                        $this->entityManager->saveEntity($preferences);
                    }
                }
            }
        }
    }

    /**
     * Sets the layout, unless the user already chose one.
     */
    private function setLayout(Entity $preferences, string $layout): void
    {
        if (!$preferences->get(self::LAYOUT)) {
            $preferences->set(self::LAYOUT, $layout);
        }
    }

    /**
     * The style each user chose in 0.21. The preference no longer exists, so it is read from the
     * stored preferences directly.
     *
     * @return array<string, string>
     */
    private function getUserStyles(): array
    {
        $query = $this->entityManager
            ->getQueryBuilder()
            ->select()
            ->from('Preferences')
            ->select(['id', 'data'])
            ->build();

        $sth = $this->entityManager->getQueryExecutor()->execute($query);

        $styles = [];

        while ($row = $sth->fetch()) {
            $data = json_decode($row['data'] ?? '', true);

            if (is_array($data) && is_string($data[self::STYLE] ?? null) && $data[self::STYLE] !== '') {
                $styles[$row['id']] = $data[self::STYLE];
            }
        }

        return $styles;
    }
}
