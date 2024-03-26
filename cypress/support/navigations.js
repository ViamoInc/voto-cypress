const Category = Object.freeze({
    CONTACT: "[data-test='nav-main-menu-item--contacts']",
    CONTENT: "[data-test='nav-main-menu-item--content']",
    CAMPAIGN: "[data-test='nav-main-menu-item--campaigns']",
    APPS: "[data-test='nav-main-menu-item--apps']",
    LANGUAGE: "[data-test='nav-main-menu-item--languages']",
    ORGANISATION: "[data-test='nav-main-menu-item--organisations']",
    ACCOUNT: "[data-test='nav-main-menu-item--settings']"
});

export const ContentNavigation = Object.freeze({
    TREE: {
        categoryLinkSelector: Category.CONTENT,
        linkSelector: "[data-test='nav-menu-item--trees-and-flows']"
    },
    ADD_TREE: {
        categoryLinkSelector: Category.CONTENT,
        linkSelector: "[data-test='nav-menu-item-action--create-tree']"
    },
    MESSAGE: {
        categoryLinkSelector: Category.CONTENT,
        linkSelector: "[data-test='nav-menu-item--messages-management']"
    },
    ADD_MESSAGE: {
        categoryLinkSelector: Category.CONTENT,
        linkSelector: "[data-test='nav-menu-item-action--new-message']"
    },
    PLACEHOLDER: {
        categoryLinkSelector: Category.CONTENT,
        linkSelector: "[data-test='nav-menu-item--placeholders-management']"
    },
    SURVEYS: {
        categoryLinkSelector: Category.CONTENT,
        linkSelector: "[data-test='nav-menu-item--surveys-management']"
    },
    AUDIO: {
        categoryLinkSelector: Category.CONTENT,
        linkSelector: "[data-test='nav-menu-item--audio-library-management']"
    },
    ADD_AUDIO: {
        categoryLinkSelector: Category.CONTENT,
        linkSelector: "[data-test='nav-menu-item-action--upload-audio-file']"
    },
    LANGUAGE_SELECTORS: {
        categoryLinkSelector: Category.CONTENT,
        linkSelector: "[data-test='nav-menu-item--language-selectors-management']"
    },
    RESPONSE_PROMPTS: {
        categoryLinkSelector: Category.CONTENT,
        linkSelector: "[data-test='nav-menu-item--response-prompts-management']"
    },
    CONTENT_RECORDERS: {
        categoryLinkSelector: Category.CONTENT,
        linkSelector: "[data-test='nav-menu-item--content-recorders-management']"
    },
    EXPORTS_LIBRARY: {
        categoryLinkSelector: Category.CONTENT,
        linkSelector: "[data-test='nav-menu-item--exports-management']"
    },
    LANGUAGES: {
        categoryLinkSelector: Category.CONTENT,
        linkSelector: "[data-test='nav-menu-item--languages-config']"
    },
});

export const ContactNavigation = Object.freeze({
    CONTACT: {
        categoryLinkSelector: Category.CONTACT,
        linkSelector: "[data-test='nav-menu-item--contacts']"
    },
    ADD_CONTACT: {
        categoryLinkSelector: Category.CONTACT,
        linkSelector: "[data-test='nav-menu-item-action--create-subscriber']"
    },
    GROUP: {
        categoryLinkSelector: Category.CONTACT,
        linkSelector: "[data-test='nav-menu-item--contact-groups']"
    },
    ADD_GROUP: {
        categoryLinkSelector: Category.CONTACT,
        linkSelector: "[data-test='nav-menu-item-action--contact-groups--add']"
    },
    IMPORT_CONTACT: {
        categoryLinkSelector: Category.CONTACT,
        linkSelector: "[data-test='nav-menu-item--contact--import']"
    },
    EXPORT_CONTACT: {
        categoryLinkSelector: Category.CONTACT,
        linkSelector: "[data-test='nav-menu-item--contact--export']"
    },
    DO_NOT_DISTURB_CONTACT: {
        categoryLinkSelector: Category.CONTACT,
        linkSelector: "[data-test='nav-menu-item--do-not-call-lists']"
    },
    ADD_DO_NOT_DISTURB_CONTACT: {
        categoryLinkSelector: Category.CONTACT,
        linkSelector: "[data-test='nav-menu-item-action--do-not-call-lists--add-phone-manually']"
    },
    IMPORT_DO_NOT_DISTURB_CONTACT: {
        categoryLinkSelector: Category.CONTACT,
        linkSelector: "[data-test='nav-menu-item--do-not-call-lists--import']"
    },
    CONTACT_PROPERTY: {
        categoryLinkSelector: Category.CONTACT,
        linkSelector: "[data-test='nav-menu-item--contact-properties']"
    },
    ADD_CONTACT_PROPERTY: {
        categoryLinkSelector: Category.CONTACT,
        linkSelector: "[data-test='nav-menu-item-action--contact-properties--add']"
    },
});

