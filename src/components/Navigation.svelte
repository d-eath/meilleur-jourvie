<script>
    import {
        Header,
        HeaderAction,
        HeaderPanelDivider,
        HeaderPanelLink,
        HeaderPanelLinks,
        HeaderNav,
        HeaderUtilities,
        SideNav,
        SideNavItems,
        SideNavLink,
    } from 'carbon-components-svelte'

    import CatalogIcon from 'carbon-icons-svelte/lib/Catalog.svelte'
    import TaskIcon from 'carbon-icons-svelte/lib/Task.svelte'
    import ChartColumnIcon from 'carbon-icons-svelte/lib/ChartColumn.svelte'
    import UserAvatarFilledAltIcon from 'carbon-icons-svelte/lib/UserAvatarFilledAlt.svelte'

    import { get } from 'svelte/store'
    import { location, push } from 'svelte-spa-router'
    import { userInfo } from '../stores/userInfo'

    let isSideNavOpen = false
    let isProfileOpen = false

    function logout() {
        push('/login')

        const currentUserInfo = get(userInfo)

        // avoid guard redirect by deleting loginToken
        delete currentUserInfo.loginToken
        userInfo.set(currentUserInfo)

        // avoid "undefined" world with a delay
        setTimeout(() => { userInfo.set({}) }, 1000)
        
    }
</script>

<Header company="Meilleur" platformName="Jourvie" bind:isSideNavOpen>
    <HeaderNav>
        <li role="none">
            <span class="project-header">
                Projet: <span class="project-name">{$userInfo?.projectName}</span>
            </span>
        </li>
    </HeaderNav>
    <HeaderUtilities>
        <HeaderAction icon={UserAvatarFilledAltIcon} closeIcon={UserAvatarFilledAltIcon} bind:isOpen={isProfileOpen} text="{$userInfo?.firstName} {$userInfo?.lastName}">
            
            <HeaderPanelLinks>
                <li>
                    <div class="profile-summary">
                        <div class="profile-summary-icon">
                            <UserAvatarFilledAltIcon size={32} />
                        </div>
                        <div class="profile-summary-name">
                            {$userInfo?.firstName} {$userInfo?.lastName}
                        </div>
                        <div class="profile-summary-role">
                            {$userInfo?.isCoordinator ? 'Coordinateur' : 'Développeur'}
                        </div>
                    </div>
                </li>
                <HeaderPanelDivider />
                <HeaderPanelLink on:click={logout}>Déconnexion</HeaderPanelLink>
            </HeaderPanelLinks>
        </HeaderAction>
    </HeaderUtilities>
</Header>

<SideNav bind:isOpen={isSideNavOpen} rail>
    <SideNavItems>
        <SideNavLink icon={CatalogIcon} href="#/journal" isSelected={$location === '/journal'} text="Journal" />
        <SideNavLink icon={TaskIcon} href="#/tasks" isSelected={$location === '/tasks'} text="Tâches" />
        <SideNavLink icon={ChartColumnIcon} href="#/stats" isSelected={$location === '/stats'} text="Statistiques" />
    </SideNavItems>
</SideNav>

<style>
    .project-header {
        position: relative;
        display: flex;
        height: 100%;
        align-items: center;
        padding: 0 1rem;
        font-size: .875rem;
        color: #c6c6c6;
        user-select: none;
    }

    .project-name {
        color: #fff;
        font-weight: bold;
        margin-left: .5rem;
    }

    .profile-summary {
        padding: .375rem 1rem;
        margin-bottom: .75rem;

        display: grid;
        grid-template-rows: 1fr 1fr;
        grid-template-columns: auto 1fr;
        gap: 2px 8px;
    }

    .profile-summary-icon {
        grid-row-start: 1;
        grid-column-start: 1;
        grid-row-end: 3;
        grid-column-end: 2;
    }

    .profile-summary-name {
        font-weight: 600;

        grid-row-start: 1;
        grid-column-start: 2;
        grid-row-end: 2;
        grid-column-end: 3;
    }

    .profile-summary-role {
        font-size: .8rem;

        grid-row-start: 2;
        grid-column-start: 2;
        grid-row-end: 3;
        grid-column-end: 3;
    }

    :global(.bx--header-panel--expanded) {
        height: 125px;
    }
</style>