<?php

use Espo\Core\Container;
use Espo\Core\InjectableFactory;
use Espo\Core\Utils\Config;
use Espo\Core\Utils\Config\ConfigWriter;
use Espo\ORM\EntityManager;

/**
 * Lucid Classic is no longer a theme of its own: the record layout is now a choice of the
 * Appearance menu (Split or Classic), with a default set by the administrator.
 *
 * Whoever used Lucid Classic moves to Lucid with the Classic layout, so nobody falls back to
 * EspoCRM's theme or sees a layout change on upgrade:
 * - the system theme, whose layout becomes the default layout of everyone;
 * - the users who chose Lucid Classic in their preferences;
 * - when the system theme was Lucid Classic, the users who chose Lucid (Split) keep Split;
 * - the portals, whose users keep the Classic layout.
 *
 * Running it again changes nothing: it only touches what still refers to Lucid Classic, and never
 * replaces a layout already chosen.
 */
class AfterInstall
{
    private const OLD_THEME = 'LucidClassic';
    private const THEME = 'Lucid';
    private const LAYOUT = 'lucidLayout';

    private EntityManager $entityManager;

    public function run(Container $container): void
    {
        $this->entityManager = $container->getByClass(EntityManager::class);

        $config = $container->getByClass(Config::class);
        $wasSystemClassic = $config->get('theme') === self::OLD_THEME;

        if ($wasSystemClassic) {
            $configWriter = $container->getByClass(InjectableFactory::class)->create(ConfigWriter::class);
            $configWriter->set('theme', self::THEME);

            if (!$config->get(self::LAYOUT)) {
                $configWriter->set(self::LAYOUT, 'classic');
            }

            $configWriter->save();
        }

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

            if ($theme === self::OLD_THEME) {
                $preferences->set('theme', self::THEME);
                $this->setLayout($preferences, 'classic');

                continue;
            }

            if ($wasSystemClassic && $theme === self::THEME) {
                $this->setLayout($preferences, 'split');
            }
        }

        $portals = $this->entityManager
            ->getRDBRepository('Portal')
            ->where(['theme' => self::OLD_THEME])
            ->find();

        foreach ($portals as $portal) {
            $portal->set('theme', self::THEME);
            $this->entityManager->saveEntity($portal);

            $portalUsers = $this->entityManager
                ->getRDBRepository('Portal')
                ->getRelation($portal, 'users')
                ->select(['id'])
                ->find();

            foreach ($portalUsers as $user) {
                $preferences = $this->entityManager->getEntityById('Preferences', $user->getId());

                if ($preferences) {
                    $this->setLayout($preferences, 'classic');
                }
            }
        }
    }

    /**
     * Saves the preferences with the layout, unless the user already chose one.
     *
     * @param \Espo\ORM\Entity $preferences
     */
    private function setLayout($preferences, string $layout): void
    {
        if (!$preferences->get(self::LAYOUT)) {
            $preferences->set(self::LAYOUT, $layout);
        }

        if ($preferences->isAttributeChanged('theme') || $preferences->isAttributeChanged(self::LAYOUT)) {
            $this->entityManager->saveEntity($preferences);
        }
    }
}