export const CampaignNavigation = Object.freeze({
    OUTBOUND_CAMPAIGN: {
        categoryLinkSelector: Category.CAMPAIGN,
        linkSelector: "[data-test='nav-menu-item--outgoing--view-all']"
    },
    ADD_OUTBOUND_CAMPAIGN: {
        categoryLinkSelector: Category.CAMPAIGN,
        linkSelector: "[data-test='nav-menu-item--outgoing--create-new']"
    },
    INBOUND_CAMPAIGN: {
        categoryLinkSelector: Category.CAMPAIGN,
        linkSelector: "[data-test='nav-menu-item--incoming--view-all']"
    },
    ADD_INBOUND_CAMPAIGN: {
        categoryLinkSelector: Category.CAMPAIGN,
        linkSelector: "[data-test='nav-menu-item--incoming--create-new']"
    },
    ADD_OUTBOUND_CAMPAIGN_VIA_PLATFORM: {
        categoryLinkSelector: Category.CAMPAIGN,
        linkSelector: "[data-test='nav-menu-item--outbound-via-platform--request']"
    },
    CONTENT_INSERTION: {
        categoryLinkSelector: Category.CAMPAIGN,
        linkSelector: "[data-test='nav-menu-item--content-insertion--request']"
    },
});

export const AppsNavigation = Object.freeze({
    COLLABORATIVE_FILTERING: {
        categoryLinkSelector: Category.APPS,
        linkSelector: "[data-test='nav-menu-item--collaborative-filtering']"
    },
});

export const LanguageNavigation = Object.freeze({
    ENGLISH: {
        categoryLinkSelector: Category.LANGUAGE,
        linkSelector: "[data-test='nav-menu-item--switch-language-en']"
    },
    FRENCH: {
        categoryLinkSelector: Category.LANGUAGE,
        linkSelector: "[data-test='nav-menu-item--switch-language-fr']"
    },
});

export const accountNavigation = Object.freeze({
    USER_SETTINGS: {
        categoryLinkSelector: Category.ACCOUNT,
        linkSelector: "[data-test='nav-menu-item--user-profile']"
    },
    ORGANISATION_SETTINGS: {
        categoryLinkSelector: Category.ACCOUNT,
        linkSelector: "[data-test='nav-menu-section--settings']"
    },
    CREDIT: {
        categoryLinkSelector: Category.ACCOUNT,
        linkSelector: "[data-test='nav-menu-item--credit-settings']"
    },
    ADD_CREDIT: {
        categoryLinkSelector: Category.ACCOUNT,
        linkSelector: "[data-test='nav-menu-item-action--top-up-credit']"
    },
    USERS: {
        categoryLinkSelector: Category.ACCOUNT,
        linkSelector: "[data-test='nav-menu-item--users-settings']"
    },
    ADD_USERS: {
        categoryLinkSelector: Category.ACCOUNT,
        linkSelector: "[data-test='nav-menu-item-action--add-user']"
    },
    USER_GROUP: {
        categoryLinkSelector: Category.ACCOUNT,
        linkSelector: "[data-test='nav-menu-item--user-groups-settings']"
    },
    ADD_USER_GROUP: {
        categoryLinkSelector: Category.ACCOUNT,
        linkSelector: "[data-test='nav-menu-item-action--add-user-group']"
    },
    ROLES: {
        categoryLinkSelector: Category.ACCOUNT,
        linkSelector: "[data-test='nav-menu-item--roles-settings']"
    },
});

