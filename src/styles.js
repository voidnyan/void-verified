export const styles = /* css */ `
    a[href="/settings/developer" i]::after{content: " & Void"}
    .void-settings .void-nav ol {
        display: flex;
        margin: 8px 0px;
        padding: 0;
    }

    .void-settings .void-nav li {
        list-style: none;
        display: block;
        color: white;
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

    .void-settings .void-settings-header {
        margin-top: 30px;
    }

    .void-settings .void-table input[type="text"] {
        width: 100px;
    }
    .void-settings .void-table input[type="color"] {
        border: 0;
        height: 24px;
        width: 40px;
        padding: 0;
        background-color: unset;
        cursor: pointer;
    }

    .void-settings .void-table input[type="checkbox"] {
        margin-left: 3px;
        margin-right: 3px;
    }

    .void-settings .void-table button {
        background: unset;
        border: none;
        cursor: pointer;
        padding: 0;
    }

    .void-settings .void-table form {
        padding: 8px;
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .void-settings .void-settings-header span {
        color: rgb(var(--color-blue));
    }

    .void-settings .void-settings-list {
        display: flex;
        flex-direction: column;
        gap: 5px;
    }

    .void-settings .void-settings-list input[type="color"] {
        border: 0;
        height: 20px;
        width: 25px;
        padding: 0;
        background-color: unset;
        cursor: pointer;
    }

    .void-settings .void-settings-list input[type="text"] {
        width: 50px;
    }

    .void-settings .void-settings-list label {
        margin-left: 5px;
    }

    .void-settings .void-css-editor label {
        margin-top: 20px;
        fontSize: 2rem;
        display: inline-block;
    }

    .void-settings .void-css-editor textarea {
        width: 100%;
        height: 200px;
        resize: vertical;
        background: rgb(var(--color-foreground));
        color: rgb(var(--color-text));
    }
    
    .void-quick-access .void-quick-access-wrap {
        background: rgb(var(--color-foreground));
        display: grid;
        grid-template-columns: repeat(auto-fill, 60px);
        grid-template-rows: repeat(auto-fill, 80px);
        gap: 15px;
        padding: 15px;
        margin-bottom: 25px;
    }

    .void-quick-access-item {
        display: inline-block;
    }

    .void-quick-access-pfp {
        background-size: contain;
        background-repeat: no-repeat;
        height: 60px;
        width: 60px;
        border-radius: 4px;
    }

    .void-quick-access-username {
        display: inline-block;
        text-align: center;
        bottom: -20px;
        width: 100%;
        word-break: break-all;
        font-size: 1.2rem;
    }

    .void-api-label {
        margin-right: 5px;
    }

    .void-api-key {
        width: 300px;
    }

    .void-notice {
        font-size: 11px;
        margin-top: 5px;
    }

    #void-upload-in-progess {
        cursor: wait;
    }
`;
