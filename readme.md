<img src="https://raw.githubusercontent.com/Pauwris/efficy-enterprise-api/master/assets/efficy-crm-logo.svg" style="width:18rem">

# Efficy Enterprise API

## Introduction

The Efficy Enterprise API is developed for server-side usage in a [Node.js](https://nodejs.org/en/) environment (e.g. for integrations) and also bundled for usage inside an Efficy browser session for client-side JSON RPC requests.


## Node.js instructions

In your Node.js project, first install the [efficy-enterprise-api](https://www.npmjs.com/package/efficy-enterprise-api) npm package.

```powershell
npm i efficy-enterprise-api
```

Inside [Node.js](https://nodejs.org/en/)
```javascript
import { CrmEnv, CrmRpc} from "efficy-enterprise-api";

const crm = new CrmRpc(crmEnv); // See CrmEnv class
const compSearch = crm.search("comp", "SEARCHFAST", "Efficy");
await crm.executeBatch();

// Debug output
compSearch.items; // An array of row items
```

## Efficy in browser instructions

Switch and use the [efficy-enterprise-browser](https://www.npmjs.com/package/efficy-enterprise-api-browser) npm package.


## Get started

Consult the [github-pages](https://pauwris.github.io/efficy-enterprise-api/) documentation

----------
(2022) authored by Kristof Pauwels