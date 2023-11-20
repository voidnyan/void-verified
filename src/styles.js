export const styles = `
    .void-settings .void-nav ol {
        display: flex;
    }

    .void-settings .void-nav li {
        list-style: none;
        display: block;
        color: rgb(--color-text);
        padding: 3px 8px;
        text-transform: capitalize;
        background: black;
        cursor: pointer;
        min-width: 50px;
        text-align: center;
        font-size: 1.3rem;
    }

    .void-settings .void-nav li.void-active {
        background: rgb(var(--color-blue));
    }

    .void-settings .void-nav li:first-child {
        border-radius: 4px 0px 0px 4px;
    }

    .void-settings .void-nav li:last-child {
        border-radius: 0px 4px 4px 0px;
    }
    
    .void-settings .void-nav li:hover {
        background: rgb(var(--color-blue));
    }
`;
