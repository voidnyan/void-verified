export const styles = /* css */ `
    a[href="/settings/developer" i]::after{content: " & Void"}
    .void-settings .void-nav ol {
        display: flex;
        margin: 8px 0px;
        padding: 0;
    }

    .void-nav {
        margin-top: 3rem;
    }

    .void-settings .void-nav li {
        list-style: none;
        display: block;
        color: rgb(var(--color-text));
        padding: 4px 8px;
        text-transform: capitalize;
        background: rgb(var(--color-foreground-blue));
        cursor: pointer;
        min-width: 50px;
        text-align: center;
        font-size: 1.4rem;
    }

    .void-settings .void-nav li.void-active,
    .void-settings .void-nav li:hover {
        background: rgb(var(--color-blue));
        color: rgb(var(--color-text-bright));
    }

    .void-settings .void-nav li:first-child {
        border-radius: 4px 0px 0px 4px;
    }

    .void-settings .void-nav li:last-child {
        border-radius: 0px 4px 4px 0px;
    }
    
    .void-settings .void-settings-header {
        margin-top: 30px;
    }

    .void-settings .void-table table {
        border-collapse: collapse;
    }

    .void-settings .void-table :is(th, td) {
        padding: 2px 6px !important;
    }

    .void-settings .void-table :is(th, td):first-child {
        border-radius: 4px 0px 0px 4px;
    }

    .void-settings .void-table :is(th, td):last-child {
        border-radius: 0px 4px 4px 0px;
    }

    .void-settings .void-table tbody tr:hover {
        background-color: rgba(var(--color-foreground-blue), .7);
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

    .void-textarea {
        width: 100%;
        height: 300px;
        min-height: 200px;
        resize: vertical;
        background: rgb(var(--color-foreground-blue));
        color: rgb(var(--color-text));
        padding: 4px;
        border-radius: 4px;
        border: 2px solid transparent;
        outline: none !important;
    }

    .void-textarea:focus {
        border: 2px solid rgb(var(--color-blue)) !important;
    }

    .void-layout-image-container {
        padding: 4px;
        display: inline-block;
    }

    .void-layout-image-container:first-child {
        width: 35%;
    }

    .void-layout-image-container:last-child {
        width: 65%;
    }

    .void-layout-header {
        text-transform: uppercase;
        margin-top: 2.2em;
        margin-bottom: .8em;
    }

    .void-layout-image-display {
        height: 140px;
        background-repeat: no-repeat;
        margin: auto;
        margin-bottom: 6px;
        border-radius: 4px;
    }



    .void-layout-image-display.void-banner {
        width: 100%;
        background-size: cover;
        background-position: 50% 50%;
        background-size: 
    }

    .void-layout-image-display.void-avatar {
        background-size: contain;
        width: 140px;
    }

    .void-layout-image-container input {
        width: 100%;
    }

    .void-layout-color-selection {
        margin-top: 10px;
        margin-bottom: 10px;
    }

    .void-layout-color-selection .void-color-button {
        width: 50px;
        height: 50px;
        display: inline-flex;
        border-radius: 4px;
        margin-right: 10px;
    }

    .void-layout-color-selection .void-color-button.active {
        border: 4px solid rgb(var(--color-text));
    }

    .void-layout-color-selection .void-color-picker-container.active {
        border: 2px solid rgb(var(--color-text));
    }

    .void-color-picker-container {
        display: inline-block;
        vertical-align: top;
        width: 75px;
        height: 50px;
        border: 2px solid transparent;
        border-radius: 4px;
        box-sizing: border-box;
    }

    .void-color-picker-container:has(:focus) {
        border: 2px solid rgb(var(--color-text));
    }

    .void-color-picker-input {
        width: 100%;
        height: 20px;
        background-color: rgba(var(--color-background), .6);
        padding: 1px;
        font-size: 11px;
        color: rgb(var(--color-text));
        outline: none;
        appearance: none;
        -webkit-appearance: none;
        text-align: center;
        border: unset;
        border-radius: 0px 0px 4px 4px;
    }

    .void-color-picker {
        /* width: 100%;;
        height: 50px; */
        block-size: 30px;
        border-width: 0px;
        padding: 0px;
        background-color: unset;
        inline-size: 100%;
        border-radius: 4px;
        appearance: none;
        vertical-align: top;
        padding-block: 0px;
        padding-inline: 0px;
        outline: none;
    }

    .void-color-picker::-webkit-color-swatch,
    .void-color-picker::-moz-color-swatch {
        border: none;
        border-radius: 4px;
    }

    .void-color-picker::-webkit-color-swatch-wrapper,
    .void-color-picker::-webkit-color-swatch-wrapper {
        padding: 0px;
        border-radius: 4px;
    }

    .void-input {
        background-color: rgba(var(--color-background), .6);
        padding: 4px 6px;
        color: rgb(var(--color-text));
        outline: none;
        appearance: none;
        -webkit-appearance: none;
        border: 2px solid transparent;
        border-radius: 4px;
        box-sizing: border-box;
    }

    a.void-link {
        color: rgb(var(--color-blue)) !important;
    }

    .void-input.void-sign {
        width: 75px;
        text-align: center;
        height: 20px;
        font-size: 14px;
    }

    .void-input:focus {
        border: 2px solid rgb(var(--color-blue));
    }

    .void-button {
        align-items: center;
        background: rgb(var(--color-blue));
        border-radius: 4px;
        color: rgb(var(--color-text-bright));
        cursor: pointer;
        display: inline-flex;
        font-size: 1.3rem;
        padding: 10px 15px;
        outline: none;
        appearance: none;
        -webkit-appearance: none;
        border: 0px solid rgb(var(--color-background));
        vertical-align: top;
        margin-top: 15px;
        margin-right: 10px;
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

    .void-quick-access-badge {
        position: relative;
    }

    .void-quick-access-badge::after {
        content: "New";
        background: rgb(var(--color-blue));
        border-radius: 10px;
        padding: 2px 4px;
        font-size: 9px;
        position: absolute;
        top: 2px;
        right: -10px;
        color: white;
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

    .void-upload-in-progress {
        cursor: wait;
    }
`;
