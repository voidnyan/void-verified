export const styles = /* css */ `
    :root {
        --void-info: 46, 149, 179;
        --void-error: 188, 53, 46;
        --void-success: 80, 162, 80;
        --void-warning: 232, 180, 2;
    }


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

    .void-setting-label {
        padding-left: 6px;
        vertical-align: middle;
        cursor: pointer;
    }

    .void-setting-label-container .void-checkbox {
        vertical-align: middle;
    }

    .void-checkbox {
        cursor: pointer;
    }
    

    .void-settings .void-settings-list input.void-input {
        width: 50px;
        text-align: center;
        height: 20px;
        font-size: 12px;
    }

    .void-settings .void-settings-list label {
        padding-left: 8px;
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

    .void-action-container {
        display: inline-block;
        width: fit-content;
    }

    .void-action-container .void-icon-button {
        padding: 6px 8px;
        margin: 0px;
        background: rgb(var(--color-foreground-blue-dark));
        color: rgb(var(--color-text));
        border-radius: 0px 4px 4px 0px;
        height: 100%;
        display: inline-flex;
        flex-direction: column;
        justify-content: center;
        border: 2px solid transparent;
        border-left: 0px !important;
        line-height: 1.15;
        box-sizing: border-box;
        vertical-align: top;
    }

    .void-action-container .void-icon-button:hover {
        color: rgb(var(--color-blue));
    }

    .void-action-container .void-icon-button svg {
        height: 14px;
    }

    .void-action-container .void-input {
        border-radius: 4px 0px 0px 4px;
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

    .void-icon-button {
        display: inline-block;
        cursor: pointer;
        margin-left: 4px;
        margin-right: 4px;
        vertical-align: middle;
    }

    .void-icon-button svg {
        height: 12px;
        vertical-align: middle;
        display: inline-block;
        pointer-events: none;
    }

    .void-range-container {
        display: inline-flex;
    }

    .void-range-display {
        margin-left: 5px;
        user-select: none;
        font-size: 14px;
        font-weight: bold;
        display: inline-flex;
        justify-content: center;
        align-items: center;
        min-width: 25px;
    }

    .void-gif-button svg {
        height: 18px;
        vertical-align: top;
        color: rgb(var(--color-red));
    }

    .void-gif-button:hover svg {
        color: rgb(var(--color-blue));
    }

    .void-gif-button {
        margin: 0px;
    }

    .markdown-editor[style*="display: none;"] + .void-gif-keyboard-container {
        display: none;
    }

    .void-gif-keyboard-container {
        width: 100%;
        background: rgb(var(--color-foreground));
        margin-bottom: 12px;
        border-radius: 4px;
    }

    .void-gif-keyboard-header {
        background: rgb(var(--color-foreground-grey-dark));
        padding: 12px 20px;
        border-radius: 4px 4px 0px 0px;
        display: flex;
        justify-content: space-between;
    }

    .void-gif-keyboard-control-container {
        display: flex;
        justify-content: space-between;
        padding: 12px 12px 0px 12px;
    }

    .void-gif-keyboard-list-container {
        height: 300px;
        min-height: 200px;
        max-height: 500px;
        overflow-y: scroll;
        resize: vertical;
        user-select: none;
    }

    .void-gif-keyboard-list {
        padding: 12px 20px;
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 8px;
    }

    .void-gif-keyboard-list-column {
        width: calc(100% / 3);
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .void-gif-keyboard-list-placeholder {
        font-size: 20px;
        color: rgb(var(--color-text));
        display: flex;
        height: 220px;
        width: 100%;
        justify-content: center;
        align-items: center;
        user-select: none;
    }

    .void-gif-keyboard-item img {
        width: 100%;
        background-size: contain;
        background-repeat: no-repeat;
        border-radius: 4px;
        cursor: pointer;
        display: block;

    }

    .void-gif-like-container {
        position: relative;
        width: 100%;
        display: inline-block;
    }

    .void-gif-like-container img {
        width: 100%;
    }

    .void-gif-like-container .void-gif-like {
        position: absolute;
        top: 6px;
        right: 6px;
        height: 20px;
        opacity: 0;
        transition: 0.2s ease-in all;
        color: rgb(var(--color-text-bright));
    }

    .void-gif-like-container:hover .void-gif-like {
        opacity: 1;
    }

    .void-gif-like-container .void-gif-like svg {
        height: 24px;
    }

    .void-gif-like-container .void-gif-like.void-liked,
    .void-liked {
        color: rgb(var(--color-red));
    }

    .void-hidden {
        display: none;
    }

    .void-pagination-container .void-icon-button.void-active,
    .void-pagination-container .void-icon-button:hover {
        color: rgb(var(--color-blue));
    }

    .void-pagination-container .void-icon-button.void-pagination-skip {
        vertical-align: top;
    }

    .void-quick-access {
        display: flex;
        flex-direction: column;
    }
    
    .void-quick-access .void-quick-access-wrap {
        background: rgb(var(--color-foreground));
        display: grid;
        grid-template-columns: repeat(auto-fill, 60px);
        grid-template-rows: repeat(auto-fill, 80px);
        gap: 15px;
        padding: 15px;
        margin-bottom: 25px;
        border-radius: 4px;
    }

    .void-quick-access .void-quick-access-notifications-wrapper {
        order: 2;
        margin-bottom: 25px;
    }

    .void-quick-access .void-quick-access-notifications {
        background: rgb(var(--color-foreground));
        overflow-y: auto;
        max-height: 300px;
        scrollbar-width: thin;
        scrollbar-color: rgb(var(--color-blue)) rgba(0, 0, 0, 0);
        border-radius: 4px;
        transition: max-height 0.5s;
    }

    .void-notifications-config-wrapper {
        padding: 15px;
    }

    .void-notifications-list {
        padding: 15px;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .void-quick-access-notifications[collapsed="true"] {
        max-height: 0px;
    }

    .void-quick-access-notifications-wrapper .section-header h2 {
        cursor: pointer;
    }
    
    .void-quick-access .section-header {
        display: flex;
        justify-content: space-between;
    }

    .void-quick-access-timer {
        font-size: 12px;
        color: rgb(var(--color-text));
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
        border: 3px solid rgb(var(--color-foreground));
        border-radius: 10px;
        padding: 2px 4px;
        font-size: 9px;
        position: absolute;
        top: 2px;
        right: -10px;
        color: white;
    }

    .void-notification-wrapper {
        display: flex;
        gap: 6px;
    }

    .void-notification-wrapper .void-notification-preview {
        width: 30px;
        height: 30px;
        display: inline-block;
        background-size: contain;
        background-repeat: no-repeat;
        background-position: 50% 50%;
        margin-right: 6px;
        border-radius: 4px;
        position: relative;
    }

    .void-notification-wrapper .void-notification-preview.void-notification-preview-media {
        width: 22px;
        height: 30px;
        background-size: cover;
    }

    .void-notification-wrapper .void-notification-preview[data-count]::after {
        content: attr(data-count);
        background: rgb(var(--color-blue));
        border: 3px solid rgb(var(--color-foreground));
        border-radius: 10px;
        padding: 2px 4px;
        font-size: 9px;
        position: absolute;
        top: -6px;
        right: -10px;
        color: white;
    }

    .void-notification-preview-wrapper {
        position: relative;
    }
    
    .void-notification-preview-wrapper:hover .void-notification-group,
    .void-notification-group:hover {
        display: flex;
    }

    .void-notification-group {
        display: none;
        position: absolute;
        top: -30px;
        z-index: 20;
        background: rgb(var(--color-foreground));
        border-radius: 4px;
    }

    .void-notification-wrapper:first-child .void-notification-group {
        top: unset;
        bottom: -30px;
    }

    .void-notification-group .void-notification-group-item {
        display: block;
        width: 30px;
        height: 30px;
        background-size: contain;
        background-repeat: no-repeat;
        background-position: 50% 50%;
        z-index: 20;
    }

    .void-notification-wrapper {
        display: flex;
        align-items: center;
    }

    .void-notification-wrapper .void-notification-context .void-notification-context-actor {
        color: rgb(var(--color-blue));
    }

    .void-notification-context-reason {
        font-size: 12px;
        padding-top: 2px;
    }

    .void-notification-wrapper .void-notification-timestamp {
        font-size: 10px;
        margin-left: auto;
        align-self: start;
        min-width: fit-content;
    }

    .void-notification-settings-header {
        margin-bottom: 8px;
    }

    .void-notification-type-list-header {
        font-size: 16px;
        margin: 8px 0 4px 0;
    }

    .void-chip {
        background: rgb(var(--color-blue));
        border-radius: 9999px;
        display: inline-block;
        padding: 2px 4px;
        font-size: 9px;
        color: white;
        margin: 0px 4px;
        vertical-align: top;
        user-select: none;
    }

    .void-notice {
        font-size: 11px;
        margin-top: 5px;
    }

    .void-select {
        display: inline-flex;
        flex-wrap: wrap;
    }

    .void-select .void-option {
        padding: 3px 8px;
        background: rgb(var(--color-foreground-blue));
        font-size: 12px;
        cursor: pointer;
        user-select: none;
    }

    .void-select .void-option:hover {
        background: rgb(var(--color-foreground-blue-dark));
        color: rgb(var(--color-text));
    }

    .void-select .void-option:first-child {
        border-radius: 4px 0px 0px 4px;
    }

    .void-select .void-option:last-child {
        border-radius: 0px 4px 4px 0px;
    }

    .void-select .void-option.active {
        background: rgb(var(--color-blue));
        color: rgb(var(--color-text-bright));
    }

    .void-label-container {
        margin-top: 6px;
        margin-bottom: 6px;
    }

    .void-label-span {
        margin-right: 10px;
        min-width: 200px;
        display: inline-block;
    }

    .void-upload-in-progress {
        cursor: wait !important;
    }

    body:has(.void-modal-background[open]) {
        overflow: hidden;
    }

    .void-modal-background[open] {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: 9999;
        backdrop-filter: brightness(50%);
        background: transparent;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .void-modal {
        background: rgb(var(--color-foreground));
        color: rgb(var(--color-text));
        border-radius: 4px;
        min-width: 500px;
        padding: 0;
        margin: 0;
        border-width: 0px;
    }

    .void-modal-header {
        width: 100%;
        background: rgb(var(--color-background));
        padding: 12px;
        border-radius: 4px 4px 0px 0px;
        display: flex;
        justify-content: space-between;
        font-weight: 700;
    }

    .void-modal-header .void-icon-button {
        color: rgb(var(--color-red));
        height: 20px;
    }

    .void-modal-content {
        padding: 12px;
        max-height: 500px;
        overflow-y: scroll;
    }

    .void-change-log-header {
        margin: 4px 0px;
    }

    .void-change-log-note {
        margin-bottom: 16px;
    }

    .void-change-log-list {
        list-style: none;
        gap: 5px;
        padding-left: 20px;
    }

    .void-change-log-list li:not(:last-child) { 
        margin-bottom: 4px;  
    }

    .void-change-log-list-item span:first-child {
        text-align: center;
        width: 13px;
        display: inline-block;
    }

    .void-change-log-list-item span:last-child {
        margin-left: 6px;
    }

    .void-tooltip-container:has(input) {
        display: inline-block;
    }

    .void-tooltip-container {
        position: relative;
    }

    .void-tooltip {
        position: absolute;
        text-align: center;
        top: -8px;
        left: 50%;
        transform: translate(-50%, -100%);
        font-size: 12px;
        padding: 4px 6px;
        background: rgb(var(--color-foreground-blue));
        border-radius: 4px;
        width: max-content;
        max-width: 200px;
        visibility: hidden;
        z-index: 3000;
    }

    .void-tooltip-container:hover .void-tooltip {
        visibility: visible;
    }

    .void-tooltip-container:hover .void-tooltip:after {
        content: "";
        position: absolute;
        top: 100%;
        left: 50%;
        margin-left: -5px;
        border-width: 5px;
        border-style: solid;
        border-color: rgb(var(--color-foreground-blue)) transparent transparent transparent;
    }

    .void-button.void-self-message {
        margin-top: 0;
        margin-right: 0;
        margin-left: 18px;
        font-family: inherit;
        font-weight: 900;
    }

    .activity-edit .rules-notice {
        display: block;
    }

    #void-toast-container {
        position: fixed;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    #void-toast-container.void-bottom-left {
        bottom: 10px;
        left: 10px;
        flex-direction: column-reverse;
    }

    #void-toast-container.void-bottom-right {
        bottom: 10px;
        right: 10px;
        flex-direction: column-reverse;
    }

    #void-toast-container.void-top-left {
        top: 70px;
        left: 10px;
    }

    #void-toast-container.void-top-right {
        top: 70px;
        right: 10px;
    }

    .void-toast {
        font-size: 14px;
        color: rgb(var(--color-text-bright));
        min-width: 150px;
        max-width: 300px;
        min-heigth: 50px;
        padding: 10px 8px;
        border-radius: 4px;
    }

    .void-info {
        background: rgb(var(--void-info));
    }

    .void-success {
        background: rgb(var(--void-success));
    }

    .void-error {
        background: rgb(var(--void-error));
    }

    .void-warning {
        background: rgb(var(--void-warning));
    }
    .
`;
